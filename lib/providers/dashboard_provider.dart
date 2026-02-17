import 'package:flutter/foundation.dart';
import '../services/database_service.dart';
import '../services/api_service.dart';

class DashboardProvider with ChangeNotifier {
  final DatabaseService _dbService = DatabaseService();
  final ApiService _apiService = ApiService();
  Map<String, dynamic> _stats = {};
  bool _isLoading = false;
  
  // API mode enabled - connects to MongoDB backend
  static const bool useApi = true; // Backend is ready!

  Map<String, dynamic> get stats => _stats;
  bool get isLoading => _isLoading;

  Future<void> loadStats() async {
    _isLoading = true;
    notifyListeners();
    try {
      if (useApi) {
        _stats = await _apiService.getDashboardStats();
      } else {
        _stats = await _dbService.getDashboardStats();
      }
    } catch (e) {
      print('Error loading dashboard stats: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
