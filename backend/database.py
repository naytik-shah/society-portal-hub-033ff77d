"""
Database connection module
"""
import pymysql
from config import Config

def get_db_connection():
    """
    Create and return a database connection
    """
    try:
        # Build connection parameters
        conn_params = {
            'host': Config.MYSQL_HOST,
            'port': Config.MYSQL_PORT,
            'user': Config.MYSQL_USER,
            'database': Config.MYSQL_DB,  # IMPORTANT: Include database name
            'charset': 'utf8mb4',
            'cursorclass': pymysql.cursors.DictCursor
        }
        
        # Add password only if it exists
        if Config.MYSQL_PASSWORD:
            conn_params['password'] = Config.MYSQL_PASSWORD
        
        conn = pymysql.connect(**conn_params)
        return conn
    except pymysql.Error as e:
        print(f"Database connection error: {e}")
        return None

def execute_query(query, params=None):
    """
    Execute a database query and return results
    """
    conn = get_db_connection()
    if not conn:
        return None
    
    try:
        cursor = conn.cursor()
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
        
        if query.strip().upper().startswith('SELECT'):
            result = cursor.fetchall()
        else:
            conn.commit()
            result = cursor.rowcount
        
        cursor.close()
        conn.close()
        return result
    except pymysql.Error as e:
        print(f"Query execution error: {e}")
        return None

def execute_insert(query, params=None):
    """
    Execute an INSERT query and return the last inserted ID.
    Returns None on failure.
    """
    conn = get_db_connection()
    if not conn:
        return None
    
    try:
        cursor = conn.cursor()
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
        conn.commit()
        last_id = cursor.lastrowid
        cursor.close()
        conn.close()
        return last_id
    except pymysql.Error as e:
        print(f"Insert execution error: {e}")
        return None
