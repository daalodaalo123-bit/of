import 'package:flutter/foundation.dart';
import '../models/appointment.dart';
import '../services/database_service.dart';
import '../services/api_service.dart';

class AppointmentProvider with ChangeNotifier {
  final DatabaseService _dbService = DatabaseService();
  final ApiService _apiService = ApiService();
  List<Appointment> _appointments = [];
  bool _isLoading = false;
  
  // API mode enabled - connects to MongoDB backend
  static const bool useApi = true; // Backend is ready!

  List<Appointment> get appointments => _appointments;
  bool get isLoading => _isLoading;

  Future<void> loadAppointments() async {
    _isLoading = true;
    notifyListeners();
    try {
      if (useApi) {
        _appointments = await _apiService.getAppointments();
      } else {
        _appointments = await _dbService.getAllAppointments();
      }
    } catch (e) {
      print('Error loading appointments: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<List<Appointment>> getAppointmentsByDate(DateTime date) async {
    try {
      if (useApi) {
        return await _apiService.getAppointmentsByDate(date);
      } else {
        return await _dbService.getAppointmentsByDate(date);
      }
    } catch (e) {
      print('Error loading appointments by date: $e');
      return [];
    }
  }

  Future<bool> addAppointment(Appointment appointment) async {
    try {
      if (useApi) {
        await _apiService.createAppointment(appointment);
      } else {
        await _dbService.insertAppointment(appointment);
      }
      await loadAppointments();
      return true;
    } catch (e) {
      print('Error adding appointment: $e');
      return false;
    }
  }

  Future<bool> updateAppointment(Appointment appointment) async {
    try {
      if (useApi) {
        await _apiService.updateAppointment(appointment);
      } else {
        await _dbService.updateAppointment(appointment);
      }
      await loadAppointments();
      return true;
    } catch (e) {
      print('Error updating appointment: $e');
      return false;
    }
  }

  Future<bool> deleteAppointment(String id) async {
    try {
      if (useApi) {
        await _apiService.deleteAppointment(id);
      } else {
        await _dbService.deleteAppointment(id);
      }
      await loadAppointments();
      return true;
    } catch (e) {
      print('Error deleting appointment: $e');
      return false;
    }
  }
}
