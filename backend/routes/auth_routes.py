"""
Authentication routes
"""
from flask import Blueprint, request, jsonify
from models.user_model import User
from models.service_provider_model import ServiceProvider

# Create blueprint for auth routes
auth_bp = Blueprint('auth', __name__)


def normalize_role(role_str):
    if not role_str:
        return None
    role_key = role_str.strip().lower()
    role_map = {
        'resident': 'RESIDENT',
        'security': 'SECURITY',
        'service provider': 'PROVIDER',
        'provider': 'PROVIDER',
        'serviceprovider': 'PROVIDER',
        'service-provider': 'PROVIDER',
    }
    return role_map.get(role_key, role_str.strip().upper())


@auth_bp.route('/login', methods=['POST', 'OPTIONS'])
def login():
    """
    Login endpoint
    Expects JSON: {
        "email": "string",
        "password": "string",
        "role": "string"
    }
    Returns user info + provider_id (if role is PROVIDER)
    """
    if request.method == 'OPTIONS':
        return {}, 200
    
    try:
        data = request.get_json(force=True, silent=False)
        
        identifier = (data.get('email') or data.get('username') or '').strip()
        password = data.get('password')
        role = data.get('role')
        
        if not identifier or not password:
            return jsonify({'success': False, 'message': 'Email/username and password are required'}), 400
        
        print(f"DEBUG: Login attempt - identifier: {identifier}, role: {role}")
        
        user = User.login(identifier, password)
        
        if user:
            normalized_role = normalize_role(role)
            normalized_user_role = normalize_role(user.get('role'))
            
            if normalized_role and normalized_user_role != normalized_role:
                print(f"DEBUG: Role mismatch. User role: {user.get('role')} ({normalized_user_role}), Expected: {normalized_role}")
                return jsonify({'success': False, 'message': 'Invalid role'}), 401
            
            # Build response
            user_response = {
                'id': user.get('id'),
                'username': user.get('username'),
                'email': user.get('email'),
                'role': user.get('role'),
                'name': user.get('name')
            }
            
            # If provider, also return their service_providers.id
            if normalized_user_role == 'PROVIDER':
                provider = ServiceProvider.get_provider_by_user_id(user.get('id'))
                if provider:
                    user_response['provider_id'] = provider.get('id')
                    user_response['service_type'] = provider.get('service_type')
                    print(f"DEBUG: Provider login - user.id={user.get('id')}, provider.id={provider.get('id')}")
            
            return jsonify({
                'success': True,
                'message': 'Login successful',
                'user': user_response
            }), 200
        else:
            print(f"DEBUG: Authentication failed for user: {identifier}")
            return jsonify({'success': False, 'message': 'Invalid email or password'}), 401
    
    except Exception as e:
        print(f"DEBUG: Login error: {str(e)}")
        return jsonify({'success': False, 'message': f'Error during login: {str(e)}'}), 500


@auth_bp.route('/api/login', methods=['POST', 'OPTIONS'])
def api_login():
    return login()


@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register endpoint
    Expects JSON: {
        "name": "string",
        "email": "string",
        "password": "string",
        "role": "RESIDENT" or "PROVIDER",
        "username": "string (optional)",
        "service_type": "string (optional, for PROVIDER)",
        "phone": "string (optional, for PROVIDER)"
    }
    
    For PROVIDER role:
      Step 1: Create user in users table
      Step 2: Create linked entry in service_providers table
    """
    try:
        data = request.get_json(force=True, silent=False)
        
        if not data or not data.get('name') or not data.get('email') or not data.get('password') or not data.get('role'):
            return jsonify({'success': False, 'message': 'Name, email, password, and role are required'}), 400
        
        name = data.get('name').strip()
        email = data.get('email').strip().lower()
        password = data.get('password')
        role = normalize_role(data.get('role'))
        username = data.get('username') or email.split('@')[0]
        
        if role not in ('RESIDENT', 'PROVIDER'):
            return jsonify({'success': False, 'message': 'Role must be RESIDENT or PROVIDER'}), 400
        
        if User.get_by_email(email):
            return jsonify({'success': False, 'message': 'Email already in use'}), 409
        
        if User.get_by_username(username):
            return jsonify({'success': False, 'message': 'Username already exists'}), 409
        
        # Step 1: Create user — returns the new users.id on success
        new_user_id = User.create_user(username, password, email, role, name)
        if not new_user_id:
            return jsonify({'success': False, 'message': 'Failed to register user'}), 500
        
        # Fetch full user record to populate the response with all fields
        new_user = User.get_by_id(new_user_id)
        if not new_user:
            return jsonify({'success': False, 'message': 'User created but could not retrieve'}), 500
        
        user_response = {
            'id': new_user.get('id'),           # users.id
            'username': new_user.get('username'),
            'email': new_user.get('email'),
            'role': new_user.get('role'),
            'name': new_user.get('name')
        }
        
        # Step 2: If PROVIDER, create the linked service_providers row
        #   service_providers.user_id = new_user_id   (FK → users.id)
        if role == 'PROVIDER':
            service_type = data.get('service_type', 'General')
            phone = data.get('phone', '')
            provider_name = data.get('provider_name', name)
            description = data.get('description', '')
            
            sp_id = ServiceProvider.add_provider(
                user_id=new_user_id,          # links service_providers → users
                name=provider_name,
                service_type=service_type,
                phone=phone,
                email=email,
                description=description
            )
            
            if sp_id:
                user_response['provider_id'] = sp_id   # service_providers.id
                print(f"DEBUG: Provider registered – users.id={new_user_id}, service_providers.id={sp_id}")
            else:
                print(f"WARNING: User created but service_providers entry failed for users.id={new_user_id}")
        
        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'user': user_response
        }), 201

    except Exception as e:
        print(f"DEBUG: Register error: {str(e)}")
        return jsonify({'success': False, 'message': f'Error during registration: {str(e)}'}), 500

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
