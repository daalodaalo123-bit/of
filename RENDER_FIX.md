# 🔧 Fix Your Render Configuration

## ❌ Current (WRONG):
- Build Command: `nextjs-app/ $ npm install && npm run build`
- Start Command: `nextjs-app/ $ npm start`

## ✅ Correct:
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

## Why?
When you set **Root Directory** to `nextjs-app`, Render automatically changes into that folder before running commands. So you don't need the `nextjs-app/ $` prefix!

---

## ✅ Your Settings Should Be:

```
Name: fod-clinic-management
Root Directory: nextjs-app
Branch: main
Region: Oregon (US West)
Language: Node

Build Command: npm install && npm run build
Start Command: npm start
```

---

## 📝 Next Steps:

1. Fix the Build and Start commands (remove `nextjs-app/ $`)
2. Add Environment Variables:
   - `MONGODB_URI` = `mongodb+srv://sakariyeaadam59_db_user:YOUR_PASSWORD@cluster0.onilzs6.mongodb.net/?appName=Cluster0`
   - `NODE_ENV` = `production`
3. Click "Create Web Service"
