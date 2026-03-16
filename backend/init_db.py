"""
Database initialization script
Creates tables and inserts dummy data
"""
import pymysql
from config import Config
from datetime import datetime, timedelta

def create_database():
    """Create the database if it doesn't exist"""
    try:
        # Build connection parameters
        conn_params = {
            'host': Config.MYSQL_HOST,
            'port': Config.MYSQL_PORT,
            'user': Config.MYSQL_USER,
            'charset': 'utf8mb4'
        }
        
        # Add password only if it exists
        if Config.MYSQL_PASSWORD:
            conn_params['password'] = Config.MYSQL_PASSWORD
        
        conn = pymysql.connect(**conn_params)
        cursor = conn.cursor()
        
        # Create database
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {Config.MYSQL_DB}")
        print(f"✓ Database '{Config.MYSQL_DB}' created/verified")
        
        cursor.close()
        conn.close()
    except pymysql.Error as e:
        print(f"✗ Error creating database: {e}")
        return False
    
    return True

def create_tables():
    """Create all required tables"""
    try:
        # Build connection parameters
        conn_params = {
            'host': Config.MYSQL_HOST,
            'port': Config.MYSQL_PORT,
            'user': Config.MYSQL_USER,
            'database': Config.MYSQL_DB,
            'charset': 'utf8mb4'
        }
        
        # Add password only if it exists
        if Config.MYSQL_PASSWORD:
            conn_params['password'] = Config.MYSQL_PASSWORD
        
        conn = pymysql.connect(**conn_params)
        cursor = conn.cursor()
        
        # Create users table
        users_table = """
        CREATE TABLE IF NOT EXISTS users (
            id INT PRIMARY KEY AUTO_INCREMENT,
            username VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            name VARCHAR(100) NOT NULL,
            role VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
        cursor.execute(users_table)
        print("✓ Users table created")
        
        # Create visitors table
        visitors_table = """
        CREATE TABLE IF NOT EXISTS visitors (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(100) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            purpose VARCHAR(200),
            flat_number VARCHAR(20) NOT NULL,
            check_in_time DATETIME NOT NULL,
            check_out_time DATETIME,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
        cursor.execute(visitors_table)
        print("✓ Visitors table created")
        
        # Create service_providers table
        service_providers_table = """
        CREATE TABLE IF NOT EXISTS service_providers (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(100) NOT NULL,
            service_type VARCHAR(50) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            email VARCHAR(100),
            description TEXT,
            rating FLOAT DEFAULT 0.0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
        cursor.execute(service_providers_table)
        print("✓ Service Providers table created")
        
        # Create service_requests table
        service_requests_table = """
        CREATE TABLE IF NOT EXISTS service_requests (
            id INT PRIMARY KEY AUTO_INCREMENT,
            provider_id INT NOT NULL,
            resident_id INT NOT NULL,
            description TEXT NOT NULL,
            status VARCHAR(50) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (provider_id) REFERENCES service_providers(id),
            FOREIGN KEY (resident_id) REFERENCES users(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
        cursor.execute(service_requests_table)
        print("✓ Service Requests table created")
        
        # Create schedule table
        schedule_table = """
        CREATE TABLE IF NOT EXISTS schedule (
            id INT PRIMARY KEY AUTO_INCREMENT,
            provider_id INT NOT NULL,
            schedule_date DATE NOT NULL,
            start_time TIME NOT NULL,
            end_time TIME NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (provider_id) REFERENCES service_providers(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
        cursor.execute(schedule_table)
        print("✓ Schedule table created")
        
        conn.commit()
        cursor.close()
        conn.close()
        return True
    except pymysql.Error as e:
        print(f"✗ Error creating tables: {e}")
        return False

def insert_dummy_data():
    """Insert dummy data for testing"""
    try:
        conn = pymysql.connect(
            host=Config.MYSQL_HOST,
            port=Config.MYSQL_PORT,
            user=Config.MYSQL_USER,
            password=Config.MYSQL_PASSWORD,
            database=Config.MYSQL_DB,
            charset='utf8mb4'
        )
        cursor = conn.cursor()
        
        # Clear existing data
        cursor.execute("DELETE FROM schedule")
        cursor.execute("DELETE FROM service_requests")
        cursor.execute("DELETE FROM service_providers")
        cursor.execute("DELETE FROM visitors")
        cursor.execute("DELETE FROM users")
        
        # Insert dummy users
        users_data = [
            ('security1', 'pass123', 'security1@society.com', 'John Smith', 'Security'),
            ('security2', 'pass123', 'security2@society.com', 'Mike Johnson', 'Security'),
            ('resident1', 'pass123', 'resident1@society.com', 'Alice Brown', 'Resident'),
            ('resident2', 'pass123', 'resident2@society.com', 'Bob Wilson', 'Resident'),
            ('resident3', 'pass123', 'resident3@society.com', 'Carol White', 'Resident'),
            ('provider1', 'pass123', 'provider1@society.com', 'Raj Kumar', 'Service Provider'),
            ('provider2', 'pass123', 'provider2@society.com', 'Priya Singh', 'Service Provider'),
            ('provider3', 'pass123', 'provider3@society.com', 'Rohan Desai', 'Service Provider'),
        ]
        
        for user in users_data:
            cursor.execute("""
                INSERT INTO users (username, password, email, name, role)
                VALUES (%s, %s, %s, %s, %s)
            """, user)
        print("✓ Dummy users inserted")
        
        # Insert dummy visitors
        now = datetime.now()
        visitors_data = [
            ('Ramesh Singh', '9876543210', 'Maintenance', 'A-101', now - timedelta(hours=2)),
            ('Neha Patel', '9876543211', 'Visit', 'B-205', now - timedelta(hours=1)),
            ('Arjun Verma', '9876543212', 'Delivery', 'C-310', now - timedelta(minutes=30)),
            ('Pooja Sharma', '9876543213', 'Visit', 'A-102', now),
            ('Vikram Singh', '9876543214', 'Service', 'B-206', now + timedelta(minutes=5)),
        ]
        
        for visitor in visitors_data:
            cursor.execute("""
                INSERT INTO visitors (name, phone, purpose, flat_number, check_in_time)
                VALUES (%s, %s, %s, %s, %s)
            """, visitor)
        print("✓ Dummy visitors inserted")
        
        # Insert dummy service providers
        providers_data = [
            ('Raj Electrician', 'Electrician', '9123456789', 'raj@electric.com', 'Licensed electrician with 5 years experience', 4.5),
            ('Amit Plumber', 'Plumber', '9123456790', 'amit@plumber.com', 'Expert in all plumbing issues', 4.7),
            ('Priya Maid', 'Maid', '9123456791', 'priya@maid.com', 'Professional cleaning and housekeeping', 4.6),
            ('Mohan Driver', 'Driver', '9123456792', 'mohan@driver.com', 'Experienced driver, 15 years in profession', 4.4),
            ('Clean Pest Control', 'Pest Control', '9123456793', 'clean@pest.com', 'Safe and effective pest control services', 4.8),
            ('Chef Rahul', 'Cook', '9123456794', 'chef@cook.com', 'Professional chef for all cuisines', 4.9),
        ]
        
        for provider in providers_data:
            cursor.execute("""
                INSERT INTO service_providers (name, service_type, phone, email, description, rating)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, provider)
        print("✓ Dummy service providers inserted")
        
        # Insert dummy service requests
        requests_data = [
            (1, 3, 'Need to fix the main switch board'),
            (2, 4, 'Leaky tap in bathroom needs repair'),
            (3, 5, 'Need weekly house cleaning'),
            (4, 3, 'Need transport for airport'),
            (5, 4, 'Cockroach problem in kitchen'),
        ]
        
        for req in requests_data:
            cursor.execute("""
                INSERT INTO service_requests (provider_id, resident_id, description)
                VALUES (%s, %s, %s)
            """, req)
        print("✓ Dummy service requests inserted")
        
        # Insert dummy schedule
        tomorrow = (datetime.now() + timedelta(days=1)).date()
        schedule_data = [
            (1, tomorrow, '09:00:00', '12:00:00'),
            (2, tomorrow, '14:00:00', '17:00:00'),
            (3, tomorrow, '10:00:00', '13:00:00'),
            (4, tomorrow, '06:00:00', '22:00:00'),
            (5, tomorrow, '08:00:00', '18:00:00'),
        ]
        
        for schedule in schedule_data:
            cursor.execute("""
                INSERT INTO schedule (provider_id, schedule_date, start_time, end_time)
                VALUES (%s, %s, %s, %s)
            """, schedule)
        print("✓ Dummy schedule inserted")
        
        conn.commit()
        cursor.close()
        conn.close()
        return True
    except pymysql.Error as e:
        print(f"✗ Error inserting dummy data: {e}")
        return False

def main():
    """Main function to initialize database"""
    print("=" * 50)
    print("Database Initialization Script")
    print("=" * 50)
    
    print("\nStep 1: Creating database...")
    if not create_database():
        print("Failed to create database")
        return
    
    print("\nStep 2: Creating tables...")
    if not create_tables():
        print("Failed to create tables")
        return
    
    print("\nStep 3: Inserting dummy data...")
    if not insert_dummy_data():
        print("Failed to insert dummy data")
        return
    
    print("\n" + "=" * 50)
    print("✓ Database initialization completed successfully!")
    print("=" * 50)
    print("\nDummy Credentials for Testing:")
    print("-" * 50)
    print("Security Guard:")
    print("  Username: security1 | Password: pass123")
    print("\nResident:")
    print("  Username: resident1 | Password: pass123")
    print("\nService Provider:")
    print("  Username: provider1 | Password: pass123")
    print("-" * 50)

if __name__ == '__main__':
    main()
