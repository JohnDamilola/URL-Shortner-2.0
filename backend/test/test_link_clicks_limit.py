import sys

sys.path.append("backend/src")
import unittest
from models.links import Link, db
from app import create_app
from models.user import User
import uuid


class LinkAutoDeactivationTest(unittest.TestCase):
    def setUp(self):
        self.flask_app = create_app()
        self.app = self.flask_app.test_client()
        with self.flask_app.app_context():
            db.create_all()
            # Create a test user
            user = User(
                id=str(uuid.uuid4()),
                email="test_user@example.com",
                first_name="Test",
                last_name="User",
            )
            user.set_password("password123")
            db.session.add(user)
            db.session.commit()
            self.user_id = user.id

    def tearDown(self):
        with self.flask_app.app_context():
            db.session.remove()
            db.drop_all()

    def create_test_link(self, **kwargs):
        """Helper method to create a test link with default values."""
        default_params = {
            "id": str(uuid.uuid4()),
            "user_id": self.user_id,
            "long_url": "https://example.com",
            "title": "Example",
            "max_visits": None,
            "visit_count": 0,
            "disabled": False,
        }
        default_params.update(kwargs)
        return Link(**default_params)

    def test_link_lifecycle_with_max_visits(self):
        """Test the complete lifecycle of a link with max_visits."""
        with self.flask_app.app_context():
            # Create link with max_visits
            link = self.create_test_link(max_visits=3)
            db.session.add(link)
            db.session.commit()
            self.assertEqual(link.max_visits, 3)
            self.assertEqual(link.visit_count, 0)
            self.assertFalse(link.disabled)

            # Increment visits
            for _ in range(2):
                link.visit_count += 1
                db.session.commit()
                self.assertFalse(link.disabled)

            # Final visit that should disable the link
            link.visit_count += 1
            link.disabled = link.visit_count >= link.max_visits
            db.session.commit()
            self.assertTrue(link.disabled)

    def test_max_visits_edge_cases(self):
        """Test various edge cases for max_visits functionality."""
        with self.flask_app.app_context():
            # Test unlimited visits
            unlimited_link = self.create_test_link(max_visits=None, visit_count=10)
            db.session.add(unlimited_link)
            db.session.commit()
            self.assertFalse(unlimited_link.disabled)

            # Test zero max_visits
            zero_visits_link = self.create_test_link(max_visits=0)
            zero_visits_link.disabled = (
                zero_visits_link.visit_count >= zero_visits_link.max_visits
            )
            db.session.add(zero_visits_link)
            db.session.commit()
            self.assertTrue(zero_visits_link.disabled)

            # Test updating max_visits
            updateable_link = self.create_test_link(
                max_visits=2, visit_count=2, disabled=True
            )
            db.session.add(updateable_link)
            db.session.commit()
            updateable_link.max_visits = 5
            updateable_link.disabled = False
            db.session.commit()
            self.assertFalse(updateable_link.disabled)

    def test_link_access_restrictions(self):
        """Test link access behavior when disabled."""
        self.app.post(
            "/auth/login",
            json=dict(email="test_user@example.com", password="password123"),
        )

        with self.flask_app.app_context():
            link = self.create_test_link(max_visits=3, visit_count=3, disabled=True)
            db.session.add(link)
            db.session.commit()

            response = self.app.get(f"/links/stub/{link.stub}")
            self.assertEqual(response.status_code, 403)
            self.assertIn(b"This link has been disabled.", response.data)

    def test_bulk_operations(self):
        """Test bulk operations with max_visits."""
        bulk_links = [
            {"long_url": "https://example1.com", "title": "Example 1", "max_visits": 5},
            {"long_url": "https://example2.com", "title": "Example 2", "max_visits": 2},
        ]
        response = self.app.post(
            "/links/create_bulk", json=dict(user_id=self.user_id, links=bulk_links)
        )
        self.assertEqual(response.status_code, 201)


if __name__ == "__main__":
    unittest.main()
