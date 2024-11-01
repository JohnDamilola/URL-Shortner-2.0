import random
from operator import and_
from flask import Blueprint, jsonify, redirect, request
from flask_cors import cross_origin
from string import ascii_letters, digits
from models.links import Link, db, load_link
from models.links_anonymous import AnonymousLink
from models.user import User, login_required2
from models.engagements import Engagements

links_bp = Blueprint("links_bp", __name__)


# Utility Functions
def create_stub(length=12):
    """Generates a random stub of specified length."""
    chars = ascii_letters + digits
    return "".join(random.choices(chars, k=length))


def create_unique_stub(length=6):
    """Generates a unique stub that doesn't exist in the database."""
    while True:
        stub = create_stub(length)
        if not Link.query.filter_by(stub=stub).first():
            return stub


def validate_link_data(data, require_all=False):
    """Validates link data for creation/update."""
    if require_all and not all(key in data for key in ["long_url", "title"]):
        return False, (
            jsonify(message="Long URL and title are required", status=400),
            400,
        )
    elif not require_all and not data.get("long_url"):
        return False, (jsonify(message="Long URL is required", status=400), 400)
    return True, None


def create_link_object(user_id, data, is_anonymous=False):
    """Creates a Link or AnonymousLink instance from data."""
    LinkClass = AnonymousLink if is_anonymous else Link
    link_data = {
        "stub": data.get("stub") or create_unique_stub(),
        "long_url": data["long_url"],
    }

    if not is_anonymous:
        link_data.update(
            {
                "user_id": user_id,
                "title": data.get("title"),
                "disabled": data.get("disabled"),
                "utm_source": data.get("utm_source"),
                "utm_medium": data.get("utm_medium"),
                "utm_campaign": data.get("utm_campaign"),
                "utm_term": data.get("utm_term"),
                "utm_content": data.get("utm_content"),
                "password_hash": data.get("password_hash"),
                "expire_on": data.get("expire_on"),
                "max_visits": data.get("max_visits"),
            }
        )

    return LinkClass(**link_data)


def update_link_attributes(link, data):
    """Updates link attributes if they exist in data."""
    updatable_fields = [
        "stub",
        "long_url",
        "title",
        "disabled",
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_content",
        "utm_term",
        "password_hash",
        "expire_on",
        "max_visits",
    ]

    for field in updatable_fields:
        if field in data:
            setattr(link, field, data[field])


def get_user_links(user_id):
    """Fetches all links for a given user."""
    return db.session.query(Link).join(User).filter(User.id == user_id).all()


def get_user_stats(user_id):
    """Fetches link statistics for a user."""
    return {
        "total_count": db.session.query(Link)
        .join(User)
        .filter(User.id == user_id)
        .count(),
        "total_enabled": db.session.query(Link)
        .join(User)
        .filter(and_(User.id == user_id, Link.disabled.is_(False)))
        .count(),
        "total_disabled": db.session.query(Link)
        .join(User)
        .filter(and_(User.id == user_id, Link.disabled.is_(True)))
        .count(),
        "total_engagements": db.session.query(Engagements)
        .join(Link)
        .filter(Link.user_id == user_id)
        .count(),
    }


def create_engagement(link_id, data):
    """Creates a new engagement record."""
    engagement = Engagements(
        link_id=link_id,
        utm_source=data.get("utm_source"),
        utm_medium=data.get("utm_medium"),
        utm_campaign=data.get("utm_campaign"),
        utm_term=data.get("utm_term"),
        utm_content=data.get("utm_content"),
    )
    db.session.add(engagement)
    return engagement


# Route Handlers
@links_bp.route("/links/<id>", methods=["GET"])
@cross_origin(supports_credentials=True)
def get_link(id):
    """Fetches a single link by ID."""
    try:
        link = Link.query.get(id)
        if not link:
            return jsonify(message="Link not found", status=404), 404

        return jsonify(
            link=link.to_json(), message="Fetched link successfully", status=200
        ), 200
    except Exception as e:
        return jsonify(message=f"An error occurred: {str(e)}", status=400), 400


