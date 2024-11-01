import unittest
from app import create_app
from models.user import User
from models.links import Link, db
from routes.links import create_unique_stub


class TestBulkLinkCreation(unittest.TestCase):
    def setUp(self):
        """Set up test client and create test user for authentication."""
        self.app = create_app().test_client()
        self.app.testing = True
        # Register and log in test user
        test_user_data = {
            "email": "test_bulk@gmail.com",
            "first_name": "Test",
            "last_name": "Bulk",
            "password": "password",
        }
        self.app.post("/auth/register", json=test_user_data)
        self.app.post(
            "/auth/login",
            json={
                "email": test_user_data["email"],
                "password": test_user_data["password"],
            },
        )
        self.user = User.query.filter_by(email=test_user_data["email"]).first()

    def test_create_unique_stub(self):
        """Test unique stub generation without database duplicates."""
        stubs = set()
        for _ in range(10):
            stub = create_unique_stub()
            self.assertNotIn(stub, stubs)
            stubs.add(stub)
            self.assertIsNone(Link.query.filter_by(stub=stub).first())

    def test_bulk_create_links_success(self):
        """Test successful bulk link creation."""
        test_data = {
            "links": [
                {"long_url": "https://example1.com", "title": "Example 1"},
                {"long_url": "https://example2.com", "title": "Example 2"},
            ]
        }
        response = self.app.post(
            "/links/create_bulk",
            json=test_data,
            query_string={"user_id": self.user.id},
        )
        self.assertEqual(response.status_code, 201)
        response_data = response.get_json()
        self.assertEqual(len(response_data["links"]), 2)
        self.assertEqual(response_data["message"], "Bulk link creation successful")

    def test_bulk_create_missing_title(self):
        """Ensure creation fails if a required title is missing in the payload."""
        test_data = {"links": [{"long_url": "https://example.com"}]}
        response = self.app.post(
            "/links/create_bulk",
            json=test_data,
            query_string={"user_id": self.user.id},
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("Long URL and title are required", response.get_json()["message"])

    def test_bulk_create_invalid_json_format(self):
        """Test for invalid JSON structure in request payload."""
        test_data = {"incorrect_key": []}
        response = self.app.post(
            "/links/create_bulk",
            json=test_data,
            query_string={"user_id": self.user.id},
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("No links data found", response.get_json()["message"])

    def test_bulk_create_with_existing_stub(self):
        """Ensure stubs are unique, even if identical stubs are requested."""
        test_data = {
            "links": [{"long_url": "https://unique-stub.com", "title": "Unique Stub"}]
        }
        self.app.post(
            "/links/create_bulk",
            json=test_data,
            query_string={"user_id": self.user.id},
        )
        link = Link.query.filter_by(long_url="https://unique-stub.com").first()
        # Create another link to check unique stub generation
        response = self.app.post(
            "/links/create_bulk",
            json=test_data,
            query_string={"user_id": self.user.id},
        )
        self.assertEqual(response.status_code, 201)
        new_link = Link.query.filter_by(long_url="https://unique-stub.com").first()
        self.assertNotEqual(link.stub, new_link.stub)

    def test_bulk_create_with_expiration(self):
        """Test bulk creation with expiration date set for each link."""
        test_data = {
            "links": [
                {
                    "long_url": "https://expirable.com",
                    "title": "Expirable Link",
                    "expire_on": "2024-12-31T23:59:59",
                }
            ]
        }
        response = self.app.post(
            "/links/create_bulk",
            json=test_data,
            query_string={"user_id": self.user.id},
        )
        self.assertEqual(response.status_code, 201)
        link = Link.query.filter_by(long_url="https://expirable.com").first()
        self.assertIsNotNone(link.expire_on)

    def test_bulk_create_with_disabled_links(self):
        """Test creating links in bulk with some links disabled initially."""
        test_data = {
            "links": [
                {
                    "long_url": "https://disabled1.com",
                    "title": "Disabled Link 1",
                    "disabled": True,
                },
                {
                    "long_url": "https://enabled1.com",
                    "title": "Enabled Link 1",
                    "disabled": False,
                },
            ]
        }
        response = self.app.post(
            "/links/create_bulk",
            json=test_data,
            query_string={"user_id": self.user.id},
        )
        self.assertEqual(response.status_code, 201)
        disabled_link = Link.query.filter_by(long_url="https://disabled1.com").first()
        enabled_link = Link.query.filter_by(long_url="https://enabled1.com").first()
        self.assertTrue(disabled_link.disabled)
        self.assertFalse(enabled_link.disabled)

    def test_bulk_create_links_utm_parameters(self):
        """Test if UTM parameters are correctly stored during bulk link creation."""
        test_data = {
            "links": [
                {
                    "long_url": "https://utm.com",
                    "title": "UTM Test",
                    "utm_source": "source",
                    "utm_medium": "medium",
                    "utm_campaign": "campaign",
                }
            ]
        }
        response = self.app.post(
            "/links/create_bulk",
            json=test_data,
            query_string={"user_id": self.user.id},
        )
        self.assertEqual(response.status_code, 201)
        link = Link.query.filter_by(long_url="https://utm.com").first()
        self.assertEqual(link.utm_source, "source")
        self.assertEqual(link.utm_medium, "medium")
        self.assertEqual(link.utm_campaign, "campaign")

    def test_bulk_create_with_password_protection(self):
        """Test bulk creation with password-protected links."""
        test_data = {
            "links": [
                {
                    "long_url": "https://protected.com",
                    "title": "Password Protected",
                    "password_hash": "hashed_password",
                }
            ]
        }
        response = self.app.post(
            "/links/create_bulk",
            json=test_data,
            query_string={"user_id": self.user.id},
        )
        self.assertEqual(response.status_code, 201)
        link = Link.query.filter_by(long_url="https://protected.com").first()
        self.assertEqual(link.password_hash, "hashed_password")

    def test_bulk_create_duplicate_long_url(self):
        """Test if creating duplicate long URLs in bulk is handled correctly."""
        test_data = {
            "links": [
                {"long_url": "https://duplicate.com", "title": "Duplicate Link 1"},
                {"long_url": "https://duplicate.com", "title": "Duplicate Link 2"},
            ]
        }
        response = self.app.post(
            "/links/create_bulk",
            json=test_data,
            query_string={"user_id": self.user.id},
        )
        self.assertEqual(response.status_code, 201)
        links = Link.query.filter_by(long_url="https://duplicate.com").all()
        self.assertEqual(len(links), 2)
        self.assertNotEqual(links[0].stub, links[1].stub)

    def tearDown(self):
        """Clean up test database."""
        db.session.query(Link).filter_by(user_id=self.user.id).delete()
        db.session.query(User).filter_by(email="test_bulk@gmail.com").delete()
        db.session.commit()


if __name__ == "__main__":
    unittest.main()
