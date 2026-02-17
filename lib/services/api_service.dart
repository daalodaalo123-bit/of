import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/patient.dart';
import '../models/appointment.dart';
import '../config/api_config.dart';

/// API Service - Ready for MongoDB backend integration
/// Configured with MongoDB credentials
class ApiService {
  // Use API config for base URL
  static String get BASE_URL => ApiConfig.baseUrl;
  
  // API mode enabled - connects to MongoDB backend
  static bool useMockData = false; // Backend is ready!

  // Headers
  static Map<String, String> get headers => {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // Add authentication token here when ready
    // 'Authorization': 'Bearer $token',
  };

  // ============ PATIENT ENDPOINTS ============
  
  Future<List<Patient>> getPatients() async {
    if (useMockData) {
      // Return empty list for now - will be replaced with API call
      return [];
    }
    
    try {
      final response = await http.get(
        Uri.parse(ApiConfig.patientsUrl),
        headers: headers,
      );
      
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Patient.fromMap(json)).toList();
      }
      throw Exception('Failed to load patients');
    } catch (e) {
      print('API Error: $e');
      throw e;
    }
  }

  Future<Patient> getPatientById(String id) async {
    if (useMockData) {
      throw Exception('Mock data mode - patient not found');
    }
    
    try {
      final response = await http.get(
        Uri.parse(ApiConfig.patientByIdUrl(id)),
        headers: headers,
      );
      
      if (response.statusCode == 200) {
        return Patient.fromMap(jsonDecode(response.body));
      }
      throw Exception('Failed to load patient');
    } catch (e) {
      print('API Error: $e');
      throw e;
    }
  }

  Future<Patient> createPatient(Patient patient) async {
    if (useMockData) {
      return patient; // Return as-is for mock
    }
    
    try {
      final response = await http.post(
        Uri.parse(ApiConfig.patientsUrl),
        headers: headers,
        body: jsonEncode(patient.toMap()),
      );
      
      if (response.statusCode == 201 || response.statusCode == 200) {
        return Patient.fromMap(jsonDecode(response.body));
      }
      throw Exception('Failed to create patient');
    } catch (e) {
      print('API Error: $e');
      throw e;
    }
  }

  Future<Patient> updatePatient(Patient patient) async {
    if (useMockData) {
      return patient; // Return as-is for mock
    }
    
    try {
      final response = await http.put(
        Uri.parse(ApiConfig.patientByIdUrl(patient.id)),
        headers: headers,
        body: jsonEncode(patient.toMap()),
      );
      
      if (response.statusCode == 200) {
        return Patient.fromMap(jsonDecode(response.body));
      }
      throw Exception('Failed to update patient');
    } catch (e) {
      print('API Error: $e');
      throw e;
    }
  }

  Future<void> deletePatient(String id) async {
    if (useMockData) {
      return; // Do nothing for mock
    }
    
    try {
      final response = await http.delete(
        Uri.parse(ApiConfig.patientByIdUrl(id)),
        headers: headers,
      );
      
      if (response.statusCode != 200 && response.statusCode != 204) {
        throw Exception('Failed to delete patient');
      }
    } catch (e) {
      print('API Error: $e');
      throw e;
    }
  }

  // ============ APPOINTMENT ENDPOINTS ============
  
  Future<List<Appointment>> getAppointments() async {
    if (useMockData) {
      return [];
    }
    
    try {
      final response = await http.get(
        Uri.parse(ApiConfig.appointmentsUrl),
        headers: headers,
      );
      
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Appointment.fromMap(json)).toList();
      }
      throw Exception('Failed to load appointments');
    } catch (e) {
      print('API Error: $e');
      throw e;
    }
  }

  Future<List<Appointment>> getAppointmentsByDate(DateTime date) async {
    if (useMockData) {
      return [];
    }
    
    try {
      final dateStr = date.toIso8601String().split('T')[0];
      final response = await http.get(
        Uri.parse(ApiConfig.appointmentsByDateUrl(dateStr)),
        headers: headers,
      );
      
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Appointment.fromMap(json)).toList();
      }
      throw Exception('Failed to load appointments');
    } catch (e) {
      print('API Error: $e');
      throw e;
    }
  }

  Future<Appointment> createAppointment(Appointment appointment) async {
    if (useMockData) {
      return appointment;
    }
    
    try {
      final response = await http.post(
        Uri.parse(ApiConfig.appointmentsUrl),
        headers: headers,
        body: jsonEncode(appointment.toMap()),
      );
      
      if (response.statusCode == 201 || response.statusCode == 200) {
        return Appointment.fromMap(jsonDecode(response.body));
      }
      throw Exception('Failed to create appointment');
    } catch (e) {
      print('API Error: $e');
      throw e;
    }
  }

  Future<Appointment> updateAppointment(Appointment appointment) async {
    if (useMockData) {
      return appointment;
    }
    
    try {
      final response = await http.put(
        Uri.parse(ApiConfig.appointmentByIdUrl(appointment.id)),
        headers: headers,
        body: jsonEncode(appointment.toMap()),
      );
      
      if (response.statusCode == 200) {
        return Appointment.fromMap(jsonDecode(response.body));
      }
      throw Exception('Failed to update appointment');
    } catch (e) {
      print('API Error: $e');
      throw e;
    }
  }

  Future<void> deleteAppointment(String id) async {
    if (useMockData) {
      return;
    }
    
    try {
      final response = await http.delete(
        Uri.parse(ApiConfig.appointmentByIdUrl(id)),
        headers: headers,
      );
      
      if (response.statusCode != 200 && response.statusCode != 204) {
        throw Exception('Failed to delete appointment');
      }
    } catch (e) {
      print('API Error: $e');
      throw e;
    }
  }

  // ============ DASHBOARD ENDPOINTS ============
  
  Future<Map<String, dynamic>> getDashboardStats() async {
    if (useMockData) {
      return {
        'patientCount': 0,
        'appointmentCount': 0,
        'todayAppointments': 0,
        'totalRevenue': 0.0,
        'totalExpenses': 0.0,
        'profit': 0.0,
      };
    }
    
    try {
      final response = await http.get(
        Uri.parse(ApiConfig.dashboardStatsUrl),
        headers: headers,
      );
      
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      throw Exception('Failed to load dashboard stats');
    } catch (e) {
      print('API Error: $e');
      throw e;
    }
  }
}
