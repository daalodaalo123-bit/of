# Healthcare Management System

A comprehensive Flutter application for managing healthcare operations including patient management, appointments, treatments, billing, and more.

## Features

### Phase 1 ✅
- **Patient Management**: Complete CRUD operations for patient records
  - Add, edit, delete, and view patient information
  - Search functionality
  - Patient details with medical history and allergies
  - Link appointments and treatments to patients

- **Appointment Management**: Full appointment scheduling system
  - Schedule appointments with calendar view
  - View appointments by date
  - Edit and cancel appointments
  - Track appointment status (scheduled, completed, cancelled, no_show)
  - Time slot management

- **Dashboard**: Comprehensive overview and statistics
  - Total patients count
  - Scheduled appointments
  - Today's appointments
  - Revenue and expense summaries
  - Quick access to key features

### Phase 2 ✅
- **Treatment Management**: Record and track medical treatments
  - Link treatments to appointments
  - Record diagnosis and prescriptions
  - Track treatment costs
  - View treatment history per patient

- **Billing & Invoicing**: Complete invoicing system
  - Create invoices with multiple line items
  - Calculate subtotals, tax, and totals
  - Track payment status (pending, paid, overdue, cancelled)
  - Link invoices to treatments
  - Payment method tracking

- **Expense Tracking**: Track business expenses
  - Categorize expenses (Office Supplies, Equipment, Utilities, etc.)
  - Record expense details and amounts
  - View expense summaries
  - Filter by category

- **Financial Reports**: Comprehensive financial analytics
  - Revenue by month charts
  - Expenses by category breakdown
  - Profit/loss analysis
  - Financial overview dashboard

### Phase 3 ✅
- **User Roles & Permissions**: Multi-user system with role-based access
  - Three roles: Admin, Doctor, Staff
  - Granular permissions system
  - User management interface
  - Active/inactive user status

- **SMS Reminder System**: Automated appointment reminders
  - Configurable SMS reminders
  - 24-hour and 1-hour before reminders
  - Notification system integration
  - Enable/disable reminders

- **Reports & Analytics**: Advanced reporting capabilities
  - Financial overview reports
  - Revenue by month analysis
  - Expense category breakdown
  - Patient statistics
  - Visual charts and graphs

- **Backup & Data Export**: Data backup and export functionality
  - Export all data to JSON
  - CSV exports for each entity
  - Financial report exports
  - Timestamped backups

## Getting Started

### Prerequisites
- Flutter SDK (3.0.0 or higher)
- Dart SDK
- Android Studio / Xcode (for mobile development)
- VS Code or Android Studio (recommended IDE)

### Installation

1. Clone or navigate to the project directory:
```bash
cd /Users/radio/flutter
```

2. Install Flutter dependencies:
```bash
flutter pub get
```

3. Run the application:
```bash
flutter run
```

### Default Login
- **Username**: `admin`
- **Password**: Not required (username-based login for demo)

## Project Structure

```
lib/
├── main.dart                 # App entry point
├── models/                   # Data models
│   ├── patient.dart
│   ├── appointment.dart
│   ├── treatment.dart
│   ├── invoice.dart
│   ├── expense.dart
│   └── user.dart
├── providers/                # State management (Provider pattern)
│   ├── patient_provider.dart
│   ├── appointment_provider.dart
│   ├── treatment_provider.dart
│   ├── invoice_provider.dart
│   ├── expense_provider.dart
│   ├── dashboard_provider.dart
│   └── user_provider.dart
├── screens/                  # UI screens
│   ├── login_screen.dart
│   ├── home_screen.dart
│   ├── dashboard_screen.dart
│   ├── patients_screen.dart
│   ├── patient_form_screen.dart
│   ├── patient_detail_screen.dart
│   ├── appointments_screen.dart
│   ├── appointment_form_screen.dart
│   ├── treatments_screen.dart
│   ├── treatment_form_screen.dart
│   ├── invoices_screen.dart
│   ├── invoice_form_screen.dart
│   ├── expenses_screen.dart
│   ├── expense_form_screen.dart
│   ├── reports_screen.dart
│   ├── settings_screen.dart
│   ├── users_screen.dart
│   └── user_form_screen.dart
├── services/                 # Business logic & database
│   ├── database_service.dart  # SQLite database operations
│   ├── sms_service.dart      # SMS/Notification reminders
│   └── export_service.dart   # Data export functionality
├── widgets/                  # Reusable widgets (if any)
└── utils/                    # Utilities and helpers (if any)
```

## Database Schema

The application uses SQLite for local data storage. Key tables include:

- **patients**: Patient information, medical history, allergies
- **appointments**: Appointment scheduling and status
- **treatments**: Treatment records, diagnoses, prescriptions
- **invoices**: Billing and invoicing data
- **expenses**: Business expense tracking
- **users**: User accounts and permissions

## Key Features Details

### Patient Management
- Complete patient profiles with contact information
- Medical history and allergies tracking
- Search and filter capabilities
- Link to appointments and treatments

### Appointment System
- Calendar-based appointment scheduling
- Time slot management
- Status tracking (scheduled, completed, cancelled, no_show)
- Automatic SMS reminders (configurable)

### Financial Management
- Create invoices with multiple line items
- Tax calculation
- Payment tracking
- Expense categorization
- Financial reports and analytics

### User Management
- Role-based access control (Admin, Doctor, Staff)
- Granular permissions
- User activation/deactivation
- Default admin user created on first run

## Development Notes

- The app uses Provider for state management
- SQLite database is initialized on first launch
- Default admin user is created automatically
- SMS reminders use local notifications (can be extended to actual SMS)
- Data export creates JSON and CSV files in the app's documents directory

## Future Enhancements

- Actual SMS integration (currently uses notifications)
- Cloud backup/sync
- Multi-language support
- Advanced reporting with PDF export
- Appointment conflict detection
- Patient portal access
- Integration with external payment gateways

## License

This project is created for healthcare management purposes.
