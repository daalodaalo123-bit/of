import 'package:flutter/foundation.dart';
import '../models/invoice.dart';
import '../services/database_service.dart';

class InvoiceProvider with ChangeNotifier {
  final DatabaseService _dbService = DatabaseService();
  List<Invoice> _invoices = [];
  bool _isLoading = false;

  List<Invoice> get invoices => _invoices;
  bool get isLoading => _isLoading;

  Future<void> loadInvoices() async {
    _isLoading = true;
    notifyListeners();
    try {
      _invoices = await _dbService.getAllInvoices();
    } catch (e) {
      print('Error loading invoices: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> addInvoice(Invoice invoice) async {
    try {
      await _dbService.insertInvoice(invoice);
      await loadInvoices();
      return true;
    } catch (e) {
      print('Error adding invoice: $e');
      return false;
    }
  }

  Future<bool> updateInvoice(Invoice invoice) async {
    try {
      await _dbService.updateInvoice(invoice);
      await loadInvoices();
      return true;
    } catch (e) {
      print('Error updating invoice: $e');
      return false;
    }
  }
}
