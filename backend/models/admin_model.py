"""
Admin model – all DB queries needed by the admin module.
"""
from database import execute_query, execute_insert


class Admin:

    # ─────────────────────────── DASHBOARD ──────────────────────────

    @staticmethod
    def get_dashboard_stats():
        """Return counts for dashboard cards."""
        stats = {}

        rows = execute_query("SELECT COUNT(*) AS cnt FROM users WHERE role = 'RESIDENT'")
        stats['residents'] = rows[0]['cnt'] if rows else 0

        rows = execute_query("SELECT COUNT(*) AS cnt FROM users WHERE role = 'SECURITY'")
        stats['guards'] = rows[0]['cnt'] if rows else 0

        rows = execute_query("SELECT COUNT(*) AS cnt FROM service_providers")
        stats['providers'] = rows[0]['cnt'] if rows else 0

        rows = execute_query("SELECT COUNT(*) AS cnt FROM service_providers WHERE status = 'pending'")
        stats['pending_providers'] = rows[0]['cnt'] if rows else 0

        rows = execute_query("SELECT COUNT(*) AS cnt FROM visitors")
        stats['visitors'] = rows[0]['cnt'] if rows else 0

        rows = execute_query("SELECT COUNT(*) AS cnt FROM events")
        stats['events'] = rows[0]['cnt'] if rows else 0

        rows = execute_query("SELECT COUNT(*) AS cnt FROM service_requests")
        stats['service_requests'] = rows[0]['cnt'] if rows else 0

        return stats

    # ─────────────────────────── RESIDENTS ──────────────────────────

    @staticmethod
    def get_all_residents():
        query = """
            SELECT id, username, email, name, phone, flat_number, role, created_at
            FROM users WHERE role = 'RESIDENT'
            ORDER BY created_at DESC
        """
        return execute_query(query) or []

    @staticmethod
    def get_resident_by_id(user_id):
        query = "SELECT id, username, email, name, phone, flat_number, role, created_at FROM users WHERE id = %s AND role = 'RESIDENT'"
        result = execute_query(query, (user_id,))
        return result[0] if result else None

    @staticmethod
    def create_resident(username, password, email, name, phone=None, flat_number=None):
        query = """
            INSERT INTO users (username, password, email, name, role, phone, flat_number)
            VALUES (%s, %s, %s, %s, 'RESIDENT', %s, %s)
        """
        return execute_insert(query, (username, password, email, name, phone, flat_number))

    @staticmethod
    def update_user(user_id, name, email, username, phone=None, flat_number=None):
        query = """
            UPDATE users SET name = %s, email = %s, username = %s,
                             phone = %s, flat_number = %s
            WHERE id = %s
        """
        result = execute_query(query, (name, email, username, phone, flat_number, user_id))
        return isinstance(result, int) and result >= 0

    @staticmethod
    def delete_user(user_id):
        query = "DELETE FROM users WHERE id = %s"
        result = execute_query(query, (user_id,))
        return isinstance(result, int) and result > 0

    # ─────────────────────────── GUARDS ─────────────────────────────

    @staticmethod
    def get_all_guards():
        query = """
            SELECT id, username, email, name, role, created_at
            FROM users WHERE role = 'SECURITY'
            ORDER BY created_at DESC
        """
        return execute_query(query) or []

    @staticmethod
    def get_guard_by_id(user_id):
        query = "SELECT id, username, email, name, role, created_at FROM users WHERE id = %s AND role = 'SECURITY'"
        result = execute_query(query, (user_id,))
        return result[0] if result else None

    @staticmethod
    def create_guard(username, password, email, name):
        query = """
            INSERT INTO users (username, password, email, name, role)
            VALUES (%s, %s, %s, %s, 'SECURITY')
        """
        return execute_insert(query, (username, password, email, name))

    # ─────────────────────────── PROVIDERS ──────────────────────────

    @staticmethod
    def get_all_providers():
        query = """
            SELECT sp.id, sp.user_id, sp.name, sp.service_type, sp.phone,
                   sp.email, sp.description, sp.rating, sp.status, sp.created_at,
                   u.username, u.email AS user_email
            FROM service_providers sp
            JOIN users u ON sp.user_id = u.id
            ORDER BY sp.status ASC, sp.created_at DESC
        """
        return execute_query(query) or []

    @staticmethod
    def set_provider_status(provider_id, status):
        """Set provider status (approved / rejected)."""
        query = "UPDATE service_providers SET status = %s WHERE id = %s"
        result = execute_query(query, (status, provider_id))
        return isinstance(result, int) and result > 0

    @staticmethod
    def delete_provider(provider_id):
        """Delete provider profile + linked user account."""
        # Get the user_id first
        rows = execute_query("SELECT user_id FROM service_providers WHERE id = %s", (provider_id,))
        if not rows:
            return False
        user_id = rows[0]['user_id']
        # Delete user (CASCADE will remove service_providers row)
        result = execute_query("DELETE FROM users WHERE id = %s", (user_id,))
        return isinstance(result, int) and result > 0

    # ─────────────────────────── VISITORS ───────────────────────────

    @staticmethod
    def get_all_visitors():
        query = """
            SELECT id, name, phone, purpose, flat_number,
                   check_in_time, check_out_time, created_at
            FROM visitors
            ORDER BY check_in_time DESC
        """
        return execute_query(query) or []

    # ─────────────────────── SERVICE REQUESTS ────────────────────────

    @staticmethod
    def get_all_service_requests():
        query = """
            SELECT sr.id, sr.service_type, sr.description, sr.status,
                   sr.created_at, sr.updated_at,
                   u_res.name  AS resident_name,
                   u_res.email AS resident_email,
                   sp.name     AS provider_name,
                   sp.service_type AS provider_service_type
            FROM service_requests sr
            JOIN users u_res ON sr.resident_id = u_res.id
            LEFT JOIN service_providers sp ON sr.provider_id = sp.id
            ORDER BY sr.created_at DESC
        """
        return execute_query(query) or []

    # ─────────────────────────── EVENTS ─────────────────────────────

    @staticmethod
    def get_all_events():
        query = """
            SELECT e.id, e.title, e.description, e.event_date, e.event_time,
                   e.location, e.created_at, e.updated_at,
                   u.name AS created_by_name
            FROM events e
            JOIN users u ON e.created_by = u.id
            ORDER BY e.event_date ASC
        """
        return execute_query(query) or []

    @staticmethod
    def get_event_by_id(event_id):
        query = """
            SELECT e.id, e.title, e.description, e.event_date, e.event_time,
                   e.location, e.created_at, e.updated_at, e.created_by,
                   u.name AS created_by_name
            FROM events e
            JOIN users u ON e.created_by = u.id
            WHERE e.id = %s
        """
        result = execute_query(query, (event_id,))
        return result[0] if result else None

    @staticmethod
    def create_event(title, description, event_date, event_time, location, created_by):
        query = """
            INSERT INTO events (title, description, event_date, event_time, location, created_by)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        return execute_insert(query, (title, description, event_date, event_time, location, created_by))

    @staticmethod
    def update_event(event_id, title, description, event_date, event_time, location):
        query = """
            UPDATE events
            SET title = %s, description = %s, event_date = %s,
                event_time = %s, location = %s
            WHERE id = %s
        """
        result = execute_query(query, (title, description, event_date, event_time, location, event_id))
        return isinstance(result, int) and result >= 0

    @staticmethod
    def delete_event(event_id):
        query = "DELETE FROM events WHERE id = %s"
        result = execute_query(query, (event_id,))
        return isinstance(result, int) and result > 0
