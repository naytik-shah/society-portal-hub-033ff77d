"""
Service Provider model for service provider management

RELATIONSHIPS:
  service_providers.user_id → users.id  (login account link)
  service_requests.provider_id → service_providers.id
  service_requests.resident_id → users.id

ID CLARITY:
  users.id          – the login/auth identity for every user
  service_providers.id – the provider profile identity (used as provider_id in FKs)
  service_providers.user_id – FK back to users.id for the provider's account
"""
from database import execute_query, execute_insert

class ServiceProvider:
    """Service Provider model class"""
    
    @staticmethod
    def add_provider(user_id, name, service_type, phone, email="", description="", rating=0.0):
        """
        Add a new service provider linked to a user account.
        user_id must reference an existing user with role PROVIDER.
        """
        query = """
            INSERT INTO service_providers (user_id, name, service_type, phone, email, description, rating)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        result = execute_insert(query, (user_id, name, service_type, phone, email, description, rating))
        return result  # Returns the new service_providers.id or None
    
    @staticmethod
    def get_all_providers():
        """Get all service providers with their linked user info"""
        query = """
            SELECT sp.id, sp.user_id, sp.name, sp.service_type, sp.phone, sp.email,
                   sp.description, sp.rating, sp.created_at,
                   u.username, u.name AS user_name
            FROM service_providers sp
            JOIN users u ON sp.user_id = u.id
            ORDER BY sp.rating DESC
        """
        return execute_query(query)
    
    @staticmethod
    def get_provider_by_id(provider_id):
        """Get a service provider by service_providers.id"""
        query = """
            SELECT sp.id, sp.user_id, sp.name, sp.service_type, sp.phone, sp.email,
                   sp.description, sp.rating, sp.created_at,
                   u.username, u.name AS user_name
            FROM service_providers sp
            JOIN users u ON sp.user_id = u.id
            WHERE sp.id = %s
        """
        result = execute_query(query, (provider_id,))
        if result and len(result) > 0:
            return result[0]
        return None
    
    @staticmethod
    def get_provider_by_user_id(user_id):
        """Get provider details by the linked users.id"""
        query = """
            SELECT sp.id, sp.user_id, sp.name, sp.service_type, sp.phone, sp.email,
                   sp.description, sp.rating, sp.created_at,
                   u.username, u.name AS user_name
            FROM service_providers sp
            JOIN users u ON sp.user_id = u.id
            WHERE sp.user_id = %s
        """
        result = execute_query(query, (user_id,))
        if result and len(result) > 0:
            return result[0]
        return None
    
    @staticmethod
    def get_providers_by_service(service_type):
        """Get service providers by service type"""
        query = """
            SELECT sp.id, sp.user_id, sp.name, sp.service_type, sp.phone, sp.email,
                   sp.description, sp.rating, sp.created_at,
                   u.username, u.name AS user_name
            FROM service_providers sp
            JOIN users u ON sp.user_id = u.id
            WHERE sp.service_type = %s
            ORDER BY sp.rating DESC
        """
        return execute_query(query, (service_type,))
    
    @staticmethod
    def create_service_request(provider_id, resident_id, service_type, description, status="OPEN"):
        """
        Create a new service request.
        provider_id → service_providers.id  (pass None for OPEN / unassigned)
        resident_id → users.id
        Returns the new service_requests.id on success, or None on failure.
        """
        query = """
            INSERT INTO service_requests (provider_id, resident_id, service_type, description, status)
            VALUES (%s, %s, %s, %s, %s)
        """
        return execute_insert(query, (provider_id, resident_id, service_type, description, status))
    
    @staticmethod
    def get_service_requests(provider_user_id=None, resident_id=None):
        """
        Get service requests.
        
        provider_user_id: The users.id of the logged-in provider.
            → Internally looks up service_providers.id via user_id
            → Returns OPEN requests + requests assigned to this provider
        resident_id: The users.id of the logged-in resident.
            → Returns requests created by this resident
        """
        if provider_user_id:
            # First find the service_providers.id for this user
            query = """
                SELECT sr.id, sr.resident_id, sr.provider_id, sr.service_type,
                       sr.description, sr.status, sr.created_at, sr.updated_at
                FROM service_requests sr
                LEFT JOIN service_providers sp_assigned ON sr.provider_id = sp_assigned.id
                WHERE sr.provider_id IS NULL
                   OR sp_assigned.user_id = %s
                ORDER BY sr.created_at DESC
            """
            return execute_query(query, (provider_user_id,))
        elif resident_id:
            query = """
                SELECT sr.id, sr.resident_id, sr.provider_id, sr.service_type,
                       sr.description, sr.status, sr.created_at, sr.updated_at
                FROM service_requests sr
                WHERE sr.resident_id = %s
                ORDER BY sr.created_at DESC
            """
            return execute_query(query, (resident_id,))
        else:
            query = """
                SELECT sr.id, sr.resident_id, sr.provider_id, sr.service_type,
                       sr.description, sr.status, sr.created_at, sr.updated_at
                FROM service_requests sr
                WHERE sr.provider_id IS NULL
                ORDER BY sr.created_at DESC
            """
            return execute_query(query)

    @staticmethod
    def accept_service_request(request_id, provider_user_id):
        """
        Assign a provider to an open request.
        provider_user_id is the users.id → looks up service_providers.id via user_id FK.
        Returns True if a row was updated, False otherwise.
        """
        # Resolve users.id → service_providers.id
        sp = ServiceProvider.get_provider_by_user_id(provider_user_id)
        if not sp:
            return False

        sp_id = sp['id']  # service_providers.id — used as FK in service_requests.provider_id
        query = """
            UPDATE service_requests
            SET provider_id = %s, status = 'ACCEPTED'
            WHERE id = %s AND status = 'OPEN'
        """
        # execute_query returns rowcount for non-SELECT statements
        result = execute_query(query, (sp_id, request_id))
        return isinstance(result, int) and result > 0

    @staticmethod
    def complete_service_request(request_id, provider_user_id):
        """
        Mark an ACCEPTED request as COMPLETED.
        Only the assigned provider (matched via user_id) can complete it.
        """
        sp = ServiceProvider.get_provider_by_user_id(provider_user_id)
        if not sp:
            return False

        sp_id = sp['id']
        query = """
            UPDATE service_requests
            SET status = 'COMPLETED'
            WHERE id = %s AND provider_id = %s AND status = 'ACCEPTED'
        """
        result = execute_query(query, (request_id, sp_id))
        return isinstance(result, int) and result > 0

    @staticmethod
    def get_all_requests():
        """Get every service request with resident and provider info (admin view)."""
        query = """
            SELECT sr.id, sr.service_type, sr.description, sr.status,
                   sr.created_at, sr.updated_at,
                   u_res.id  AS resident_user_id,
                   u_res.name AS resident_name,
                   sp.id     AS provider_sp_id,
                   sp.name   AS provider_name,
                   sp.service_type AS provider_service_type
            FROM service_requests sr
            JOIN users u_res ON sr.resident_id = u_res.id
            LEFT JOIN service_providers sp ON sr.provider_id = sp.id
            ORDER BY sr.created_at DESC
        """
        return execute_query(query)
    
    @staticmethod
    def get_schedule(provider_id):
        """Get schedule for a service provider (by service_providers.id)"""
        query = "SELECT * FROM schedule WHERE provider_id = %s ORDER BY schedule_date ASC, start_time ASC"
        return execute_query(query, (provider_id,))
    
    @staticmethod
    def add_schedule(provider_id, schedule_date, start_time, end_time):
        """Add a schedule for a service provider (provider_id = service_providers.id)."""
        query = """
            INSERT INTO schedule (provider_id, schedule_date, start_time, end_time)
            VALUES (%s, %s, %s, %s)
        """
        result = execute_insert(query, (provider_id, schedule_date, start_time, end_time))
        return result is not None  # lastrowid on success
