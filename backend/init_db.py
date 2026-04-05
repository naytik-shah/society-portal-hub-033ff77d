"""
Database initialization script
Creates tables and inserts dummy data

SCHEMA DESIGN:
  users (id PK) ← service_providers (user_id FK → users.id)
  service_requests (resident_id FK → users.id, provider_id FK → service_providers.id)
  schedule (provider_id FK → service_providers.id)
"""
import pymysql
from config import Config
from datetime import datetime, timedelta

def create_database():
    """Create the database if it doesn't exist"""
    try:
        conn_params = {
            'host': Config.MYSQL_HOST,
            'port': Config.MYSQL_PORT,
            'user': Config.MYSQL_USER,
            'charset': 'utf8mb4'
        }
        if Config.MYSQL_PASSWORD:
            conn_params['password'] = Config.MYSQL_PASSWORD
        
        conn = pymysql.connect(**conn_params)
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {Config.MYSQL_DB}")
        print(f"✓ Database '{Config.MYSQL_DB}' created/verified")
        cursor.close()
        conn.close()
    except pymysql.Error as e:
        print(f"✗ Error creating database: {e}")
        return False
    return True

def drop_tables():
    """Drop all tables in correct order (respecting FK constraints)"""
    try:
        conn_params = {
            'host': Config.MYSQL_HOST,
            'port': Config.MYSQL_PORT,
            'user': Config.MYSQL_USER,
            'database': Config.MYSQL_DB,
            'charset': 'utf8mb4'
        }
        if Config.MYSQL_PASSWORD:
            conn_params['password'] = Config.MYSQL_PASSWORD
        
        conn = pymysql.connect(**conn_params)
        cursor = conn.cursor()
        
        # Drop in reverse dependency order
        tables = ['schedule', 'service_requests', 'service_providers', 'visitors', 'users']
        for table in tables:
            cursor.execute(f"DROP TABLE IF EXISTS {table}")
            print(f"  ✓ Dropped table '{table}'")
        
        conn.commit()
        cursor.close()
        conn.close()
        return True
    except pymysql.Error as e:
        print(f"✗ Error dropping tables: {e}")
        return False

