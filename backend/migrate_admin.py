"""
Admin Module Migration Script
Run this ONCE to:
  1. Add 'status' column to service_providers (pending/approved/rejected)
  2. Create the 'events' table
  3. Insert the admin seed user (admin / admin123)
  4. Set existing providers to 'approved'
"""
import pymysql
from config import Config


def get_conn():
    params = {
        'host': Config.MYSQL_HOST,
        'port': Config.MYSQL_PORT,
        'user': Config.MYSQL_USER,
        'database': Config.MYSQL_DB,
        'charset': 'utf8mb4',
    }
    if Config.MYSQL_PASSWORD:
        params['password'] = Config.MYSQL_PASSWORD
    return pymysql.connect(**params)


def run_migration():
    print("=" * 60)
    print("Admin Module Migration")
    print("=" * 60)

    conn = get_conn()
    cursor = conn.cursor()

    # ── 1. Add status column to service_providers ──────────────────
    try:
        cursor.execute("""
            ALTER TABLE service_providers
            ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'pending'
        """)
        print("✓ Added 'status' column to service_providers")
    except pymysql.err.OperationalError as e:
        if 'Duplicate column name' in str(e) or '1060' in str(e):
            print("  (status column already exists – skipped)")
        else:
            raise

    # ── 2. Set existing providers to 'approved' ────────────────────
    cursor.execute("UPDATE service_providers SET status = 'approved' WHERE status = 'pending'")
    print(f"✓ Set {cursor.rowcount} existing provider(s) to 'approved'")

    # ── 3. Create events table ──────────────────────────────────────
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS events (
            id INT PRIMARY KEY AUTO_INCREMENT,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            event_date DATE NOT NULL,
            event_time TIME,
            location VARCHAR(200),
            created_by INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """)
    print("✓ 'events' table created (or already existed)")

    # ── 4. Insert admin user ────────────────────────────────────────
    cursor.execute("SELECT id FROM users WHERE username = 'admin'")
    if cursor.fetchone():
        print("  (admin user already exists – skipped)")
    else:
        cursor.execute("""
            INSERT INTO users (username, password, email, name, role)
            VALUES ('admin', 'admin123', 'admin@society.com', 'System Admin', 'ADMIN')
        """)
        admin_id = cursor.lastrowid
        print(f"✓ Admin user created (users.id = {admin_id})")

        # Seed a couple of sample events
        cursor.execute("""
            INSERT INTO events (title, description, event_date, event_time, location, created_by)
            VALUES
              ('Society AGM', 'Annual General Meeting for all residents', CURDATE() + INTERVAL 7 DAY, '18:00:00', 'Community Hall', %s),
              ('Diwali Celebration', 'Society Diwali get-together with games and food', CURDATE() + INTERVAL 14 DAY, '19:00:00', 'Garden Area', %s)
        """, (admin_id, admin_id))
        print("✓ Sample events seeded")

    conn.commit()
    cursor.close()
    conn.close()

    print("\n" + "=" * 60)
    print("✓ Migration completed successfully!")
    print("=" * 60)
    print("\n  Admin Credentials:")
    print("  Username : admin")
    print("  Password : admin123")
    print("  Role     : ADMIN")
    print("-" * 60)


if __name__ == '__main__':
    run_migration()
