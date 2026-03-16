"""
Service Provider management routes
"""
from flask import Blueprint, request, jsonify
from models.service_provider_model import ServiceProvider

# Create blueprint for service provider routes
provider_bp = Blueprint('provider', __name__)

@provider_bp.route('/providers', methods=['GET'])
def get_all_providers():
    """Get all service providers"""
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
    """Get service provider by ID"""
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
    Add a new service provider
    Expects JSON: {
        "name": "string",
        "service_type": "string",
        "phone": "string",
        "email": "string",
        "description": "string (optional)",
        "rating": "float (optional)"
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or not data.get('name') or not data.get('service_type') or not data.get('phone'):
            return jsonify({'success': False, 'message': 'Name, service_type, and phone are required'}), 400
        
        name = data.get('name')
        service_type = data.get('service_type')
        phone = data.get('phone')
        email = data.get('email', '')
        description = data.get('description', '')
        rating = data.get('rating', 0.0)
        
        # Add provider
        success = ServiceProvider.add_provider(name, service_type, phone, email, description, rating)
        
        if success:
            return jsonify({'success': True, 'message': 'Service provider added successfully'}), 201
        else:
            return jsonify({'success': False, 'message': 'Failed to add provider'}), 500
    
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error adding provider: {str(e)}'}), 500

@provider_bp.route('/service/request', methods=['POST'])
def create_service_request():
    """
    Create a new service request
    Expects JSON: {
        "provider_id": "integer",
        "resident_id": "integer",
        "description": "string"
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or not data.get('provider_id') or not data.get('resident_id') or not data.get('description'):
            return jsonify({'success': False, 'message': 'Provider ID, resident ID, and description are required'}), 400
        
        provider_id = data.get('provider_id')
        resident_id = data.get('resident_id')
        description = data.get('description')
        
        # Create service request
        success = ServiceProvider.create_service_request(provider_id, resident_id, description)
        
        if success:
            return jsonify({'success': True, 'message': 'Service request created successfully'}), 201
        else:
            return jsonify({'success': False, 'message': 'Failed to create service request'}), 500
    
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error creating service request: {str(e)}'}), 500

@provider_bp.route('/service/requests', methods=['GET'])
def get_service_requests():
    """
    Get service requests
    Query parameters:
    - provider_id: Get requests for a specific provider
    - resident_id: Get requests from a specific resident
    """
    try:
        provider_id = request.args.get('provider_id', type=int)
        resident_id = request.args.get('resident_id', type=int)
        
        requests = ServiceProvider.get_service_requests(provider_id, resident_id)
        
        if requests:
            return jsonify({'success': True, 'requests': requests}), 200
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
        "provider_id": "integer",
        "schedule_date": "YYYY-MM-DD",
        "start_time": "HH:MM:SS",
        "end_time": "HH:MM:SS"
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or not data.get('provider_id') or not data.get('schedule_date') or not data.get('start_time') or not data.get('end_time'):
            return jsonify({'success': False, 'message': 'Provider ID, schedule date, start time, and end time are required'}), 400
        
        provider_id = data.get('provider_id')
        schedule_date = data.get('schedule_date')
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        
        # Add schedule
        success = ServiceProvider.add_schedule(provider_id, schedule_date, start_time, end_time)
        
        if success:
            return jsonify({'success': True, 'message': 'Schedule added successfully'}), 201
        else:
            return jsonify({'success': False, 'message': 'Failed to add schedule'}), 500
    
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error adding schedule: {str(e)}'}), 500
