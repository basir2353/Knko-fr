# Login/Signup Page Application

A full-stack authentication application with React frontend, Node.js backend, and SQLite database. Supports three user types: Patient, Admin, and Practitioner.

## Features

- User registration (Signup) for Patient, Admin, and Practitioner
- User login with email and password
- JWT-based authentication
- Protected dashboard with user information
- Modern, responsive UI design
- SQLite database for data persistence

## Project Structure

```
login-page/
├── client/          # React frontend application
├── server/          # Node.js backend application
│   ├── config/      # Database configuration
│   └── routes/      # API routes
└── package.json     # Root package.json for running both apps
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Install root dependencies:
```bash
npm install
```

2. Install server dependencies:
```bash
cd server
npm install
```

3. Install client dependencies:
```bash
cd client
npm install
```

Or use the convenience script:
```bash
npm run install-all
```

## Running the Application

### Development Mode (Both Frontend and Backend)

From the root directory:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5001`
- Frontend React app on `http://localhost:3000`

**Note:** Port 5001 is used instead of 5000 because macOS Control Center uses port 5000 by default.

### Running Separately

**Backend only:**
```bash
cd server
npm run dev
```
(Server runs on port 5001)

**Frontend only:**
```bash
cd client
npm start
```

## API Endpoints

### POST `/api/auth/signup`
Register a new user

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "userType": "patient" // or "practitioner" or "admin"
}
```

### POST `/api/auth/login`
Login with email and password

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### GET `/api/auth/verify`
Verify JWT token (requires Authorization header)

**Headers:**
```
Authorization: Bearer <token>
```

## Database

The application uses SQLite database. The database file (`database.sqlite`) will be automatically created in the `server` directory when you first run the application.

### User Table Schema

- `id` - Primary key
- `email` - Unique email address
- `password` - Hashed password (bcrypt)
- `firstName` - User's first name
- `lastName` - User's last name
- `userType` - One of: 'patient', 'admin', 'practitioner'
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

## Environment Variables

Create a `.env` file in the `server` directory:

```
PORT=5001
JWT_SECRET=your-secret-key-change-in-production
```

**Note:** Port 5001 is used to avoid conflicts with macOS Control Center which uses port 5000.

## Technologies Used

### Frontend
- React
- CSS3

### Backend
- Node.js
- Express.js
- SQLite3
- bcryptjs (password hashing)
- jsonwebtoken (JWT authentication)
- express-validator (input validation)

## Security Features

- Passwords are hashed using bcrypt
- JWT tokens for secure authentication
- Input validation on both client and server
- CORS enabled for cross-origin requests

## Notes

- The JWT secret should be changed in production
- For production, consider using PostgreSQL or MySQL instead of SQLite
- Add rate limiting for production use
- Implement password reset functionality if needed

