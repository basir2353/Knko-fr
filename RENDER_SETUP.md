# Render Deployment - CORS Fix Checklist

## ⚠️ CRITICAL: Set Environment Variable on Render

Your CORS error is happening because the `ALLOWED_ORIGINS` environment variable is not set on Render.

## Step-by-Step Fix

### 1. Go to Render Dashboard
- Visit: https://dashboard.render.com
- Sign in to your account

### 2. Select Your Backend Service
- Click on your web service (the one running `knko-fr.onrender.com`)

### 3. Go to Environment Tab
- Click **"Environment"** in the left sidebar

### 4. Add/Update ALLOWED_ORIGINS
- **Key:** `ALLOWED_ORIGINS`
- **Value:** `https://knko-fr.vercel.app`
- ⚠️ **IMPORTANT:** 
  - No quotes around the value
  - No trailing slash
  - Must include `https://`
  - Exact match with your Vercel URL

### 5. Save Changes
- Click **"Save Changes"** button

### 6. Redeploy
- Go to **"Manual Deploy"** or **"Events"** tab
- Click **"Deploy latest commit"** or **"Redeploy"**
- ⚠️ **CRITICAL:** Environment variable changes require a redeploy to take effect!

### 7. Verify in Logs
After redeploy, check the logs. You should see:
```
✅ CORS allowed origins: [ 'https://knko-fr.vercel.app' ]
✅ CORS configured for 1 origin(s)
```

If you see:
```
❌ ERROR: ALLOWED_ORIGINS not set or empty in production!
```
Then the environment variable is still not set correctly.

## Multiple Origins

If you need to allow multiple frontend domains, separate them with commas (no spaces):
```
ALLOWED_ORIGINS=https://knko-fr.vercel.app,https://www.yourdomain.com
```

## Common Mistakes

❌ **Wrong:**
- `ALLOWED_ORIGINS="https://knko-fr.vercel.app"` (quotes)
- `ALLOWED_ORIGINS=https://knko-fr.vercel.app/` (trailing slash)
- `ALLOWED_ORIGINS=knko-fr.vercel.app` (missing https://)
- `ALLOWED_ORIGINS = https://knko-fr.vercel.app` (spaces)

✅ **Correct:**
- `ALLOWED_ORIGINS=https://knko-fr.vercel.app`

## Test After Fix

1. Go to your Vercel site: https://knko-fr.vercel.app
2. Try to log in
3. Open browser DevTools → Network tab
4. Check the login request:
   - Should return status 200 (not CORS error)
   - Response headers should include `Access-Control-Allow-Origin`

## Still Not Working?

1. **Check Render logs** - Look for CORS debug messages
2. **Verify environment variable** - Make sure it's saved and service is redeployed
3. **Check URL match** - Origin must match exactly (case-sensitive)
4. **Clear browser cache** - Sometimes cached CORS errors persist

## Quick Reference

**Environment Variable to Set:**
```
ALLOWED_ORIGINS=https://knko-fr.vercel.app
```

**After Setting:**
- ✅ Save changes
- ✅ Redeploy service
- ✅ Check logs for confirmation
- ✅ Test login from Vercel

