"""
User model for authentication
"""
from database import execute_query, execute_insert

class User:
    """User model class"""
    
    @staticmethod
    def login(identifier, password):
        """
        Authenticate user with email or username and password.
        Returns user data if valid, None otherwise.
        """
        query = "SELECT * FROM users WHERE (email = %s OR username = %s) AND password = %s"
        result = execute_query(query, (identifier, identifier, password))
        
        if result and len(result) > 0:
            return result[0]
        return None
    
    @staticmethod
    def get_by_email(email):
        """Get user by email"""
        query = "SELECT * FROM users WHERE email = %s"
        result = execute_query(query, (email,))
        
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
        """
        Create a new user.
        Returns the new users.id (int) on success, or None on failure.
        """
        query = """
            INSERT INTO users (username, password, email, role, name)
            VALUES (%s, %s, %s, %s, %s)
        """
        return execute_insert(query, (username, password, email, role, name))
    
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
