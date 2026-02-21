# 🔍 Check Database Connection

## Step 1: Test Database Connection

After deploying, visit this URL in your browser:

**`https://your-vercel-app.vercel.app/api/test-db`**

This will show you:
- ✅ If MongoDB is connected
- ✅ Which database is being used
- ✅ What collections exist
- ✅ If MONGODB_URI is set

---

## Step 2: Check Vercel Logs

1. Go to **Vercel Dashboard** → Your Project
2. Click **"Deployments"** → Latest deployment
3. Click **"View Function Logs"**
4. Look for:
   - `✅ MongoDB Connected to database: fod-clinic`
   - `❌ MongoDB Connection Error:` (if there's an error)

---

## Step 3: Verify Environment Variables

1. Vercel Dashboard → **Settings** → **Environment Variables**
2. Check `MONGODB_URI`:
   - Should be: `mongodb+srv://sakariyeaadam59_db_user:YOUR_PASSWORD@cluster0.onilzs6.mongodb.net/?appName=Cluster0`
   - ⚠️ Replace `YOUR_PASSWORD` with actual password!
   - Should be set for: ✅ Production, ✅ Preview, ✅ Development

---

## Step 4: Check MongoDB Atlas

1. Go to **MongoDB Atlas Dashboard**
2. **Network Access** → Make sure `0.0.0.0/0` is whitelisted
3. **Database Access** → Verify user `sakariyeaadam59_db_user` exists
4. **Browse Collections** → Check if `fod-clinic` database exists

---

## Common Issues:

### Issue 1: MONGODB_URI Not Set
**Error:** `MONGODB_URI environment variable is not defined!`
**Fix:** Set it in Vercel Environment Variables

### Issue 2: Wrong Password
**Error:** `MongoDB connection failed: Authentication failed`
**Fix:** Update password in MONGODB_URI

### Issue 3: Network Access Blocked
**Error:** `MongoDB connection failed: IP not whitelisted`
**Fix:** MongoDB Atlas → Network Access → Add `0.0.0.0/0`

### Issue 4: Database Doesn't Exist
**Error:** Connection succeeds but no data
**Fix:** Database will be created automatically on first write

---

## Quick Test:

1. Visit: `/api/test-db` - Should show connection status
2. Check browser console (F12) - Look for errors
3. Check Vercel logs - Look for MongoDB connection messages

---

**After checking these, share what you see and I'll help fix it!**
