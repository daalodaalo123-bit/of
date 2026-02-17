import 'dart:convert';
import 'package:path_provider/path_provider.dart';
import 'package:csv/csv.dart';
import 'dart:io';
import '../services/database_service.dart';
import 'package:intl/intl.dart';

class ExportService {
  final DatabaseService _dbService = DatabaseService();

  Future<bool> exportAllData() async {
    try {
      final data = await _dbService.exportAllData();
      
      // Get documents directory
      final directory = await getApplicationDocumentsDirectory();
      final timestamp = DateFormat('yyyyMMdd_HHmmss').format(DateTime.now());
      final file = File('${directory.path}/healthcare_backup_$timestamp.json');
      
      // Write JSON backup
      await file.writeAsString(jsonEncode(data));
      
      // Also create CSV exports
      final patients = data['patients'] as List<dynamic>? ?? [];
      final appointments = data['appointments'] as List<dynamic>? ?? [];
      final treatments = data['treatments'] as List<dynamic>? ?? [];
      final invoices = data['invoices'] as List<dynamic>? ?? [];
      final expenses = data['expenses'] as List<dynamic>? ?? [];
      
      if (patients.isNotEmpty) {
        await _exportToCSV(patients.cast<Map<String, dynamic>>(), '${directory.path}/patients_$timestamp.csv');
      }
      if (appointments.isNotEmpty) {
        await _exportToCSV(appointments.cast<Map<String, dynamic>>(), '${directory.path}/appointments_$timestamp.csv');
      }
      if (treatments.isNotEmpty) {
        await _exportToCSV(treatments.cast<Map<String, dynamic>>(), '${directory.path}/treatments_$timestamp.csv');
      }
      if (invoices.isNotEmpty) {
        await _exportToCSV(invoices.cast<Map<String, dynamic>>(), '${directory.path}/invoices_$timestamp.csv');
      }
      if (expenses.isNotEmpty) {
        await _exportToCSV(expenses.cast<Map<String, dynamic>>(), '${directory.path}/expenses_$timestamp.csv');
      }
      
      return true;
    } catch (e) {
      print('Export error: $e');
      return false;
    }
  }

  Future<void> _exportToCSV(List<Map<String, dynamic>> data, String filePath) async {
    if (data.isEmpty) return;
    
    final csvData = <List<dynamic>>[];
    
    // Add headers
    csvData.add(data.first.keys.toList());
    
    // Add rows
    for (var row in data) {
      csvData.add(row.values.map((v) {
        if (v is Map) return jsonEncode(v);
        return v.toString();
      }).toList());
    }
    
    final csvString = const ListToCsvConverter().convert(csvData);
    final file = File(filePath);
    await file.writeAsString(csvString);
  }

  Future<String> exportPatientsCSV() async {
    try {
      final patients = await _dbService.getAllPatients();
      final data = patients.map((p) => p.toMap()).toList();
      
      final directory = await getApplicationDocumentsDirectory();
      final timestamp = DateFormat('yyyyMMdd_HHmmss').format(DateTime.now());
      final filePath = '${directory.path}/patients_export_$timestamp.csv';
      
      await _exportToCSV(data, filePath);
      return filePath;
    } catch (e) {
      print('Export patients error: $e');
      return '';
    }
  }

  Future<String> exportFinancialReport() async {
    try {
      final invoices = await _dbService.getAllInvoices();
      final expenses = await _dbService.getAllExpenses();
      
      final report = {
        'invoices': invoices.map((i) => i.toMap()).toList(),
        'expenses': expenses.map((e) => e.toMap()).toList(),
        'summary': await _dbService.getDashboardStats(),
      };
      
      final directory = await getApplicationDocumentsDirectory();
      final timestamp = DateFormat('yyyyMMdd_HHmmss').format(DateTime.now());
      final file = File('${directory.path}/financial_report_$timestamp.json');
      
      await file.writeAsString(jsonEncode(report));
      return file.path;
    } catch (e) {
      print('Export financial report error: $e');
      return '';
    }
  }
}
