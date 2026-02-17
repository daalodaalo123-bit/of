import 'package:flutter/foundation.dart';
import '../models/patient.dart';
import '../services/database_service.dart';
import '../services/api_service.dart';

class PatientProvider with ChangeNotifier {
  final DatabaseService _dbService = DatabaseService();
  final ApiService _apiService = ApiService();
  List<Patient> _patients = [];
  bool _isLoading = false;
  
  // API mode enabled - connects to MongoDB backend
  static const bool useApi = true; // Backend is ready!

  List<Patient> get patients => _patients;
  bool get isLoading => _isLoading;

  Future<void> loadPatients() async {
    _isLoading = true;
    notifyListeners();
    try {
      if (useApi) {
        _patients = await _apiService.getPatients();
      } else {
        _patients = await _dbService.getAllPatients();
      }
    } catch (e) {
      print('Error loading patients: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> addPatient(Patient patient) async {
    try {
      if (useApi) {
        await _apiService.createPatient(patient);
      } else {
        await _dbService.insertPatient(patient);
      }
      await loadPatients();
      return true;
    } catch (e) {
      print('Error adding patient: $e');
      return false;
    }
  }

  Future<bool> updatePatient(Patient patient) async {
    try {
      if (useApi) {
        await _apiService.updatePatient(patient);
      } else {
        await _dbService.updatePatient(patient);
      }
      await loadPatients();
      return true;
    } catch (e) {
      print('Error updating patient: $e');
      return false;
    }
  }

  Future<bool> deletePatient(String id) async {
    try {
      if (useApi) {
        await _apiService.deletePatient(id);
      } else {
        await _dbService.deletePatient(id);
      }
      await loadPatients();
      return true;
    } catch (e) {
      print('Error deleting patient: $e');
      return false;
    }
  }

  Patient? getPatientById(String id) {
    try {
      return _patients.firstWhere((p) => p.id == id);
    } catch (e) {
      return null;
    }
  }
}
