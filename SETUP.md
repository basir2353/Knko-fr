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

### Deploying to Render (Backend) and Vercel (Frontend)

#### Render Backend Setup

1. **Create a new Web Service on Render**
   - Connect your GitHub repository
   - Set the root directory to `server`
   - Build command: `npm install`
   - Start command: `npm start`

2. **Set Environment Variables on Render:**
   - Go to your Render service → Environment tab
   - Add the following environment variables:
   
   ```
   NODE_ENV=production
   PORT=5001
   JWT_SECRET=<generate-strong-secret>
   ENCRYPTION_KEY=<generate-strong-key>
   TOKEN_EXPIRATION=1h
   ALLOWED_ORIGINS=https://knko-fr.vercel.app
   ```
   
   **CRITICAL:** The `ALLOWED_ORIGINS` must include your Vercel frontend URL. If you have multiple origins, separate them with commas:
   ```
   ALLOWED_ORIGINS=https://knko-fr.vercel.app,https://www.yourdomain.com
   ```

3. **Generate Secrets:**
   ```bash
   openssl rand -base64 32  # For JWT_SECRET
   openssl rand -base64 32  # For ENCRYPTION_KEY
   ```

#### Vercel Frontend Setup

1. **Create a new project on Vercel**
   - Connect your GitHub repository
   - Set the root directory to `client`
   - Framework preset: Create React App

2. **Set Environment Variables on Vercel:**
   - Go to your Vercel project → Settings → Environment Variables
   - Add:
   ```
   REACT_APP_API_URL=https://knko-fr.onrender.com
   ```
   (Replace `knko-fr.onrender.com` with your actual Render backend URL)

3. **Redeploy** after setting environment variables

#### Common CORS Issues

If you see CORS errors like:
```
Access to fetch at 'https://knko-fr.onrender.com/api/auth/login' from origin 'https://knko-fr.vercel.app' has been blocked by CORS policy
```

**Solution:**
1. Verify `ALLOWED_ORIGINS` on Render includes your Vercel URL exactly (including `https://`)
2. Make sure there are no trailing slashes in the URL
3. If you have multiple origins, separate them with commas (no spaces)
4. Redeploy the Render service after updating environment variables
5. Check Render logs to see if CORS is blocking requests

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

### CORS Errors in Production

If you're getting CORS errors when the frontend (Vercel) tries to connect to the backend (Render):

1. **Check ALLOWED_ORIGINS on Render:**
   - Go to your Render service → Environment tab
   - Verify `ALLOWED_ORIGINS` is set and includes your Vercel URL
   - Format: `ALLOWED_ORIGINS=https://knko-fr.vercel.app` (no trailing slash)
   - For multiple origins: `ALLOWED_ORIGINS=https://domain1.com,https://domain2.com`

2. **Verify the URLs match exactly:**
   - The origin in the error message must match exactly what's in `ALLOWED_ORIGINS`
   - Check for `http://` vs `https://` mismatches
   - Check for trailing slashes

3. **Redeploy after changes:**
   - After updating environment variables on Render, you must redeploy the service
   - The changes take effect only after redeployment

4. **Check Render logs:**
   - Look for CORS warning messages in the logs
   - They will show which origins are being blocked

## Support

For HIPAA compliance questions, refer to `HIPAA_COMPLIANCE.md`

