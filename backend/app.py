"""
Flask Application for Residential Society Management System
"""
import datetime
from flask import Flask, request, jsonify, make_response
from flask.json.provider import DefaultJSONProvider
from config import Config
from routes.auth_routes import auth_bp
from routes.visitor_routes import visitor_bp
from routes.service_provider_routes import provider_bp
from routes.admin_routes import admin_bp


class CustomJSONProvider(DefaultJSONProvider):
    """Extend Flask's JSON provider to handle MySQL date/time types."""

    def default(self, obj):
        # datetime.datetime must come first (it's a subclass of datetime.date)
        if isinstance(obj, datetime.datetime):
            return obj.isoformat()
        if isinstance(obj, datetime.date):
            return obj.isoformat()          # e.g. '2026-04-15'
        if isinstance(obj, datetime.timedelta):
            # MySQL TIME columns come back as timedelta
            total = int(obj.total_seconds())
            h, rem = divmod(total, 3600)
            m, s = divmod(rem, 60)
            return f"{h:02d}:{m:02d}:{s:02d}"
        return super().default(obj)


# Initialize Flask app
app = Flask(__name__)
app.json_provider_class = CustomJSONProvider
app.json = CustomJSONProvider(app)

# Load configuration
app.config.from_object(Config)

# CORS - Allow all localhost origins for development
@app.after_request
def add_cors_headers(response):
    origin = request.headers.get('Origin')
    # Allow any localhost origin for development
    if origin and ('localhost' in origin or '127.0.0.1' in origin):
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, X-User-Role'
        response.headers['Access-Control-Expose-Headers'] = 'Content-Type, Content-Length'
        response.headers['Access-Control-Max-Age'] = '86400'
    return response

# Handle OPTIONS requests for CORS preflight
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = make_response('', 204)
        origin = request.headers.get('Origin')
        # Allow any localhost origin for development
        if origin and ('localhost' in origin or '127.0.0.1' in origin):
            response.headers['Access-Control-Allow-Origin'] = origin
            response.headers['Access-Control-Allow-Credentials'] = 'true'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, X-User-Role'
            response.headers['Access-Control-Max-Age'] = '86400'
        return response

# Register blueprints (import routes)
app.register_blueprint(auth_bp)
app.register_blueprint(visitor_bp, url_prefix='/visitors')
app.register_blueprint(provider_bp)
app.register_blueprint(admin_bp)

# Root endpoint
@app.route('/', methods=['GET'])
def home():
    """API home endpoint with documentation"""
    return {
        'status': 'ok',
        'message': 'Residential Society Management API',
        'version': '1.0.0',
        'endpoints': {
            'auth': {
                'login': 'POST /login',
                'get_users': 'GET /users',
                'get_users_by_role': 'GET /users/role/<role>'
            },
            'visitors': {
                'add': 'POST /visitors/add',
                'get_all': 'GET /visitors',
                'get_by_id': 'GET /visitors/<visitor_id>',
                'get_by_flat': 'GET /visitors/flat/<flat_number>',
                'checkout': 'PUT /visitors/<visitor_id>/checkout',
                'get_active': 'GET /visitors/active'
            },
            'service_providers': {
                'get_all': 'GET /providers',
                'get_by_id': 'GET /providers/<provider_id>',
                'get_by_type': 'GET /providers/type/<service_type>',
                'add': 'POST /providers/add',
                'create_request': 'POST /service/request',
                'get_requests': 'GET /service/requests',
                'get_schedule': 'GET /provider/schedule/<provider_id>',
                'add_schedule': 'POST /provider/schedule/add'
            },
            'health': 'GET /health'
        }
    }, 200

# Health check endpoint
@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return {
        'status': 'ok',
        'message': 'Residential Society Management API is running'
    }, 200

# 404 error handler
@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return {
        'success': False,
        'message': 'Endpoint not found'
    }, 404

# 500 error handler
@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return {
        'success': False,
        'message': 'Internal server error'
    }, 500

if __name__ == '__main__':
    # Run Flask development server
    # CORS is enabled so React frontend can make requests
    app.run(debug=True, host='0.0.0.0', port=5000)
