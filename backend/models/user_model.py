"""
User model for authentication
"""
from database import execute_query

class User:
    """User model class"""
    
    @staticmethod
    def login(username, password):
        """
        Authenticate user with username and password
        Returns user data if valid, None otherwise
        """
        query = "SELECT * FROM users WHERE username = %s AND password = %s"
        result = execute_query(query, (username, password))
        
        if result and len(result) > 0:
            return result[0]
        return None
    
    @staticmethod
    def get_by_id(user_id):
        """Get user by ID"""
        query = "SELECT * FROM users WHERE id = %s"
        result = execute_query(query, (user_id,))
        
        if result and len(result) > 0:
            return result[0]
        return None
    
    @staticmethod
    def get_by_username(username):
        """Get user by username"""
        query = "SELECT * FROM users WHERE username = %s"
        result = execute_query(query, (username,))
        
        if result and len(result) > 0:
            return result[0]
        return None
    
    @staticmethod
    def create_user(username, password, email, role, name):
        """Create a new user"""
        query = """
            INSERT INTO users (username, password, email, role, name)
            VALUES (%s, %s, %s, %s, %s)
        """
        result = execute_query(query, (username, password, email, role, name))
        return result > 0 if result else False
    
    @staticmethod
    def get_all_users():
        """Get all users"""
        query = "SELECT * FROM users"
        return execute_query(query)
    
    @staticmethod
    def get_users_by_role(role):
        """Get users by role"""
        query = "SELECT * FROM users WHERE role = %s"
        return execute_query(query, (role,))
