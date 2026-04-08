"""
Admin routes – all endpoints under /admin prefix.
Protected by require_admin() RBAC decorator.
"""
from flask import Blueprint, request, jsonify
from functools import wraps
from models.admin_model import Admin
from models.user_model import User

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')


# ──────────────────────────── RBAC ────────────────────────────────

def require_admin(f):
    """Decorator: reject requests that don't carry the ADMIN role header."""
    @wraps(f)
    def decorated(*args, **kwargs):
        role = request.headers.get('X-User-Role', '').strip().upper()
        if role != 'ADMIN':
            return jsonify({'success': False, 'message': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated


# ──────────────────────────── DASHBOARD ───────────────────────────

@admin_bp.route('/stats', methods=['GET'])
@require_admin
def get_stats():
    try:
        stats = Admin.get_dashboard_stats()
        return jsonify({'success': True, 'stats': stats}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# ──────────────────────────── RESIDENTS ───────────────────────────

@admin_bp.route('/residents', methods=['GET'])
@require_admin
def list_residents():
    try:
        return jsonify({'success': True, 'residents': Admin.get_all_residents()}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@admin_bp.route('/residents', methods=['POST'])
@require_admin
def create_resident():
    try:
        data = request.get_json(force=True)
        required = ('name', 'email', 'password', 'username')
        if not all(data.get(k) for k in required):
            return jsonify({'success': False, 'message': 'name, email, password, username required'}), 400

        if User.get_by_email(data['email']):
            return jsonify({'success': False, 'message': 'Email already in use'}), 409
        if User.get_by_username(data['username']):
            return jsonify({'success': False, 'message': 'Username already taken'}), 409

        new_id = Admin.create_resident(
            data['username'], data['password'], data['email'], data['name'],
            data.get('phone'), data.get('flat_number')
        )
        if not new_id:
            return jsonify({'success': False, 'message': 'Failed to create resident'}), 500

        return jsonify({'success': True, 'message': 'Resident created', 'id': new_id}), 201
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@admin_bp.route('/residents/<int:user_id>', methods=['GET'])
@require_admin
def get_resident(user_id):
    try:
        resident = Admin.get_resident_by_id(user_id)
        if not resident:
            return jsonify({'success': False, 'message': 'Resident not found'}), 404
        return jsonify({'success': True, 'resident': resident}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@admin_bp.route('/residents/<int:user_id>', methods=['PUT'])
@require_admin
def update_resident(user_id):
    try:
        data = request.get_json(force=True)
        if not Admin.get_resident_by_id(user_id):
            return jsonify({'success': False, 'message': 'Resident not found'}), 404

        Admin.update_user(
            user_id, data.get('name'), data.get('email'), data.get('username'),
            data.get('phone'), data.get('flat_number')
        )
        return jsonify({'success': True, 'message': 'Resident updated'}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@admin_bp.route('/residents/<int:user_id>', methods=['DELETE'])
@require_admin
def delete_resident(user_id):
    try:
        if not Admin.get_resident_by_id(user_id):
            return jsonify({'success': False, 'message': 'Resident not found'}), 404
        Admin.delete_user(user_id)
        return jsonify({'success': True, 'message': 'Resident deleted'}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# ──────────────────────────── GUARDS ──────────────────────────────

@admin_bp.route('/guards', methods=['GET'])
@require_admin
def list_guards():
    try:
        return jsonify({'success': True, 'guards': Admin.get_all_guards()}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@admin_bp.route('/guards', methods=['POST'])
@require_admin
def create_guard():
    try:
        data = request.get_json(force=True)
        required = ('name', 'email', 'password', 'username')
        if not all(data.get(k) for k in required):
            return jsonify({'success': False, 'message': 'name, email, password, username required'}), 400

        if User.get_by_email(data['email']):
            return jsonify({'success': False, 'message': 'Email already in use'}), 409
        if User.get_by_username(data['username']):
            return jsonify({'success': False, 'message': 'Username already taken'}), 409

        new_id = Admin.create_guard(
            data['username'], data['password'], data['email'], data['name']
        )
        if not new_id:
            return jsonify({'success': False, 'message': 'Failed to create guard'}), 500

        return jsonify({'success': True, 'message': 'Guard created', 'id': new_id}), 201
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@admin_bp.route('/guards/<int:user_id>', methods=['GET'])
@require_admin
def get_guard(user_id):
    try:
        guard = Admin.get_guard_by_id(user_id)
        if not guard:
            return jsonify({'success': False, 'message': 'Guard not found'}), 404
        return jsonify({'success': True, 'guard': guard}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@admin_bp.route('/guards/<int:user_id>', methods=['PUT'])
@require_admin
def update_guard(user_id):
    try:
        data = request.get_json(force=True)
        if not Admin.get_guard_by_id(user_id):
            return jsonify({'success': False, 'message': 'Guard not found'}), 404
        Admin.update_user(user_id, data.get('name'), data.get('email'), data.get('username'), None, None)
        return jsonify({'success': True, 'message': 'Guard updated'}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@admin_bp.route('/guards/<int:user_id>', methods=['DELETE'])
@require_admin
def delete_guard(user_id):
    try:
        if not Admin.get_guard_by_id(user_id):
            return jsonify({'success': False, 'message': 'Guard not found'}), 404
        Admin.delete_user(user_id)
        return jsonify({'success': True, 'message': 'Guard deleted'}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# ──────────────────────────── PROVIDERS ───────────────────────────

@admin_bp.route('/providers', methods=['GET'])
@require_admin
def list_providers():
    try:
        return jsonify({'success': True, 'providers': Admin.get_all_providers()}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@admin_bp.route('/providers/<int:provider_id>/approve', methods=['PUT'])
@require_admin
def approve_provider(provider_id):
    try:
        ok = Admin.set_provider_status(provider_id, 'approved')
        if ok:
            return jsonify({'success': True, 'message': 'Provider approved'}), 200
        return jsonify({'success': False, 'message': 'Provider not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@admin_bp.route('/providers/<int:provider_id>/reject', methods=['PUT'])
@require_admin
def reject_provider(provider_id):
    try:
        ok = Admin.set_provider_status(provider_id, 'rejected')
        if ok:
            return jsonify({'success': True, 'message': 'Provider rejected'}), 200
        return jsonify({'success': False, 'message': 'Provider not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@admin_bp.route('/providers/<int:provider_id>', methods=['DELETE'])
@require_admin
def delete_provider(provider_id):
    try:
        ok = Admin.delete_provider(provider_id)
        if ok:
            return jsonify({'success': True, 'message': 'Provider deleted'}), 200
        return jsonify({'success': False, 'message': 'Provider not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# ──────────────────────────── VISITORS ────────────────────────────

@admin_bp.route('/visitors', methods=['GET'])
@require_admin
def list_visitors():
    try:
        return jsonify({'success': True, 'visitors': Admin.get_all_visitors()}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# ─────────────────────── SERVICE REQUESTS ─────────────────────────

@admin_bp.route('/service-requests', methods=['GET'])
@require_admin
def list_service_requests():
    try:
        return jsonify({'success': True, 'requests': Admin.get_all_service_requests()}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# ──────────────────────────── EVENTS ──────────────────────────────

@admin_bp.route('/events', methods=['GET'])
def list_events():
    """Public – residents can also fetch events."""
    try:
        return jsonify({'success': True, 'events': Admin.get_all_events()}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@admin_bp.route('/events', methods=['POST'])
@require_admin
def create_event():
    try:
        data = request.get_json(force=True)
        if not data.get('title') or not data.get('event_date') or not data.get('created_by'):
            return jsonify({'success': False, 'message': 'title, event_date, created_by required'}), 400

        new_id = Admin.create_event(
            data['title'],
            data.get('description', ''),
            data['event_date'],
            data.get('event_time'),
            data.get('location', ''),
            data['created_by'],
        )
        if not new_id:
            return jsonify({'success': False, 'message': 'Failed to create event'}), 500
        return jsonify({'success': True, 'message': 'Event created', 'id': new_id}), 201
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@admin_bp.route('/events/<int:event_id>', methods=['GET'])
def get_event(event_id):
    try:
        event = Admin.get_event_by_id(event_id)
        if not event:
            return jsonify({'success': False, 'message': 'Event not found'}), 404
        return jsonify({'success': True, 'event': event}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@admin_bp.route('/events/<int:event_id>', methods=['PUT'])
@require_admin
def update_event(event_id):
    try:
        data = request.get_json(force=True)
        if not Admin.get_event_by_id(event_id):
            return jsonify({'success': False, 'message': 'Event not found'}), 404

        Admin.update_event(
            event_id,
            data.get('title'),
            data.get('description'),
            data.get('event_date'),
            data.get('event_time'),
            data.get('location'),
        )
        return jsonify({'success': True, 'message': 'Event updated'}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@admin_bp.route('/events/<int:event_id>', methods=['DELETE'])
@require_admin
def delete_event(event_id):
    try:
        if not Admin.get_event_by_id(event_id):
            return jsonify({'success': False, 'message': 'Event not found'}), 404
        Admin.delete_event(event_id)
        return jsonify({'success': True, 'message': 'Event deleted'}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
