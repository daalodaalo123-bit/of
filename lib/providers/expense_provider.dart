import 'package:flutter/foundation.dart';
import '../models/expense.dart';
import '../services/database_service.dart';

class ExpenseProvider with ChangeNotifier {
  final DatabaseService _dbService = DatabaseService();
  List<Expense> _expenses = [];
  bool _isLoading = false;

  List<Expense> get expenses => _expenses;
  bool get isLoading => _isLoading;

  Future<void> loadExpenses() async {
    _isLoading = true;
    notifyListeners();
    try {
      _expenses = await _dbService.getAllExpenses();
    } catch (e) {
      print('Error loading expenses: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> addExpense(Expense expense) async {
    try {
      await _dbService.insertExpense(expense);
      await loadExpenses();
      return true;
    } catch (e) {
      print('Error adding expense: $e');
      return false;
    }
  }

  Future<bool> updateExpense(Expense expense) async {
    try {
      await _dbService.updateExpense(expense);
      await loadExpenses();
      return true;
    } catch (e) {
      print('Error updating expense: $e');
      return false;
    }
  }

  Future<bool> deleteExpense(String id) async {
    try {
      await _dbService.deleteExpense(id);
      await loadExpenses();
      return true;
    } catch (e) {
      print('Error deleting expense: $e');
      return false;
    }
  }
}
