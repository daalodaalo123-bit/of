import 'package:flutter/foundation.dart';
import '../models/treatment.dart';
import '../services/database_service.dart';

class TreatmentProvider with ChangeNotifier {
  final DatabaseService _dbService = DatabaseService();
  List<Treatment> _treatments = [];
  bool _isLoading = false;

  List<Treatment> get treatments => _treatments;
  bool get isLoading => _isLoading;

  Future<void> loadTreatments() async {
    _isLoading = true;
    notifyListeners();
    try {
      _treatments = await _dbService.getAllTreatments();
    } catch (e) {
      print('Error loading treatments: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<List<Treatment>> getTreatmentsByPatient(String patientId) async {
    try {
      return await _dbService.getTreatmentsByPatient(patientId);
    } catch (e) {
      print('Error loading treatments by patient: $e');
      return [];
    }
  }

  Future<bool> addTreatment(Treatment treatment) async {
    try {
      await _dbService.insertTreatment(treatment);
      await loadTreatments();
      return true;
    } catch (e) {
      print('Error adding treatment: $e');
      return false;
    }
  }

  Future<bool> updateTreatment(Treatment treatment) async {
    try {
      await _dbService.updateTreatment(treatment);
      await loadTreatments();
      return true;
    } catch (e) {
      print('Error updating treatment: $e');
      return false;
    }
  }
}
