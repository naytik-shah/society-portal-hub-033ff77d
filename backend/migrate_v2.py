"""
Migration v2:
  1. Add phone + flat_number columns to users table
  2. Ensure events table exists (re-create if missing)
  3. Add ON DELETE CASCADE to events FK (safe)
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


def run():
    conn = get_conn()
    cursor = conn.cursor()

    print("=" * 60)
    print("Migration v2 – Phone/Flat + Events fix")
    print("=" * 60)

    # ── 1. Add phone to users ──────────────────────────────────────
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN phone VARCHAR(20) DEFAULT NULL")
        print("✓ Added 'phone' column to users")
    except pymysql.err.OperationalError as e:
        if '1060' in str(e) or 'Duplicate column' in str(e):
            print("  (phone already exists – skipped)")
        else:
            raise

    # ── 2. Add flat_number to users ────────────────────────────────
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN flat_number VARCHAR(20) DEFAULT NULL")
        print("✓ Added 'flat_number' column to users")
    except pymysql.err.OperationalError as e:
        if '1060' in str(e) or 'Duplicate column' in str(e):
            print("  (flat_number already exists – skipped)")
        else:
            raise

    # ── 3. Create events table (idempotent) ────────────────────────
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
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    """)
    print("✓ 'events' table ensured")

    conn.commit()
    cursor.close()
    conn.close()

    print("\n✓ Migration v2 completed successfully!")
    print("=" * 60)


if __name__ == '__main__':
    run()
