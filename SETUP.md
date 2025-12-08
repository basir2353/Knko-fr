# HIPAA-Compliant Login Page - Setup Guide

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

### 1. Install Server Dependencies

```bash
cd server
npm install
```

### 2. Install Client Dependencies

```bash
cd ../client
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `server` directory:

```bash
cd ../server
cp .env.example .env
```

**IMPORTANT**: Edit `.env` and set strong secrets:

```bash
# Generate strong secrets
openssl rand -base64 32  # Use this for JWT_SECRET
openssl rand -base64 32  # Use this for ENCRYPTION_KEY
```

Update your `.env` file:
```env
JWT_SECRET=<generated-secret-1>
ENCRYPTION_KEY=<generated-secret-2>
PORT=5001
NODE_ENV=development
TOKEN_EXPIRATION=1h
```

## Running the Application

### Development Mode

1. **Start the server** (in `server` directory):
```bash
cd server
npm start
# or for development with auto-reload:
npm run dev
```

2. **Start the client** (in `client` directory):
```bash
cd client
npm start
```

The application will be available at `http://localhost:3000`

## Production Deployment

### Security Checklist

Before deploying to production:

1. ✅ Set strong `JWT_SECRET` (use `openssl rand -base64 32`)
2. ✅ Set strong `ENCRYPTION_KEY` (use `openssl rand -base64 32`)
3. ✅ Enable HTTPS (`FORCE_HTTPS=true`)
4. ✅ Configure `ALLOWED_ORIGINS` with your domain
5. ✅ Set `NODE_ENV=production`
6. ✅ Configure database backups
7. ✅ Set up monitoring for audit logs
8. ✅ Review and update security policies

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5001
JWT_SECRET=<strong-random-secret>
ENCRYPTION_KEY=<strong-random-key>
TOKEN_EXPIRATION=1h
FORCE_HTTPS=true
ALLOWED_ORIGINS=https://yourdomain.com
```

## HIPAA Compliance Features

This application includes the following HIPAA compliance features:

- ✅ **Audit Logging**: All PHI access is logged
- ✅ **Access Controls**: Role-based access control (RBAC)
- ✅ **Encryption**: Data encryption utilities provided
- ✅ **Secure Authentication**: JWT tokens with short expiration
- ✅ **Rate Limiting**: Protection against brute force attacks
- ✅ **Security Headers**: Helmet.js security headers
- ✅ **Error Handling**: No PHI exposed in error messages
- ✅ **Password Security**: Enhanced password requirements (8+ characters)

## Database

The application uses SQLite for development. The database file is created automatically at `server/database.sqlite`.

### Audit Logs

All access to Protected Health Information (PHI) is logged in the `audit_logs` table. Review these logs regularly for security monitoring.

## Troubleshooting

### Port Already in Use

If port 5001 is already in use:
1. Change `PORT` in `.env` file
2. Update client API URLs to match

### Missing Environment Variables

The application will exit if required environment variables are missing. Ensure `.env` file exists and contains:
- `JWT_SECRET`
- `ENCRYPTION_KEY`

### Token Expiration

Tokens expire after 1 hour by default. Users will need to log in again after expiration.

## Support

For HIPAA compliance questions, refer to `HIPAA_COMPLIANCE.md`

