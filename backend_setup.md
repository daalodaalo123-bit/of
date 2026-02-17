# Backend API Setup Guide

## MongoDB Connection Configured ✅

**Connection String:**
```
mongodb+srv://sakariyeaadam59_db_user:YDnE8z2fUUXqlC2j@cluster0.onilzs6.mongodb.net/healthcare_db?retryWrites=true&w=majority&appName=Cluster0
```

**Database Name:** `healthcare_db`

## Next Steps

### Option 1: I Create Backend for You (Recommended)

I can create a Node.js/Express backend that:
- ✅ Connects to your MongoDB
- ✅ Provides REST API endpoints
- ✅ Handles CORS for Flutter web
- ✅ Implements all Phase 1 endpoints

**Would you like me to create the backend?**

### Option 2: You Create Backend

If you prefer to create your own backend, here's what you need:

#### Required Endpoints:

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

#### Expected Response Formats:

**Patient:**
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "dateOfBirth": "2024-01-01T00:00:00.000Z",
  "gender": "Male|Female|Other",
  "address": "string",
  "medicalHistory": "string|null",
  "allergies": "string|null",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Appointment:**
```json
{
  "id": "string",
  "patientId": "string",
  "patientName": "string",
  "appointmentDate": "2024-01-01T10:00:00.000Z",
  "timeSlot": "10:00 AM",
  "status": "scheduled|completed|cancelled|no_show",
  "notes": "string|null",
  "treatmentType": "string|null",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Dashboard Stats:**
```json
{
  "patientCount": 0,
  "appointmentCount": 0,
  "todayAppointments": 0,
  "totalRevenue": 0.0,
  "totalExpenses": 0.0,
  "profit": 0.0
}
```

## Frontend Configuration

Once backend is ready, update:

**File:** `lib/config/api_config.dart`
```dart
// Update baseUrl to your backend API URL
static const String baseUrl = 'http://localhost:3000/api';
// Or for production:
// static const String baseUrl = 'https://your-backend-api.com/api';
```

**File:** `lib/services/api_service.dart`
```dart
// Set to false when backend is ready
static bool useMockData = false;
```

**Files:** `lib/providers/*_provider.dart`
```dart
// Set to true when backend is ready
static const bool useApi = true;
```

## Testing Connection

After backend is set up:

1. Start your backend server
2. Update `baseUrl` in `api_config.dart`
3. Set `useMockData = false` and `useApi = true`
4. Run Flutter app:
   ```bash
   cd /Users/radio/flutter
   flutter pub get
   flutter run -d chrome
   ```

## Current Status

✅ MongoDB connection string configured  
✅ Frontend API service ready  
✅ All endpoints defined  
⏳ Backend API needed

---

**Ready to create backend?** Let me know and I'll set it up for you!
