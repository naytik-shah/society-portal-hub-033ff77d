"""
Visitor management routes
"""
from flask import Blueprint, request, jsonify
from models.visitor_model import Visitor

# Create blueprint for visitor routes
visitor_bp = Blueprint('visitor', __name__)

@visitor_bp.route('/add', methods=['POST'])
def add_visitor():
    """
    Add a new visitor
    Expects JSON: {
        "name": "string",
        "phone": "string",
        "purpose": "string",
        "flat_number": "string"
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or not data.get('name') or not data.get('phone') or not data.get('flat_number'):
            return jsonify({'success': False, 'message': 'Name, phone, and flat_number are required'}), 400
        
        name = data.get('name')
        phone = data.get('phone')
        purpose = data.get('purpose', 'Visit')
        flat_number = data.get('flat_number')
        
        # Add visitor
        success = Visitor.add_visitor(name, phone, purpose, flat_number)
        
        if success:
            return jsonify({'success': True, 'message': 'Visitor added successfully'}), 201
        else:
            return jsonify({'success': False, 'message': 'Failed to add visitor'}), 500
    
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error adding visitor: {str(e)}'}), 500

@visitor_bp.route('', methods=['GET'])
def get_all_visitors():
    """Get all visitors"""
    try:
        visitors = Visitor.get_all_visitors()
        if visitors:
            return jsonify({'success': True, 'visitors': visitors}), 200
        else:
            return jsonify({'success': True, 'visitors': []}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error fetching visitors: {str(e)}'}), 500

@visitor_bp.route('/<int:visitor_id>', methods=['GET'])
def get_visitor(visitor_id):
    """Get visitor by ID"""
    try:
        visitor = Visitor.get_visitor_by_id(visitor_id)
        if visitor:
            return jsonify({'success': True, 'visitor': visitor}), 200
        else:
            return jsonify({'success': False, 'message': 'Visitor not found'}), 404
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error fetching visitor: {str(e)}'}), 500

@visitor_bp.route('/flat/<flat_number>', methods=['GET'])
def get_visitors_by_flat(flat_number):
    """Get visitors by flat number"""
    try:
        visitors = Visitor.get_visitors_by_flat(flat_number)
        if visitors:
            return jsonify({'success': True, 'visitors': visitors}), 200
        else:
            return jsonify({'success': True, 'visitors': []}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error fetching visitors: {str(e)}'}), 500

@visitor_bp.route('/<int:visitor_id>/checkout', methods=['PUT'])
def checkout_visitor(visitor_id):
    """Check out a visitor"""
    try:
        success = Visitor.check_out_visitor(visitor_id)
        if success:
            return jsonify({'success': True, 'message': 'Visitor checked out successfully'}), 200
        else:
            return jsonify({'success': False, 'message': 'Failed to checkout visitor'}), 500
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error checking out visitor: {str(e)}'}), 500

@visitor_bp.route('/active', methods=['GET'])
def get_active_visitors():
    """Get active visitors (not checked out)"""
    try:
        visitors = Visitor.get_active_visitors()
        if visitors:
            return jsonify({'success': True, 'visitors': visitors}), 200
        else:
            return jsonify({'success': True, 'visitors': []}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error fetching active visitors: {str(e)}'}), 500
