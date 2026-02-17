# 🚀 Deploy to Render - Step by Step Guide

## ✅ Prerequisites
- GitHub account (you already have this!)
- Render account (free tier works perfectly)
- MongoDB Atlas connection string (you already have this!)

---

## 📋 Step 1: Create Render Account

1. Go to: https://render.com
2. Click **"Get Started for Free"**
3. Sign up with your GitHub account (recommended)
4. Verify your email

---

## 📋 Step 2: Connect GitHub Repository

1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Click **"Connect GitHub"** (if not already connected)
3. Authorize Render to access your repositories
4. Select repository: **`daalodaalo123-bit/of`**

---

## 📋 Step 3: Configure Deployment Settings

Fill in these settings:

### Basic Settings:
- **Name:** `fod-clinic-management` (or any name you like)
- **Region:** Choose closest to you (e.g., `Oregon (US West)`)
- **Branch:** `main`
- **Root Directory:** `nextjs-app` ⚠️ **IMPORTANT!**

### Build & Deploy:
- **Runtime:** `Node`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`

### Environment Variables:
Click **"Add Environment Variable"** and add:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | `mongodb+srv://sakariyeaadam59_db_user:<db_password>@cluster0.onilzs6.mongodb.net/?appName=Cluster0` |
| `NODE_ENV` | `production` |

⚠️ **Replace `<db_password>` with your actual MongoDB password!**

---

## 📋 Step 4: Deploy!

1. Click **"Create Web Service"**
2. Render will start building your app (takes 3-5 minutes)
3. Watch the build logs - you'll see:
   - ✅ Installing dependencies
   - ✅ Building Next.js app
   - ✅ Starting server

---

## 📋 Step 5: Access Your App

Once deployed:
- Your app will be live at: `https://fod-clinic-management.onrender.com`
- (Render gives you a custom URL)

---

## 🔧 Troubleshooting

### Build Fails?
- Check build logs in Render dashboard
- Make sure `Root Directory` is set to `nextjs-app`
- Verify MongoDB connection string is correct

### App Won't Start?
- Check environment variables are set correctly
- Verify `MONGODB_URI` has your actual password (not `<db_password>`)
- Check logs in Render dashboard

### Database Connection Error?
- Make sure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Verify your MongoDB password is correct
- Check MongoDB Atlas → Network Access → IP Whitelist

---

## 🎉 That's It!

Your FOD Clinic Management System will be live on Render!

**Login Credentials:**
- Username: `fod`
- Password: `fod3322`

---

## 📝 Quick Reference

**Render Dashboard:** https://dashboard.render.com
**Your App URL:** Will be shown after deployment
**GitHub Repo:** https://github.com/daalodaalo123-bit/of
