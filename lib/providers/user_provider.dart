import 'package:flutter/foundation.dart';
import '../models/user.dart';
import '../services/database_service.dart';

class UserProvider with ChangeNotifier {
  final DatabaseService _dbService = DatabaseService();
  User? _currentUser;
  List<User> _users = [];
  bool _isLoading = false;

  User? get currentUser => _currentUser;
  List<User> get users => _users;
  bool get isLoading => _isLoading;

  Future<bool> login(String username) async {
    try {
      _currentUser = await _dbService.getUserByUsername(username);
      notifyListeners();
      return _currentUser != null;
    } catch (e) {
      print('Error logging in: $e');
      return false;
    }
  }

  void logout() {
    _currentUser = null;
    notifyListeners();
  }

  Future<void> loadUsers() async {
    _isLoading = true;
    notifyListeners();
    try {
      _users = await _dbService.getAllUsers();
    } catch (e) {
      print('Error loading users: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> addUser(User user) async {
    try {
      await _dbService.insertUser(user);
      await loadUsers();
      return true;
    } catch (e) {
      print('Error adding user: $e');
      return false;
    }
  }

  Future<bool> updateUser(User user) async {
    try {
      await _dbService.updateUser(user);
      await loadUsers();
      if (_currentUser?.id == user.id) {
        _currentUser = user;
      }
      notifyListeners();
      return true;
    } catch (e) {
      print('Error updating user: $e');
      return false;
    }
  }

  bool hasPermission(String permission) {
    return _currentUser?.hasPermission(permission) ?? false;
  }
}
