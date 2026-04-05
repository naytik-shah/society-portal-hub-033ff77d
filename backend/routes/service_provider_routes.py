"""
Service Provider management routes
"""
from flask import Blueprint, request, jsonify
from models.service_provider_model import ServiceProvider

# Create blueprint for service provider routes
provider_bp = Blueprint('provider', __name__)

@provider_bp.route('/providers', methods=['GET'])
def get_all_providers():
    """Get all service providers (JOINed with users)"""
    try:
        providers = ServiceProvider.get_all_providers()
        if providers:
            return jsonify({'success': True, 'providers': providers}), 200
        else:
            return jsonify({'success': True, 'providers': []}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error fetching providers: {str(e)}'}), 500

@provider_bp.route('/providers/<int:provider_id>', methods=['GET'])
def get_provider(provider_id):
    """Get service provider by service_providers.id"""
    try:
        provider = ServiceProvider.get_provider_by_id(provider_id)
        if provider:
            return jsonify({'success': True, 'provider': provider}), 200
        else:
            return jsonify({'success': False, 'message': 'Provider not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error fetching provider: {str(e)}'}), 500

@provider_bp.route('/providers/type/<service_type>', methods=['GET'])
def get_providers_by_service(service_type):
    """Get service providers by service type"""
    try:
        providers = ServiceProvider.get_providers_by_service(service_type)
        if providers:
            return jsonify({'success': True, 'providers': providers}), 200
        else:
            return jsonify({'success': True, 'providers': []}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error fetching providers: {str(e)}'}), 500

@provider_bp.route('/providers/add', methods=['POST'])
def add_provider():
    """
    Add a new service provider (must be linked to a user).
    Expects JSON: {
        "user_id": integer (required - must be a PROVIDER user),
        "name": "string",
        "service_type": "string",
        "phone": "string",
        "email": "string (optional)",
        "description": "string (optional)",
        "rating": float (optional)
    }
    """
    try:
        data = request.get_json()
        
        if not data or not data.get('user_id') or not data.get('name') or not data.get('service_type') or not data.get('phone'):
            return jsonify({'success': False, 'message': 'user_id, name, service_type, and phone are required'}), 400
        
        user_id = data.get('user_id')
        name = data.get('name')
        service_type = data.get('service_type')
        phone = data.get('phone')
        email = data.get('email', '')
        description = data.get('description', '')
        rating = data.get('rating', 0.0)
        
        sp_id = ServiceProvider.add_provider(user_id, name, service_type, phone, email, description, rating)
        
        if sp_id:
            return jsonify({'success': True, 'message': 'Service provider added successfully', 'provider_id': sp_id}), 201
        else:
            return jsonify({'success': False, 'message': 'Failed to add provider. Check that user_id exists.'}), 500
    
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error adding provider: {str(e)}'}), 500

@provider_bp.route('/create_request', methods=['POST'])
def create_request():
    """
    Create a new service request as a resident.
    Expects JSON: {
        "resident_id": integer  (users.id of the logged-in resident),
        "service_type": "string",
        "description": "string"
    }
    Creates an OPEN request with provider_id = NULL.
    Returns the new service_requests.id.
    """
    try:
        data = request.get_json()
        
        if not data or not data.get('resident_id') or not data.get('service_type'):
            return jsonify({'success': False, 'message': 'Resident ID and service type are required'}), 400
        
        resident_id = data.get('resident_id')   # users.id
        service_type = data.get('service_type')
        description = data.get('description', '')
        
        # provider_id = None → OPEN for any provider to accept
        new_request_id = ServiceProvider.create_service_request(None, resident_id, service_type, description)
        
        if new_request_id:
            return jsonify({'success': True, 'message': 'Service request created successfully', 'request_id': new_request_id}), 201
        else:
            return jsonify({'success': False, 'message': 'Failed to create service request'}), 500
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error creating service request: {str(e)}'}), 500

@provider_bp.route('/get_requests', methods=['GET'])
def get_requests():
    """
    Get service requests.
    Query parameters:
    - provider_id: users.id of provider → fetches open + assigned requests
    - resident_id: users.id of resident → fetches their requests
    """
    try:
        provider_id = request.args.get('provider_id', type=int)
        resident_id = request.args.get('resident_id', type=int)
        
        requests_list = ServiceProvider.get_service_requests(provider_id, resident_id)
        
        if requests_list:
            return jsonify({'success': True, 'requests': requests_list}), 200
        else:
            return jsonify({'success': True, 'requests': []}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error fetching requests: {str(e)}'}), 500

@provider_bp.route('/accept_request', methods=['POST'])
def accept_request():
    """
    Accept an open service request (provider action).
    Expects JSON: {
        "provider_id": integer  (users.id of the logged-in provider),
        "request_id": integer   (service_requests.id)
    }
    Internally resolves users.id → service_providers.id for the FK.
    """
    try:
        data = request.get_json()
        
        if not data or not data.get('provider_id') or not data.get('request_id'):
            return jsonify({'success': False, 'message': 'Provider ID and request ID are required'}), 400
        
        provider_user_id = data.get('provider_id')   # users.id
        request_id = data.get('request_id')
        
        success = ServiceProvider.accept_service_request(request_id, provider_user_id)
        
        if success:
            return jsonify({'success': True, 'message': 'Request accepted successfully'}), 200
        else:
            return jsonify({'success': False, 'message': 'Unable to accept request. It may already be assigned or closed.'}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error accepting request: {str(e)}'}), 500


@provider_bp.route('/complete_request', methods=['POST'])
def complete_request():
    """
    Mark an accepted service request as COMPLETED (provider action).
    Expects JSON: {
        "provider_id": integer  (users.id of the logged-in provider),
        "request_id": integer   (service_requests.id)
    }
    Only succeeds if the request is currently ACCEPTED and owned by this provider.
    """
    try:
        data = request.get_json()
        
        if not data or not data.get('provider_id') or not data.get('request_id'):
            return jsonify({'success': False, 'message': 'provider_id and request_id are required'}), 400
        
        provider_user_id = data.get('provider_id')   # users.id
        request_id = data.get('request_id')
        
        success = ServiceProvider.complete_service_request(request_id, provider_user_id)
        
        if success:
            return jsonify({'success': True, 'message': 'Request marked as completed'}), 200
        else:
            return jsonify({'success': False, 'message': 'Unable to complete request. It may not be ACCEPTED or does not belong to you.'}), 400
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error completing request: {str(e)}'}), 500

@provider_bp.route('/service/request', methods=['POST'])
def create_service_request():
    """
    Create a new service request (alternative endpoint, same as /create_request).
    Expects JSON: {
        "resident_id": integer  (users.id),
        "service_type": "string",
        "description": "string"
    }
    """
    try:
        data = request.get_json()
        
        if not data or not data.get('resident_id') or not data.get('service_type'):
            return jsonify({'success': False, 'message': 'Resident ID and service type are required'}), 400
        
        resident_id = data.get('resident_id')   # users.id
        service_type = data.get('service_type')
        description = data.get('description', '')
        
        new_request_id = ServiceProvider.create_service_request(None, resident_id, service_type, description)
        
        if new_request_id:
            return jsonify({'success': True, 'message': 'Service request created successfully', 'request_id': new_request_id}), 201
        else:
            return jsonify({'success': False, 'message': 'Failed to create service request'}), 500
    
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error creating service request: {str(e)}'}), 500


@provider_bp.route('/service/requests/all', methods=['GET'])
def get_all_service_requests():
    """
    Get ALL service requests with resident and provider info (admin view).
    No filter — returns every request regardless of status.
    """
    try:
        requests_list = ServiceProvider.get_all_requests()
        return jsonify({'success': True, 'requests': requests_list or []}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error fetching all requests: {str(e)}'}), 500

@provider_bp.route('/service/requests', methods=['GET'])
def get_service_requests():
    """
    Get service requests.
    Query parameters:
    - provider_id: users.id of provider
    - resident_id: users.id of resident
    """
    try:
        provider_id = request.args.get('provider_id', type=int)
        resident_id = request.args.get('resident_id', type=int)
        
        requests_list = ServiceProvider.get_service_requests(provider_id, resident_id)
        
        if requests_list:
            return jsonify({'success': True, 'requests': requests_list}), 200
        else:
            return jsonify({'success': True, 'requests': []}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error fetching requests: {str(e)}'}), 500

@provider_bp.route('/provider/schedule/<int:provider_id>', methods=['GET'])
def get_provider_schedule(provider_id):
    """Get schedule for a service provider"""
    try:
        schedule = ServiceProvider.get_schedule(provider_id)
        if schedule:
            return jsonify({'success': True, 'schedule': schedule}), 200
        else:
            return jsonify({'success': True, 'schedule': []}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error fetching schedule: {str(e)}'}), 500

@provider_bp.route('/provider/schedule/add', methods=['POST'])
def add_provider_schedule():
    """
    Add a schedule for a service provider
    Expects JSON: {
        "provider_id": integer (service_providers.id),
        "schedule_date": "YYYY-MM-DD",
        "start_time": "HH:MM:SS",
        "end_time": "HH:MM:SS"
    }
    """
    try:
        data = request.get_json()
        
        if not data or not data.get('provider_id') or not data.get('schedule_date') or not data.get('start_time') or not data.get('end_time'):
            return jsonify({'success': False, 'message': 'Provider ID, schedule date, start time, and end time are required'}), 400
        
        provider_id = data.get('provider_id')
        schedule_date = data.get('schedule_date')
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        
        success = ServiceProvider.add_schedule(provider_id, schedule_date, start_time, end_time)
        
        if success:
            return jsonify({'success': True, 'message': 'Schedule added successfully'}), 201
        else:
            return jsonify({'success': False, 'message': 'Failed to add schedule'}), 500
    
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error adding schedule: {str(e)}'}), 500
