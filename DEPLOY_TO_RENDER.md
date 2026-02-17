# 🚀 Deploy FOD Clinic to Render - EASY GUIDE

## 📍 Your App Location
- **Folder:** `nextjs-app/`
- **GitHub:** https://github.com/daalodaalo123-bit/of

---

## ⚡ 5-Minute Deployment

### Step 1: Sign Up
1. Go to: **https://render.com**
2. Click **"Get Started for Free"**
3. Sign up with **GitHub** (easiest way!)

### Step 2: Create Web Service
1. Click **"New +"** button (top right)
2. Click **"Web Service"**
3. Connect GitHub if asked
4. Select repository: **`daalodaalo123-bit/of`**

### Step 3: Configure (Copy These Exactly!)

**Basic Settings:**
```
Name: fod-clinic-management
Region: Oregon (US West) [or closest to you]
Branch: main
Root Directory: nextjs-app  ⚠️ THIS IS IMPORTANT!
```

**Build Settings:**
```
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm start
```

### Step 4: Add Environment Variables

Click **"Add Environment Variable"** and add these TWO:

**Variable 1:**
```
Key: MONGODB_URI
Value: mongodb+srv://sakariyeaadam59_db_user:YOUR_PASSWORD@cluster0.onilzs6.mongodb.net/?appName=Cluster0
```
⚠️ Replace `YOUR_PASSWORD` with your actual MongoDB password!

**Variable 2:**
```
Key: NODE_ENV
Value: production
```

### Step 5: Deploy!
1. Click **"Create Web Service"**
2. Wait 3-5 minutes (watch the build logs)
3. ✅ Done! Your app is live!

---

## 🎉 Access Your App

After deployment, Render will give you a URL like:
**`https://fod-clinic-management.onrender.com`**

**Login:**
- Username: `fod`
- Password: `fod3322`

---

## 🔧 If Something Goes Wrong

### Build Fails?
- ✅ Check that **Root Directory** is `nextjs-app`
- ✅ Make sure MongoDB password is correct (no `<db_password>`)

### App Won't Start?
- ✅ Check environment variables are set
- ✅ Look at logs in Render dashboard

### Can't Connect to Database?
- ✅ MongoDB Atlas → Network Access → Add IP: `0.0.0.0/0` (allow all)
- ✅ Verify password in `MONGODB_URI`

---

## 📞 Need More Help?

See `nextjs-app/RENDER_DEPLOY.md` for detailed troubleshooting!

---

**That's it! Super easy! 🎉**