@links_bp.route("/links/stub/<stub>", methods=["GET"])
@cross_origin(supports_credentials=True)
def get_link_by_stub(stub):
    """Fetches a single link using the stub."""
    try:
        link = db.session.query(Link).filter(Link.stub == stub).first()
        if not link:
            return jsonify(message="Link not found", status=404), 404

        return jsonify(
            link=link.to_json(), message="Fetched link successfully", status=200
        ), 200
    except Exception as e:
        return jsonify(message=f"An error occurred: {str(e)}", status=400), 400


@links_bp.route("/links_anonymous/stub/<stub>", methods=["GET"])
@cross_origin(supports_credentials=True)
def get_anonymous_link_by_stub(stub):
    """Fetches a single anonymous link using the stub."""
    try:
        link = (
            db.session.query(AnonymousLink).filter(AnonymousLink.stub == stub).first()
        )
        if not link:
            return jsonify(message="Link not found", status=404), 404

        return jsonify(
            link=link.to_json(), message="Fetched link successfully", status=200
        ), 200
    except Exception as e:
        return jsonify(message=f"An error occurred: {str(e)}", status=400), 400


@links_bp.route("/links/all", methods=["GET"])
@login_required2()
@cross_origin(supports_credentials=True)
def get_all_links():
    """Fetches all links for an authenticated user."""
    try:
        user_id = request.args.get("user_id")
        if not user_id:
            return jsonify(message="User ID is required", status=400), 400

        links = get_user_links(user_id)
        return jsonify(
            links=[link.to_json() for link in links],
            message="Fetching links successfully",
            status=200,
        ), 200
    except Exception as e:
        return jsonify(message=f"An error occurred: {str(e)}", status=400), 400


@links_bp.route("/links/create", methods=["POST"])
@login_required2()
@cross_origin(supports_credentials=True)
def create():
    """Creates a new link for an authenticated user."""
    try:
        user_id = request.args.get("user_id")
        if not user_id:
            return jsonify(message="User ID is required", status=400), 400

        data = request.get_json()
        is_valid, error_response = validate_link_data(data)
        if not is_valid:
            return error_response

        link = create_link_object(user_id, data)
        db.session.add(link)
        db.session.commit()

        return jsonify(
            link=link.to_json(), message="Create Link Successful", status=201
        ), 201

    except Exception as e:
        db.session.rollback()
        return jsonify(message=f"Create Link Failed: {str(e)}", status=400), 400


@links_bp.route("/links/create_anonymous", methods=["POST"])
@cross_origin(supports_credentials=True)
def create_anonymous():
    """Creates an anonymous link."""
    try:
        data = request.get_json()
        is_valid, error_response = validate_link_data(data)
        if not is_valid:
            return error_response

        link = create_link_object(None, data, is_anonymous=True)
        db.session.add(link)
        db.session.commit()

        return jsonify(
            link=link.to_json(), message="Create Link Successful", status=201
        ), 201
    except Exception as e:
        db.session.rollback()
        return jsonify(message=f"Create Link Failed: {str(e)}", status=400), 400


@links_bp.route("/links/create_bulk", methods=["POST"])
@login_required2()
@cross_origin(supports_credentials=True)
def create_bulk():
    """Creates multiple links in one request."""
    try:
        user_id = request.args.get("user_id")
        if not user_id:
            return jsonify(message="User ID is required", status=400), 400

        links_data = request.get_json().get("links", [])
        if not links_data:
            return jsonify(message="No links data provided", status=400), 400

        created_links = []
        for data in links_data:
            is_valid, error_response = validate_link_data(data, require_all=True)
            if not is_valid:
                return error_response

            link = create_link_object(user_id, data)
            db.session.add(link)
            created_links.append(link)

        db.session.commit()
        return jsonify(
            links=[link.to_json() for link in created_links],
            message="Bulk link creation successful",
            status=201,
        ), 201

    except Exception as e:
        db.session.rollback()
        return jsonify(message=f"Bulk link creation failed: {str(e)}", status=400), 400


