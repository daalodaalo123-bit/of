class Expense {
  final String id;
  final String category;
  final String description;
  final double amount;
  final DateTime expenseDate;
  final String? receiptPath;
  final String? notes;
  final DateTime createdAt;
  final DateTime updatedAt;

  Expense({
    required this.id,
    required this.category,
    required this.description,
    required this.amount,
    required this.expenseDate,
    this.receiptPath,
    this.notes,
    required this.createdAt,
    required this.updatedAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'category': category,
      'description': description,
      'amount': amount,
      'expenseDate': expenseDate.toIso8601String(),
      'receiptPath': receiptPath,
      'notes': notes,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  factory Expense.fromMap(Map<String, dynamic> map) {
    return Expense(
      id: map['id'] as String,
      category: map['category'] as String,
      description: map['description'] as String,
      amount: (map['amount'] as num).toDouble(),
      expenseDate: DateTime.parse(map['expenseDate'] as String),
      receiptPath: map['receiptPath'] as String?,
      notes: map['notes'] as String?,
      createdAt: DateTime.parse(map['createdAt'] as String),
      updatedAt: DateTime.parse(map['updatedAt'] as String),
    );
  }
}
