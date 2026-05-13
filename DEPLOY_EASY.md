# 🚀 Deploy to Render - SUPER EASY GUIDE

## ⚡ Quick Steps (5 minutes)

### 1️⃣ Go to Render
👉 https://render.com → Sign up with GitHub

### 2️⃣ Create New Web Service
- Click **"New +"** → **"Web Service"**
- Connect your repo: **`daalodaalo123-bit/of`**

### 3️⃣ Fill These Settings:

```
Name: fod-clinic-management
Root Directory: nextjs-app  ← IMPORTANT!
Branch: main
Build Command: npm install && npm run build
Start Command: npm start
```

### 4️⃣ Add Environment Variables:

Click **"Add Environment Variable"** twice:

**Variable 1:**
- Key: `MONGODB_URI`
- Value: `mongodb+srv://sakariyeaadam59_db_user:YOUR_PASSWORD@cluster0.onilzs6.mongodb.net/?appName=Cluster0`
  *(Replace YOUR_PASSWORD with your actual MongoDB password)*

**Variable 2:**
- Key: `NODE_ENV`
- Value: `production`

### 5️⃣ Deploy!
Click **"Create Web Service"** and wait 3-5 minutes! 🎉

---

## ✅ Done!

Your app will be live at: `https://fod-clinic-management.onrender.com`

**Login:**
- Username: `fod`
- Password: `fod3322`

---

## 🆘 Need Help?

See `RENDER_DEPLOY.md` for detailed instructions!