def create_tables():
    """Create all required tables with proper FK relationships"""
    try:
        conn_params = {
            'host': Config.MYSQL_HOST,
            'port': Config.MYSQL_PORT,
            'user': Config.MYSQL_USER,
            'database': Config.MYSQL_DB,
            'charset': 'utf8mb4'
        }
        if Config.MYSQL_PASSWORD:
            conn_params['password'] = Config.MYSQL_PASSWORD
        
        conn = pymysql.connect(**conn_params)
        cursor = conn.cursor()
        
        # 1. Users table (no dependencies)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INT PRIMARY KEY AUTO_INCREMENT,
            username VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            name VARCHAR(100) NOT NULL,
            role VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        print("✓ Users table created")
        
        # 2. Visitors table (no dependencies)
        cursor.execute("""
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
        """)
        print("✓ Visitors table created")
        
        # 3. Service Providers table (depends on users)
        #    user_id links to the provider's login account
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS service_providers (
            id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT NOT NULL,
            name VARCHAR(100) NOT NULL,
            service_type VARCHAR(50) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            email VARCHAR(100),
            description TEXT,
            rating FLOAT DEFAULT 0.0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        print("✓ Service Providers table created (with user_id FK → users.id)")
        
        # 4. Service Requests table
        #    resident_id → users.id (the resident who made the request)
        #    provider_id → service_providers.id (the provider assigned, nullable for OPEN)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS service_requests (
            id INT PRIMARY KEY AUTO_INCREMENT,
            resident_id INT NOT NULL,
            provider_id INT NULL,
            service_type VARCHAR(100) NOT NULL,
            description TEXT NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (resident_id) REFERENCES users(id),
            FOREIGN KEY (provider_id) REFERENCES service_providers(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        print("✓ Service Requests table created (resident_id → users, provider_id → service_providers)")
        
        # 5. Schedule table (depends on service_providers)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS schedule (
            id INT PRIMARY KEY AUTO_INCREMENT,
            provider_id INT NOT NULL,
            schedule_date DATE NOT NULL,
            start_time TIME NOT NULL,
            end_time TIME NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (provider_id) REFERENCES service_providers(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        print("✓ Schedule table created")
        
        conn.commit()
        cursor.close()
        conn.close()
        return True
    except pymysql.Error as e:
        print(f"✗ Error creating tables: {e}")
        return False

def insert_dummy_data():
    """Insert dummy data with proper relational links"""
    try:
        conn_params = {
            'host': Config.MYSQL_HOST,
            'port': Config.MYSQL_PORT,
            'user': Config.MYSQL_USER,
            'database': Config.MYSQL_DB,
            'charset': 'utf8mb4'
        }
        if Config.MYSQL_PASSWORD:
            conn_params['password'] = Config.MYSQL_PASSWORD
        
        conn = pymysql.connect(**conn_params)
        cursor = conn.cursor()
        
        # ── Users ──
        # IDs will be: 1-2 Security, 3-5 Residents, 6-11 Providers
        users_data = [
            ('security1', 'pass123', 'security1@society.com', 'John Smith', 'SECURITY'),
            ('security2', 'pass123', 'security2@society.com', 'Mike Johnson', 'SECURITY'),
            ('resident1', 'pass123', 'resident1@society.com', 'Alice Brown', 'RESIDENT'),
            ('resident2', 'pass123', 'resident2@society.com', 'Bob Wilson', 'RESIDENT'),
            ('resident3', 'pass123', 'resident3@society.com', 'Carol White', 'RESIDENT'),
            ('provider1', 'pass123', 'provider1@society.com', 'Raj Kumar', 'PROVIDER'),
            ('provider2', 'pass123', 'provider2@society.com', 'Priya Singh', 'PROVIDER'),
            ('provider3', 'pass123', 'provider3@society.com', 'Rohan Desai', 'PROVIDER'),
            ('provider4', 'pass123', 'provider4@society.com', 'Mohan Kumar', 'PROVIDER'),
            ('provider5', 'pass123', 'provider5@society.com', 'Vikram Sharma', 'PROVIDER'),
            ('provider6', 'pass123', 'provider6@society.com', 'Rahul Gupta', 'PROVIDER'),
        ]
        
        for user in users_data:
            cursor.execute("""
                INSERT INTO users (username, password, email, name, role)
                VALUES (%s, %s, %s, %s, %s)
            """, user)
        print("✓ Dummy users inserted (2 security, 3 residents, 6 providers)")
        
        # ── Service Providers (linked to provider users via user_id) ──
        # user_id 6-11 correspond to provider1-provider6
        providers_data = [
            (6,  'Raj Electrician',    'Electrician',   '9123456789', 'raj@electric.com',  'Licensed electrician with 5 years experience', 4.5),
            (7,  'Priya Plumbing',     'Plumber',       '9123456790', 'priya@plumber.com',  'Expert in all plumbing issues', 4.7),
            (8,  'Rohan Cleaning',     'Maid',          '9123456791', 'rohan@maid.com',     'Professional cleaning and housekeeping', 4.6),
            (9,  'Mohan Transport',    'Driver',        '9123456792', 'mohan@driver.com',   'Experienced driver, 15 years in profession', 4.4),
            (10, 'Clean Pest Control', 'Pest Control',  '9123456793', 'clean@pest.com',     'Safe and effective pest control services', 4.8),
            (11, 'Chef Rahul',         'Cook',          '9123456794', 'chef@cook.com',      'Professional chef for all cuisines', 4.9),
        ]
        
        for provider in providers_data:
            cursor.execute("""
                INSERT INTO service_providers (user_id, name, service_type, phone, email, description, rating)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, provider)
        print("✓ Service providers inserted (linked to users via user_id FK)")
        
        # ── Visitors ──
        now = datetime.now()
        visitors_data = [
            ('Ramesh Singh',  '9876543210', 'Maintenance', 'A-101', now - timedelta(hours=2)),
            ('Neha Patel',    '9876543211', 'Visit',       'B-205', now - timedelta(hours=1)),
            ('Arjun Verma',   '9876543212', 'Delivery',    'C-310', now - timedelta(minutes=30)),
            ('Pooja Sharma',  '9876543213', 'Visit',       'A-102', now),
            ('Vikram Singh',  '9876543214', 'Service',     'B-206', now + timedelta(minutes=5)),
        ]
        
        for visitor in visitors_data:
            cursor.execute("""
                INSERT INTO visitors (name, phone, purpose, flat_number, check_in_time)
                VALUES (%s, %s, %s, %s, %s)
            """, visitor)
        print("✓ Dummy visitors inserted")
        
        # ── Service Requests (all OPEN, no provider assigned) ──
        # resident_id references users.id (residents are IDs 3,4,5)
        # provider_id is NULL → OPEN for any provider to accept
        requests_data = [
            (3, 'Electrician',   'Need to fix the main switch board'),
            (4, 'Plumber',       'Leaky tap in bathroom needs repair'),
            (5, 'Cleaning',      'Need weekly house cleaning'),
            (3, 'Transport',     'Need transport for airport'),
            (4, 'Pest Control',  'Cockroach problem in kitchen'),
        ]
        
        for req in requests_data:
            cursor.execute("""
                INSERT INTO service_requests (resident_id, service_type, description)
                VALUES (%s, %s, %s)
            """, req)
        print("✓ Dummy service requests inserted (all OPEN)")
        
        # ── Schedule ──
        # provider_id references service_providers.id (IDs 1-6)
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
    print("=" * 60)
    print("Database Initialization Script")
    print("=" * 60)
    
    print("\nStep 1: Creating database...")
    if not create_database():
        print("Failed to create database")
        return
    
    print("\nStep 2: Dropping old tables (clean slate)...")
    if not drop_tables():
        print("Failed to drop tables")
        return
    
    print("\nStep 3: Creating tables with proper FK relationships...")
    if not create_tables():
        print("Failed to create tables")
        return
    
    print("\nStep 4: Inserting dummy data...")
    if not insert_dummy_data():
        print("Failed to insert dummy data")
        return
    
    print("\n" + "=" * 60)
    print("✓ Database initialization completed successfully!")
    print("=" * 60)
    print("\n  SCHEMA RELATIONSHIPS:")
    print("  ─────────────────────")
    print("  service_providers.user_id  → users.id")
    print("  service_requests.resident_id → users.id")
    print("  service_requests.provider_id → service_providers.id")
    print("  schedule.provider_id → service_providers.id")
    print()
    print("  DUMMY CREDENTIALS:")
    print("  ─────────────────")
    print("  Security:  security1 / pass123")
    print("  Resident:  resident1 / pass123")
    print("  Provider:  provider1 / pass123 (through provider6)")
    print("-" * 60)

if __name__ == '__main__':
    main()
