# 🚀 Quick Start Guide

## Everything is Configured! ✅

Your Healthcare Management System is ready to run!

## Step 1: Start the Backend Server

**Option A: Using the script (Recommended)**
```bash
cd /Users/radio/flutter
chmod +x start_backend.sh
./start_backend.sh
```

**Option B: Manual start**
```bash
cd /Users/radio/flutter/backend
npm install
npm run dev
```

**Backend will run on:** `http://localhost:3000`

## Step 2: Start the Flutter Frontend

**Open a NEW terminal window** and run:

```bash
cd /Users/radio/flutter
flutter pub get
flutter run -d chrome
```

**Frontend will run on:** `http://localhost:PORT` (check terminal for exact port)

## Step 3: Access Your Application

### 🌐 Frontend (Flutter Web)
**URL:** Check your terminal - usually `http://localhost:XXXXX`

### 🔌 Backend API
**Health Check:** http://localhost:3000/api/health
**API Base:** http://localhost:3000/api

## Test the Application

1. **Login:** Use username `admin` (default user)
2. **Dashboard:** View statistics
3. **Patients:** Add, edit, delete patients
4. **Appointments:** Schedule and manage appointments

## API Endpoints to Test

### Backend API (Test in browser or Postman):

- **Health Check:** http://localhost:3000/api/health
- **Get Patients:** http://localhost:3000/api/patients
- **Get Appointments:** http://localhost:3000/api/appointments
- **Dashboard Stats:** http://localhost:3000/api/dashboard/stats

## Troubleshooting

**Backend won't start:**
- Make sure port 3000 is not in use
- Check MongoDB connection in `.env` file
- Run `npm install` in backend folder

**Flutter won't connect:**
- Make sure backend is running first
- Check that backend is on `http://localhost:3000`
- Verify CORS settings

**MongoDB connection error:**
- Check internet connection
- Verify MongoDB credentials
- Check MongoDB Atlas IP whitelist

## What's Configured

✅ **Backend API:** Node.js/Express with MongoDB
✅ **Frontend:** Flutter web app
✅ **API Integration:** All providers set to use API
✅ **MongoDB:** Connected and ready

## Project Structure

```
/Users/radio/flutter/
├── backend/          # Backend API (Node.js/Express)
├── lib/             # Flutter frontend
├── start_backend.sh # Quick start script
└── START_HERE.md    # This file
```

---

**Ready to go!** Start the backend, then start Flutter! 🎉
