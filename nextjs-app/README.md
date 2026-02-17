# FOD Clinic Management System - Next.js

Modern clinic management system for FOD Clinic built with Next.js 14, TypeScript, Tailwind CSS, and MongoDB.

## Features

✅ **Phase 1 Complete:**
- Patient Management (CRUD operations)
- Appointment Management
- Dashboard with statistics
- **Excel Import** - Import patients from Excel files (ready for future phases)

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** MongoDB (Mongoose)
- **Excel Import:** xlsx library

## Getting Started

### 1. Install Dependencies

```bash
cd nextjs-app
npm install
```

### 2. Configure Environment

The `.env.local` file is already configured with your MongoDB connection string.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Excel Import Feature

### How to Use

1. Click "Import Excel" button in Patients page
2. Select an Excel file (.xlsx or .xls)
3. File should have these columns:
   - Name
   - Email
   - Phone
   - DateOfBirth (or Date of Birth)
   - Gender
   - Address
   - MedicalHistory (or Medical History) - Optional
   - Allergies - Optional

### Excel Format Example

| Name | Email | Phone | DateOfBirth | Gender | Address | MedicalHistory | Allergies |
|------|-------|-------|-------------|--------|---------|----------------|-----------|
| John Doe | john@example.com | 1234567890 | 1990-01-01 | Male | 123 Main St | None | None |

### API Endpoint

`POST /api/patients/import`

Accepts multipart/form-data with file field.

## Project Structure

```
nextjs-app/
├── app/
│   ├── api/              # API routes
│   │   ├── patients/
│   │   │   ├── route.ts
│   │   │   ├── [id]/route.ts
│   │   │   └── import/route.ts  # Excel import endpoint
│   │   ├── appointments/
│   │   └── dashboard/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/           # React components
│   ├── Sidebar.tsx
│   ├── Dashboard.tsx
│   ├── Patients.tsx
│   ├── PatientModal.tsx
│   ├── ExcelImport.tsx   # Excel import component
│   └── Appointments.tsx
├── lib/
│   └── mongodb.ts       # MongoDB connection
├── models/              # Mongoose models
│   ├── Patient.ts
│   └── Appointment.ts
└── package.json
```

## Future Phases

### Phase 2 (Ready to implement)
- Treatment Management
- Billing & Invoicing
- Expense Tracking
- Financial Reports

### Phase 3 (Ready to implement)
- User Roles & Permissions
- SMS Reminder System
- Reports & Analytics
- Backup & Data Export

### Excel Import Enhancements (Future)
- Import appointments from Excel
- Import treatments from Excel
- Export data to Excel
- Template download
- Bulk operations

## API Endpoints

### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/[id]` - Get patient by ID
- `POST /api/patients` - Create patient
- `PUT /api/patients/[id]` - Update patient
- `DELETE /api/patients/[id]` - Delete patient
- `POST /api/patients/import` - **Import from Excel**

### Appointments
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments?date=YYYY-MM-DD` - Get by date
- `POST /api/appointments` - Create appointment

### Dashboard
- `GET /api/dashboard/stats` - Get statistics

## Build for Production

```bash
npm run build
npm start
```

## Notes

- Excel import feature is ready and tested
- MongoDB connection is configured
- All Phase 1 features are implemented
- Ready for Phase 2 and 3 implementation

---

**Built with Next.js 14 + TypeScript + Tailwind CSS + MongoDB**
