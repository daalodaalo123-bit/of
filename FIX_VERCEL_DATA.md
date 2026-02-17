# 🔧 Fix: Data Not Showing in Vercel

## The Problem:
Your local app and Vercel should connect to the **same MongoDB database**. If data isn't showing, it's usually because:

1. **Environment variable not set correctly in Vercel**
2. **Missing database name in connection string**
3. **Different database being used**

---

## ✅ Quick Fix:

### Step 1: Check Vercel Environment Variables

1. Go to: **https://vercel.com/dashboard**
2. Click your project: **`fod-clinic-management`**
3. Go to **"Settings"** → **"Environment Variables"**
4. Check `MONGODB_URI` value

### Step 2: Update MongoDB Connection String

Your connection string should include the **database name**:

**Current (might be missing database):**
```
mongodb+srv://sakariyeaadam59_db_user:PASSWORD@cluster0.onilzs6.mongodb.net/?appName=Cluster0
```

**Should be (with database name):**
```
mongodb+srv://sakariyeaadam59_db_user:PASSWORD@cluster0.onilzs6.mongodb.net/fod-clinic?appName=Cluster0
```

**Notice:** `/fod-clinic` before the `?` - this specifies which database to use!

### Step 3: Update in Vercel

1. In Vercel → Environment Variables
2. Click **"Edit"** on `MONGODB_URI`
3. Add `/fod-clinic` before the `?` in the connection string
4. Make sure it's set for: ✅ Production, ✅ Preview, ✅ Development
5. Click **"Save"**

### Step 4: Redeploy

1. Go to **"Deployments"** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete

---

## 🔍 Verify Data Exists

### Check MongoDB Atlas:

1. Go to **MongoDB Atlas Dashboard**
2. Click **"Browse Collections"**
3. You should see:
   - `patients` collection (with your test data)
   - `appointments` collection (with your test data)

**If you see data here but not in Vercel** → Connection issue (fix above)
**If no data here** → Data was never saved (different issue)

---

## 🆘 Still Not Working?

### Check Vercel Logs:

1. Vercel Dashboard → Your Project
2. Click **"Deployments"** → Latest deployment
3. Click **"View Function Logs"**
4. Look for MongoDB connection errors

### Common Issues:

1. **Wrong password in connection string**
   - Make sure you replaced `PASSWORD` with actual password

2. **Network Access**
   - MongoDB Atlas → Network Access
   - Make sure `0.0.0.0/0` is whitelisted (allows all IPs)

3. **Database name mismatch**
   - Local might use `test` database
   - Vercel might use default database
   - Solution: Add `/fod-clinic` to connection string

---

## ✅ After Fixing:

1. Refresh your Vercel app
2. You should see your test data!
3. Try adding a new patient to verify it works

---

**The key is making sure both local and Vercel use the same database name!**