@links_bp.route("/links/update/<id>", methods=["PATCH"])
@login_required2()
@cross_origin(supports_credentials=True)
def update(id):
    """Updates an existing link."""
    try:
        data = {k: v for k, v in request.get_json().items() if v is not None}
        if not data:
            return jsonify(message="No update data provided", status=400), 400

        link = load_link(id)
        if not link:
            return jsonify(message="Link not found", status=404), 404

        update_link_attributes(link, data)
        db.session.commit()

        return jsonify(
            link=link.to_json(), message="Update Link Successful", status=200
        ), 200

    except Exception as e:
        db.session.rollback()
        return jsonify(message=f"Update Link Failed: {str(e)}", status=400), 400


@links_bp.route("/links/delete/<id>", methods=["DELETE"])
@login_required2()
@cross_origin(supports_credentials=True)
def delete(id):
    """Deletes a link."""
    try:
        db.session.query(Link).filter_by(id=id).delete()
        db.session.commit()
        return jsonify(message="Delete link Successful", status=200), 200
    except Exception as e:
        db.session.rollback()
        return jsonify(message=f"Delete link Failed: {str(e)}", status=400), 400


@links_bp.route("/links/stats", methods=["GET"])
@login_required2()
@cross_origin(supports_credentials=True)
def get_link_stats():
    """Fetches link statistics for an authenticated user."""
    try:
        user_id = request.args.get("user_id")
        if not user_id:
            return jsonify(message="User ID is required", status=400), 400

        stats = get_user_stats(user_id)
        return jsonify(
            links=stats, message="Fetching links successfully", status=200
        ), 200
    except Exception as e:
        return jsonify(message=f"An error occurred: {str(e)}", status=400), 400


@links_bp.route("/links/<link_id>/engagements", methods=["GET"])
@login_required2()
@cross_origin(supports_credentials=True)
def get_single_link_engagements(link_id):
    """Fetches engagement data for a single link."""
    try:
        engagements = (
            db.session.query(Engagements).join(Link).filter(Link.id == link_id).all()
        )
        return jsonify(
            engagements=[engagement.to_json() for engagement in engagements],
            message="Fetching Analytics data successfully",
            status=200,
        ), 200
    except Exception as e:
        return jsonify(message=f"Fetching Analytics failed: {str(e)}", status=400), 400


@links_bp.route("/links/engagements/<link_id>/create", methods=["POST"])
@cross_origin(supports_credentials=True)
def create_engagement_route(link_id):
    """Creates a new engagement record for a link."""
    try:
        data = request.get_json()
        engagement = create_engagement(link_id, data)
        db.session.commit()

        return jsonify(
            engagement=engagement.to_json(),
            message="Create Engagement Successful",
            status=201,
        ), 201
    except Exception as e:
        db.session.rollback()
        return jsonify(message=f"Create Engagement Failed: {str(e)}", status=400), 400


@links_bp.route("/<stub>", methods=["GET"])
def redirect_stub(stub):
    """Redirects short URL to its corresponding long URL."""
    try:
        link = Link.query.filter_by(stub=stub).first()
        if link:
            if link.disabled:
                return jsonify(message="This link has been disabled.", status=403), 403
            elif link.max_visits and link.visit_count >= link.max_visits:
                link.disabled = True
                db.session.commit()
                return jsonify(message="This link has been disabled.", status=403), 403

            link.visit_count += 1
            db.session.commit()
            return redirect(link.long_url)

        # Check anonymous links if not found in regular links
        anon_link = AnonymousLink.query.filter_by(stub=stub).first()
        if anon_link:
            return redirect(anon_link.long_url)

        return jsonify(message="Link not found.", status=404), 404

    except Exception as e:
        return jsonify(message=f"An error occurred: {str(e)}", status=500), 500
