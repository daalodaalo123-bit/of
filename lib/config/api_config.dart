/// API Configuration for MongoDB Backend
/// Update these values when your backend API is ready
class ApiConfig {
  // MongoDB Credentials
  static const String mongoUsername = 'sakariyeaadam59_db_user';
  static const String mongoPassword = 'YDnE8z2fUUXqlC2j';
  
  // MongoDB Connection String (for backend use)
  // Database name: healthcare_db
  static const String mongoConnectionString = 'mongodb+srv://sakariyeaadam59_db_user:YDnE8z2fUUXqlC2j@cluster0.onilzs6.mongodb.net/healthcare_db?retryWrites=true&w=majority&appName=Cluster0';
  
  // Backend API Base URL
  // Backend server runs on http://localhost:3000
  // Update this for production deployment
  static const String baseUrl = 'http://localhost:3000/api';
  
  // API Endpoints
  static const String patientsEndpoint = '/patients';
  static const String appointmentsEndpoint = '/appointments';
  static const String dashboardEndpoint = '/dashboard/stats';
  
  // Full API URLs
  static String get patientsUrl => '$baseUrl$patientsEndpoint';
  static String get appointmentsUrl => '$baseUrl$appointmentsEndpoint';
  static String get dashboardStatsUrl => '$baseUrl$dashboardEndpoint';
  
  // Helper to get patient by ID URL
  static String patientByIdUrl(String id) => '$baseUrl$patientsEndpoint/$id';
  
  // Helper to get appointment by ID URL
  static String appointmentByIdUrl(String id) => '$baseUrl$appointmentsEndpoint/$id';
  
  // Helper to get appointments by date URL
  static String appointmentsByDateUrl(String date) => '$baseUrl$appointmentsEndpoint?date=$date';
}
