import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import '../models/patient.dart';
import '../models/appointment.dart';
import '../models/treatment.dart';
import '../models/invoice.dart';
import '../models/expense.dart';
import '../models/user.dart';
import 'dart:convert';

class DatabaseService {
  static final DatabaseService _instance = DatabaseService._internal();
  factory DatabaseService() => _instance;
  DatabaseService._internal();

  static Database? _database;

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    String path = join(await getDatabasesPath(), 'healthcare.db');
    return await openDatabase(
      path,
      version: 1,
      onCreate: _onCreate,
    );
  }

  Future<void> _onCreate(Database db, int version) async {
    // Patients table
    await db.execute('''
      CREATE TABLE patients (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        dateOfBirth TEXT NOT NULL,
        gender TEXT NOT NULL,
        address TEXT NOT NULL,
        medicalHistory TEXT,
        allergies TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    ''');

    // Appointments table
    await db.execute('''
      CREATE TABLE appointments (
        id TEXT PRIMARY KEY,
        patientId TEXT NOT NULL,
        patientName TEXT NOT NULL,
        appointmentDate TEXT NOT NULL,
        timeSlot TEXT NOT NULL,
        status TEXT NOT NULL,
        notes TEXT,
        treatmentType TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (patientId) REFERENCES patients (id)
      )
    ''');

    // Treatments table
    await db.execute('''
      CREATE TABLE treatments (
        id TEXT PRIMARY KEY,
        patientId TEXT NOT NULL,
        patientName TEXT NOT NULL,
        appointmentId TEXT NOT NULL,
        treatmentDate TEXT NOT NULL,
        treatmentType TEXT NOT NULL,
        diagnosis TEXT NOT NULL,
        prescription TEXT,
        notes TEXT,
        cost REAL NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (patientId) REFERENCES patients (id),
        FOREIGN KEY (appointmentId) REFERENCES appointments (id)
      )
    ''');

    // Invoices table
    await db.execute('''
      CREATE TABLE invoices (
        id TEXT PRIMARY KEY,
        patientId TEXT NOT NULL,
        patientName TEXT NOT NULL,
        treatmentId TEXT,
        invoiceDate TEXT NOT NULL,
        dueDate TEXT NOT NULL,
        items TEXT NOT NULL,
        subtotal REAL NOT NULL,
        tax REAL NOT NULL,
        total REAL NOT NULL,
        status TEXT NOT NULL,
        paymentMethod TEXT,
        paidDate TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (patientId) REFERENCES patients (id)
      )
    ''');

    // Expenses table
    await db.execute('''
      CREATE TABLE expenses (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        expenseDate TEXT NOT NULL,
        receiptPath TEXT,
        notes TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    ''');

    // Users table
    await db.execute('''
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL,
        fullName TEXT NOT NULL,
        role TEXT NOT NULL,
        permissions TEXT NOT NULL,
        isActive INTEGER NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      )
    ''');

    // Create default admin user
    final now = DateTime.now().toIso8601String();
    await db.insert('users', {
      'id': 'admin-001',
      'username': 'admin',
      'email': 'admin@healthcare.com',
      'fullName': 'System Administrator',
      'role': 'admin',
      'permissions': 'all',
      'isActive': 1,
      'createdAt': now,
      'updatedAt': now,
    });
  }

  // Patient CRUD
  Future<String> insertPatient(Patient patient) async {
    final db = await database;
    await db.insert('patients', patient.toMap());
    return patient.id;
  }

  Future<List<Patient>> getAllPatients() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query('patients', orderBy: 'createdAt DESC');
    return List.generate(maps.length, (i) => Patient.fromMap(maps[i]));
  }

  Future<Patient?> getPatientById(String id) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'patients',
      where: 'id = ?',
      whereArgs: [id],
    );
    if (maps.isEmpty) return null;
    return Patient.fromMap(maps.first);
  }

  Future<int> updatePatient(Patient patient) async {
    final db = await database;
    return await db.update(
      'patients',
      patient.copyWith(updatedAt: DateTime.now()).toMap(),
      where: 'id = ?',
      whereArgs: [patient.id],
    );
  }

  Future<int> deletePatient(String id) async {
    final db = await database;
    return await db.delete('patients', where: 'id = ?', whereArgs: [id]);
  }

  // Appointment CRUD
  Future<String> insertAppointment(Appointment appointment) async {
    final db = await database;
    await db.insert('appointments', appointment.toMap());
    return appointment.id;
  }

  Future<List<Appointment>> getAllAppointments() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query('appointments', orderBy: 'appointmentDate ASC');
    return List.generate(maps.length, (i) => Appointment.fromMap(maps[i]));
  }

  Future<List<Appointment>> getAppointmentsByDate(DateTime date) async {
    final db = await database;
    final dateStr = date.toIso8601String().split('T')[0];
    final List<Map<String, dynamic>> maps = await db.query(
      'appointments',
      where: "DATE(appointmentDate) = ?",
      whereArgs: [dateStr],
      orderBy: 'timeSlot ASC',
    );
    return List.generate(maps.length, (i) => Appointment.fromMap(maps[i]));
  }

  Future<int> updateAppointment(Appointment appointment) async {
    final db = await database;
    return await db.update(
      'appointments',
      appointment.copyWith(updatedAt: DateTime.now()).toMap(),
      where: 'id = ?',
      whereArgs: [appointment.id],
    );
  }

  Future<int> deleteAppointment(String id) async {
    final db = await database;
    return await db.delete('appointments', where: 'id = ?', whereArgs: [id]);
  }

  // Treatment CRUD
  Future<String> insertTreatment(Treatment treatment) async {
    final db = await database;
    await db.insert('treatments', treatment.toMap());
    return treatment.id;
  }

  Future<List<Treatment>> getAllTreatments() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query('treatments', orderBy: 'treatmentDate DESC');
    return List.generate(maps.length, (i) => Treatment.fromMap(maps[i]));
  }

  Future<List<Treatment>> getTreatmentsByPatient(String patientId) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'treatments',
      where: 'patientId = ?',
      whereArgs: [patientId],
      orderBy: 'treatmentDate DESC',
    );
    return List.generate(maps.length, (i) => Treatment.fromMap(maps[i]));
  }

  Future<int> updateTreatment(Treatment treatment) async {
    final db = await database;
    return await db.update(
      'treatments',
      treatment.copyWith(updatedAt: DateTime.now()).toMap(),
      where: 'id = ?',
      whereArgs: [treatment.id],
    );
  }

  // Invoice CRUD
  Future<String> insertInvoice(Invoice invoice) async {
    final db = await database;
    final map = invoice.toMap();
    map['items'] = jsonEncode(map['items']);
    await db.insert('invoices', map);
    return invoice.id;
  }

  Future<List<Invoice>> getAllInvoices() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query('invoices', orderBy: 'invoiceDate DESC');
    return maps.map((map) {
      map['items'] = jsonDecode(map['items'] as String);
      return Invoice.fromMap(map);
    }).toList();
  }

  Future<int> updateInvoice(Invoice invoice) async {
    final db = await database;
    final map = invoice.copyWith(updatedAt: DateTime.now()).toMap();
    map['items'] = jsonEncode(map['items']);
    return await db.update('invoices', map, where: 'id = ?', whereArgs: [invoice.id]);
  }

  // Expense CRUD
  Future<String> insertExpense(Expense expense) async {
    final db = await database;
    await db.insert('expenses', expense.toMap());
    return expense.id;
  }

  Future<List<Expense>> getAllExpenses() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query('expenses', orderBy: 'expenseDate DESC');
    return List.generate(maps.length, (i) => Expense.fromMap(maps[i]));
  }

  Future<int> updateExpense(Expense expense) async {
    final db = await database;
    return await db.update(
      'expenses',
      expense.copyWith(updatedAt: DateTime.now()).toMap(),
      where: 'id = ?',
      whereArgs: [expense.id],
    );
  }

  Future<int> deleteExpense(String id) async {
    final db = await database;
    return await db.delete('expenses', where: 'id = ?', whereArgs: [id]);
  }

  // User CRUD
  Future<String> insertUser(User user) async {
    final db = await database;
    await db.insert('users', user.toMap());
    return user.id;
  }

  Future<List<User>> getAllUsers() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query('users', orderBy: 'createdAt DESC');
    return List.generate(maps.length, (i) => User.fromMap(maps[i]));
  }

  Future<User?> getUserByUsername(String username) async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'users',
      where: 'username = ?',
      whereArgs: [username],
    );
    if (maps.isEmpty) return null;
    return User.fromMap(maps.first);
  }

  Future<int> updateUser(User user) async {
    final db = await database;
    return await db.update(
      'users',
      user.copyWith(updatedAt: DateTime.now()).toMap(),
      where: 'id = ?',
      whereArgs: [user.id],
    );
  }

  // Analytics & Reports
  Future<Map<String, dynamic>> getDashboardStats() async {
    final db = await database;
    
    final patientCount = Sqflite.firstIntValue(
      await db.rawQuery('SELECT COUNT(*) FROM patients')
    ) ?? 0;
    
    final appointmentCount = Sqflite.firstIntValue(
      await db.rawQuery('SELECT COUNT(*) FROM appointments WHERE status = ?', ['scheduled'])
    ) ?? 0;
    
    final todayAppointments = Sqflite.firstIntValue(
      await db.rawQuery(
        'SELECT COUNT(*) FROM appointments WHERE DATE(appointmentDate) = DATE(?) AND status = ?',
        [DateTime.now().toIso8601String(), 'scheduled']
      )
    ) ?? 0;
    
    final totalRevenue = Sqflite.firstDoubleValue(
      await db.rawQuery('SELECT SUM(total) FROM invoices WHERE status = ?', ['paid'])
    ) ?? 0.0;
    
    final totalExpenses = Sqflite.firstDoubleValue(
      await db.rawQuery('SELECT SUM(amount) FROM expenses')
    ) ?? 0.0;
    
    return {
      'patientCount': patientCount,
      'appointmentCount': appointmentCount,
      'todayAppointments': todayAppointments,
      'totalRevenue': totalRevenue,
      'totalExpenses': totalExpenses,
      'profit': totalRevenue - totalExpenses,
    };
  }

  Future<List<Map<String, dynamic>>> getRevenueByMonth() async {
    final db = await database;
    return await db.rawQuery('''
      SELECT 
        strftime('%Y-%m', invoiceDate) as month,
        SUM(total) as revenue
      FROM invoices
      WHERE status = 'paid'
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    ''');
  }

  Future<List<Map<String, dynamic>>> getExpensesByCategory() async {
    final db = await database;
    return await db.rawQuery('''
      SELECT 
        category,
        SUM(amount) as total
      FROM expenses
      GROUP BY category
      ORDER BY total DESC
    ''');
  }

  // Export data
  Future<List<Map<String, dynamic>>> exportAllData() async {
    final db = await database;
    return {
      'patients': await db.query('patients'),
      'appointments': await db.query('appointments'),
      'treatments': await db.query('treatments'),
      'invoices': await db.query('invoices'),
      'expenses': await db.query('expenses'),
      'users': await db.query('users'),
    };
  }
}

extension UserExtension on User {
  User copyWith({
    String? id,
    String? username,
    String? email,
    String? fullName,
    String? role,
    List<String>? permissions,
    bool? isActive,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return User(
      id: id ?? this.id,
      username: username ?? this.username,
      email: email ?? this.email,
      fullName: fullName ?? this.fullName,
      role: role ?? this.role,
      permissions: permissions ?? this.permissions,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
