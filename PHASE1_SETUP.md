# Phase 1 Frontend - Setup Guide

## Current Location
**Working Directory:** `/Users/radio/flutter`

## Phase 1 Features Included
✅ **Patient Management**
- Add, Edit, Delete, View patients
- Search functionality
- Patient details screen

✅ **Appointment Management**
- Schedule appointments
- Calendar view
- View by date
- Edit and cancel appointments

✅ **Dashboard**
- Overview statistics
- Today's appointments
- Quick access

## Project Structure

```
/Users/radio/flutter/
├── lib/
│   ├── main.dart                    # App entry (Phase 1 only)
│   ├── models/                      # Data models
│   │   ├── patient.dart
│   │   └── appointment.dart
│   ├── providers/                   # State management
│   │   ├── patient_provider.dart    # Ready for API switch
│   │   ├── appointment_provider.dart # Ready for API switch
│   │   ├── dashboard_provider.dart  # Ready for API switch
│   │   └── user_provider.dart
│   ├── screens/                     # UI Screens (Phase 1)
│   │   ├── login_screen.dart
│   │   ├── home_screen.dart
│   │   ├── dashboard_screen.dart
│   │   ├── patients_screen.dart
│   │   ├── patient_form_screen.dart
│   │   ├── patient_detail_screen.dart
│   │   ├── appointments_screen.dart
│   │   └── appointment_form_screen.dart
│   └── services/
│       ├── database_service.dart     # SQLite (current)
│       └── api_service.dart         # Ready for MongoDB API
```

## API Integration Ready

The frontend is prepared for MongoDB backend integration:

### 1. API Service Created
- **File:** `lib/services/api_service.dart`
- **Status:** Ready for MongoDB connection
- **Current:** Uses mock data (can be switched)

### 2. Providers Updated
All providers have a toggle to switch between:
- **Local SQLite** (current - for development)
- **MongoDB API** (when backend is ready)

**To switch to API mode:**
```dart
// In each provider file, change:
static const bool useApi = false;  // Change to true
```

### 3. API Endpoints Expected

When you connect MongoDB backend, ensure these endpoints:

**Patients:**
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Create patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

**Appointments:**
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments?date=YYYY-MM-DD` - Get by date
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

**Dashboard:**
- `GET /api/dashboard/stats` - Get dashboard statistics

## Configuration

### Update API Base URL

When MongoDB backend is ready, update:

**File:** `lib/services/api_service.dart`
```dart
static const String BASE_URL = 'http://localhost:3000/api';
// Change to your MongoDB backend URL, e.g.:
// static const String BASE_URL = 'https://your-backend.com/api';
```

### Enable API Mode

**File:** `lib/services/api_service.dart`
```dart
static bool useMockData = false; // Set to false when backend is ready
```

**Files:** `lib/providers/*_provider.dart`
```dart
static const bool useApi = true; // Change to true in each provider
```

## Running the App

### Development (Current - SQLite)
```bash
cd /Users/radio/flutter
flutter pub get
flutter run
```

### Production (When MongoDB Ready)
1. Update `BASE_URL` in `api_service.dart`
2. Set `useApi = true` in all providers
3. Set `useMockData = false` in `api_service.dart`
4. Run: `flutter run -d chrome` (for web)

## Next Steps

1. ✅ Frontend Phase 1 is ready
2. ⏳ Wait for MongoDB backend connection details
3. ⏳ Update API configuration
4. ⏳ Test API integration
5. ⏳ Deploy to web

## Notes

- Currently uses SQLite for local development
- All API endpoints are defined and ready
- Easy switch between local DB and API
- Phase 2 & 3 screens removed from navigation
- Clean, maintainable code structure
