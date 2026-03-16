"""
Service Provider model for service provider management
"""
from database import execute_query

class ServiceProvider:
    """Service Provider model class"""
    
    @staticmethod
    def add_provider(name, service_type, phone, email, description="", rating=0.0):
        """
        Add a new service provider
        """
        query = """
            INSERT INTO service_providers (name, service_type, phone, email, description, rating)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        result = execute_query(query, (name, service_type, phone, email, description, rating))
        return result > 0 if result else False
    
    @staticmethod
    def get_all_providers():
        """Get all service providers"""
        query = "SELECT * FROM service_providers ORDER BY rating DESC"
        return execute_query(query)
    
    @staticmethod
    def get_provider_by_id(provider_id):
        """Get service provider by ID"""
        query = "SELECT * FROM service_providers WHERE id = %s"
        result = execute_query(query, (provider_id,))
        
        if result and len(result) > 0:
            return result[0]
        return None
    
    @staticmethod
    def get_providers_by_service(service_type):
        """Get service providers by service type"""
        query = "SELECT * FROM service_providers WHERE service_type = %s ORDER BY rating DESC"
        return execute_query(query, (service_type,))
    
    @staticmethod
    def create_service_request(provider_id, resident_id, description, status="pending"):
        """
        Create a new service request
        """
        query = """
            INSERT INTO service_requests (provider_id, resident_id, description, status)
            VALUES (%s, %s, %s, %s)
        """
        result = execute_query(query, (provider_id, resident_id, description, status))
        return result > 0 if result else False
    
    @staticmethod
    def get_service_requests(provider_id=None, resident_id=None):
        """
        Get service requests
        If provider_id is provided, get requests for that provider
        If resident_id is provided, get requests from that resident
        """
        if provider_id:
            query = "SELECT * FROM service_requests WHERE provider_id = %s ORDER BY created_at DESC"
            return execute_query(query, (provider_id,))
        elif resident_id:
            query = "SELECT * FROM service_requests WHERE resident_id = %s ORDER BY created_at DESC"
            return execute_query(query, (resident_id,))
        else:
            query = "SELECT * FROM service_requests ORDER BY created_at DESC"
            return execute_query(query)
    
    @staticmethod
    def get_schedule(provider_id):
        """Get schedule for a service provider"""
        query = "SELECT * FROM schedule WHERE provider_id = %s ORDER BY schedule_date ASC, start_time ASC"
        return execute_query(query, (provider_id,))
    
    @staticmethod
    def add_schedule(provider_id, schedule_date, start_time, end_time):
        """Add a schedule for a service provider"""
        query = """
            INSERT INTO schedule (provider_id, schedule_date, start_time, end_time)
            VALUES (%s, %s, %s, %s)
        """
        result = execute_query(query, (provider_id, schedule_date, start_time, end_time))
        return result > 0 if result else False
