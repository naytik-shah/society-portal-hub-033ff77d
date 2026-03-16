"""
Authentication routes
"""
from flask import Blueprint, request, jsonify
from models.user_model import User

# Create blueprint for auth routes
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST', 'OPTIONS'])
def login():
    """
    Login endpoint
    Expects JSON: {
        "username": "string",
        "password": "string",
        "role": "string"
    }
    """
    # Handle preflight
    if request.method == 'OPTIONS':
        return {}, 200
    
    try:
        data = request.get_json(force=True, silent=False)
        
        # Validate required fields
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({'success': False, 'message': 'Username and password are required'}), 400
        
        username = data.get('username')
        password = data.get('password')
        role = data.get('role')  # Optional, used for validation
        
        print(f"DEBUG: Login attempt - username: {username}, password: {password}, role: {role}")
        
        # Authenticate user
        user = User.login(username, password)
        
        print(f"DEBUG: User found: {user}")
        
        if user:
            # Check if role matches (optional validation)
            if role and user.get('role') != role:
                print(f"DEBUG: Role mismatch. User role: {user.get('role')}, Expected: {role}")
                return jsonify({'success': False, 'message': 'Invalid role'}), 401
            
            return jsonify({
                'success': True,
                'message': 'Login successful',
                'user': {
                    'id': user.get('id'),
                    'username': user.get('username'),
                    'email': user.get('email'),
                    'role': user.get('role'),
                    'name': user.get('name')
                }
            }), 200
        else:
            print(f"DEBUG: Authentication failed for user: {username}")
            return jsonify({'success': False, 'message': 'Invalid username or password'}), 401
    
    except Exception as e:
        print(f"DEBUG: Login error: {str(e)}")
        return jsonify({'success': False, 'message': f'Error during login: {str(e)}'}), 500
        return jsonify({'success': False, 'message': f'Error during login: {str(e)}'}), 500

@auth_bp.route('/users', methods=['GET'])
def get_all_users():
    """Get all users (for admin purposes)"""
    try:
        users = User.get_all_users()
        if users:
            return jsonify({'success': True, 'users': users}), 200
        else:
            return jsonify({'success': True, 'users': []}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error fetching users: {str(e)}'}), 500

@auth_bp.route('/users/role/<role>', methods=['GET'])
def get_users_by_role(role):
    """Get users by role"""
    try:
        users = User.get_users_by_role(role)
        if users:
            return jsonify({'success': True, 'users': users}), 200
        else:
            return jsonify({'success': True, 'users': []}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error fetching users: {str(e)}'}), 500

@auth_bp.route('/debug/users', methods=['GET'])
def debug_get_all_users():
    """DEBUG: Get all users to verify database"""
    try:
        users = User.get_all_users()
        if users:
            # Don't return passwords in response
            safe_users = [
                {
                    'id': u.get('id'),
                    'username': u.get('username'),
                    'email': u.get('email'),
                    'role': u.get('role'),
                    'name': u.get('name')
                }
                for u in users
            ]
            return jsonify({'success': True, 'message': f'Found {len(users)} users', 'users': safe_users}), 200
        else:
            return jsonify({'success': False, 'message': 'No users found in database'}), 404
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'}), 500
