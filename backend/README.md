# Healthcare Management Backend API

Node.js/Express backend API for Healthcare Management System with MongoDB.

## Features

✅ **Patient Management**
- GET `/api/patients` - Get all patients
- GET `/api/patients/:id` - Get patient by ID
- POST `/api/patients` - Create patient
- PUT `/api/patients/:id` - Update patient
- DELETE `/api/patients/:id` - Delete patient

✅ **Appointment Management**
- GET `/api/appointments` - Get all appointments
- GET `/api/appointments?date=YYYY-MM-DD` - Get appointments by date
- POST `/api/appointments` - Create appointment
- PUT `/api/appointments/:id` - Update appointment
- DELETE `/api/appointments/:id` - Delete appointment

✅ **Dashboard**
- GET `/api/dashboard/stats` - Get dashboard statistics

## Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account (already configured)

### Installation

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment:**
   The `.env` file is already configured with your MongoDB credentials.

3. **Start the server:**
   ```bash
   # Development mode (with auto-reload)
   npm run dev
   
   # Production mode
   npm start
   ```

4. **Verify connection:**
   - Server runs on: `http://localhost:3000`
   - API base URL: `http://localhost:3000/api`
   - Health check: `http://localhost:3000/api/health`

## API Endpoints

### Patients

**Get All Patients**
```http
GET /api/patients
```

**Get Patient by ID**
```http
GET /api/patients/:id
```

**Create Patient**
```http
POST /api/patients
Content-Type: application/json

{
  "id": "patient-001",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "dateOfBirth": "1990-01-01T00:00:00.000Z",
  "gender": "Male",
  "address": "123 Main St",
  "medicalHistory": "None",
  "allergies": "None"
}
```

**Update Patient**
```http
PUT /api/patients/:id
Content-Type: application/json

{
  "name": "John Updated",
  ...
}
```

**Delete Patient**
```http
DELETE /api/patients/:id
```

### Appointments

**Get All Appointments**
```http
GET /api/appointments
```

**Get Appointments by Date**
```http
GET /api/appointments?date=2024-02-17
```

**Create Appointment**
```http
POST /api/appointments
Content-Type: application/json

{
  "id": "apt-001",
  "patientId": "patient-001",
  "patientName": "John Doe",
  "appointmentDate": "2024-02-20T10:00:00.000Z",
  "timeSlot": "10:00 AM",
  "status": "scheduled",
  "notes": "Regular checkup",
  "treatmentType": "General"
}
```

**Update Appointment**
```http
PUT /api/appointments/:id
Content-Type: application/json

{
  "status": "completed",
  ...
}
```

**Delete Appointment**
```http
DELETE /api/appointments/:id
```

### Dashboard

**Get Statistics**
```http
GET /api/dashboard/stats
```

Response:
```json
{
  "patientCount": 10,
  "appointmentCount": 5,
  "todayAppointments": 2,
  "totalRevenue": 0.0,
  "totalExpenses": 0.0,
  "profit": 0.0
}
```

## MongoDB Connection

✅ **Configured:**
- Connection string in `.env`
- Database: `healthcare_db`
- Auto-connects on server start

## CORS Configuration

CORS is enabled for Flutter web. Update `CORS_ORIGIN` in `.env` for production.

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Server Error

## Development

**Watch mode (auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

## Testing

Test the API using:
- Postman
- curl
- Flutter frontend (when connected)

**Example:**
```bash
# Health check
curl http://localhost:3000/api/health

# Get all patients
curl http://localhost:3000/api/patients
```

## Next Steps

1. ✅ Backend API created
2. ⏳ Update Flutter frontend to use API
3. ⏳ Test integration
4. ⏳ Deploy to production

---

**Backend is ready!** Start the server and connect your Flutter frontend.
