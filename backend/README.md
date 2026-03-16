# Residential Society Management System - Backend

A Flask-based backend API for a Residential Society Management System with support for user authentication, visitor management, and service provider management.

## Tech Stack

- **Python** - Programming Language
- **Flask** - Web Framework
- **MySQL** - Database
- **Flask-CORS** - Cross-Origin Resource Sharing

## Project Structure

```
backend/
├── app.py                          # Main Flask application
├── config.py                       # Configuration management
├── database.py                     # Database connection utilities
├── init_db.py                      # Database initialization script
├── requirements.txt                # Python dependencies
│
├── models/
│   ├── user_model.py              # User model for authentication
│   ├── visitor_model.py           # Visitor management model
│   └── service_provider_model.py  # Service provider model
│
└── routes/
    ├── auth_routes.py             # Authentication endpoints
    ├── visitor_routes.py          # Visitor management endpoints
    └── service_provider_routes.py # Service provider endpoints
```

## Installation & Setup

### 1. Prerequisites

- Python 3.8+
- MySQL Server running on localhost:3306
- pip (Python package manager)

### 2. Create Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Database

Edit `.env` file with your MySQL credentials:

```
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DB=society_management
```

### 5. Initialize Database

Run the initialization script to create database tables and insert dummy data:

```bash
python init_db.py
```

This will:
- Create the `society_management` database
- Create all required tables (users, visitors, service_providers, service_requests, schedule)
- Insert dummy data for testing

### 6. Run the Backend Server

```bash
python app.py
```

Server will run on `http://localhost:5000`

## API Documentation

### Authentication Endpoints

#### Login
```
POST /login
Content-Type: application/json

{
    "username": "security1",
    "password": "pass123",
    "role": "Security"
}

Response:
{
    "success": true,
    "message": "Login successful",
    "user": {
        "id": 1,
        "username": "security1",
        "email": "security1@society.com",
        "role": "Security",
        "name": "John Smith"
    }
}
```

#### Get All Users
```
GET /users
```

#### Get Users By Role
```
GET /users/role/<role>
Example: GET /users/role/Resident
```

### Visitor Management Endpoints

#### Add Visitor
```
POST /visitors/add
Content-Type: application/json

{
    "name": "John Doe",
    "phone": "9876543210",
    "purpose": "Visit",
    "flat_number": "A-101"
}
```

#### Get All Visitors
```
GET /visitors
```

#### Get Visitor by ID
```
GET /visitors/<visitor_id>
```

#### Get Visitors by Flat Number
```
GET /visitors/flat/<flat_number>
```

#### Check Out Visitor
```
PUT /visitors/<visitor_id>/checkout
```

#### Get Active Visitors (Not Checked Out)
```
GET /visitors/active
```

### Service Provider Endpoints

#### Get All Service Providers
```
GET /providers
```

#### Get Provider by ID
```
GET /providers/<provider_id>
```

#### Get Providers by Service Type
```
GET /providers/type/<service_type>
Example: GET /providers/type/Electrician
```

#### Add Service Provider
```
POST /providers/add
Content-Type: application/json

{
    "name": "Raj Kumar",
    "service_type": "Electrician",
    "phone": "9123456789",
    "email": "raj@electric.com",
    "description": "Licensed electrician with 5 years experience",
    "rating": 4.5
}
```

#### Create Service Request
```
POST /service/request
Content-Type: application/json

{
    "provider_id": 1,
    "resident_id": 3,
    "description": "Need to fix the main switch board"
}
```

#### Get Service Requests
```
GET /service/requests
# Optional parameters:
# GET /service/requests?provider_id=1
# GET /service/requests?resident_id=3
```

#### Get Provider Schedule
```
GET /provider/schedule/<provider_id>
Example: GET /provider/schedule/1
```

#### Add Provider Schedule
```
POST /provider/schedule/add
Content-Type: application/json

{
    "provider_id": 1,
    "schedule_date": "2024-03-20",
    "start_time": "09:00:00",
    "end_time": "17:00:00"
}
```

## Database Schema

### users Table
```sql
- id (INT, Primary Key)
- username (VARCHAR, Unique)
- password (VARCHAR)
- email (VARCHAR, Unique)
- name (VARCHAR)
- role (VARCHAR) - Security, Resident, Service Provider
- created_at (TIMESTAMP)
```

### visitors Table
```sql
- id (INT, Primary Key)
- name (VARCHAR)
- phone (VARCHAR)
- purpose (VARCHAR)
- flat_number (VARCHAR)
- check_in_time (DATETIME)
- check_out_time (DATETIME, Nullable)
- created_at (TIMESTAMP)
```

### service_providers Table
```sql
- id (INT, Primary Key)
- name (VARCHAR)
- service_type (VARCHAR)
- phone (VARCHAR)
- email (VARCHAR)
- description (TEXT)
- rating (FLOAT)
- created_at (TIMESTAMP)
```

### service_requests Table
```sql
- id (INT, Primary Key)
- provider_id (INT, Foreign Key)
- resident_id (INT, Foreign Key)
- description (TEXT)
- status (VARCHAR) - pending, accepted, completed
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### schedule Table
```sql
- id (INT, Primary Key)
- provider_id (INT, Foreign Key)
- schedule_date (DATE)
- start_time (TIME)
- end_time (TIME)
- created_at (TIMESTAMP)
```

## Dummy Login Credentials

After running `init_db.py`, use these credentials to test:

### Security Guard
- Username: `security1`
- Password: `pass123`

### Resident
- Username: `resident1`
- Password: `pass123`

### Service Provider
- Username: `provider1`
- Password: `pass123`

## CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:3000` (React frontend)
- `http://localhost:5173` (Vite dev server)

Supported HTTP Methods: GET, POST, PUT, DELETE, OPTIONS

## Notes

- This is a college project backend, so password hashing is not implemented. For production use, implement proper password hashing using libraries like `bcrypt`.
- Error handling is basic - you may want to enhance it for production use.
- The database connection is synchronous and not optimized for high concurrency. Consider using connection pooling for production.
- All timestamps are in the server's timezone. Consider using UTC for multi-timezone applications.

## Troubleshooting

### MySQL Connection Error
- Ensure MySQL Server is running
- Verify credentials in `.env` file
- Check if the port (3306) is correct

### Module Not Found Error
- Ensure all dependencies are installed: `pip install -r requirements.txt`
- Check if virtual environment is activated

### CORS Error in Frontend
- Ensure Flask server is running on `localhost:5000`
- Check if CORS is properly configured in `app.py`
- Browser console shows which origin is being blocked

## Future Enhancements

- Add JWT authentication for better security
- Implement password hashing with bcrypt
- Add database connection pooling
- Add input validation middleware
- Add unit tests
- Add logging system
- Add pagination for list endpoints
- Add search and filter functionality
