"""
Visitor model for visitor management
"""
from database import execute_query
from datetime import datetime

class Visitor:
    """Visitor model class"""
    
    @staticmethod
    def add_visitor(name, phone, purpose, flat_number, check_in_time=None):
        """
        Add a new visitor to the log
        """
        if not check_in_time:
            check_in_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        query = """
            INSERT INTO visitors (name, phone, purpose, flat_number, check_in_time)
            VALUES (%s, %s, %s, %s, %s)
        """
        result = execute_query(query, (name, phone, purpose, flat_number, check_in_time))
        return result > 0 if result else False
    
    @staticmethod
    def get_all_visitors():
        """Get all visitors"""
        query = "SELECT * FROM visitors ORDER BY check_in_time DESC"
        return execute_query(query)
    
    @staticmethod
    def get_visitor_by_id(visitor_id):
        """Get visitor by ID"""
        query = "SELECT * FROM visitors WHERE id = %s"
        result = execute_query(query, (visitor_id,))
        
        if result and len(result) > 0:
            return result[0]
        return None
    
    @staticmethod
    def get_visitors_by_flat(flat_number):
        """Get visitors for a specific flat"""
        query = "SELECT * FROM visitors WHERE flat_number = %s ORDER BY check_in_time DESC"
        return execute_query(query, (flat_number,))
    
    @staticmethod
    def check_out_visitor(visitor_id):
        """Mark visitor as checked out"""
        query = "UPDATE visitors SET check_out_time = %s WHERE id = %s"
        result = execute_query(query, (datetime.now().strftime('%Y-%m-%d %H:%M:%S'), visitor_id))
        return result > 0 if result else False
    
    @staticmethod
    def get_active_visitors():
        """Get all active visitors (not checked out)"""
        query = "SELECT * FROM visitors WHERE check_out_time IS NULL ORDER BY check_in_time DESC"
        return execute_query(query)
