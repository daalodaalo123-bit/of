class Invoice {
  final String id;
  final String patientId;
  final String patientName;
  final String? treatmentId;
  final DateTime invoiceDate;
  final DateTime dueDate;
  final List<InvoiceItem> items;
  final double subtotal;
  final double tax;
  final double total;
  final String status; // pending, paid, overdue, cancelled
  final String? paymentMethod;
  final DateTime? paidDate;
  final DateTime createdAt;
  final DateTime updatedAt;

  Invoice({
    required this.id,
    required this.patientId,
    required this.patientName,
    this.treatmentId,
    required this.invoiceDate,
    required this.dueDate,
    required this.items,
    required this.subtotal,
    required this.tax,
    required this.total,
    required this.status,
    this.paymentMethod,
    this.paidDate,
    required this.createdAt,
    required this.updatedAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'patientId': patientId,
      'patientName': patientName,
      'treatmentId': treatmentId,
      'invoiceDate': invoiceDate.toIso8601String(),
      'dueDate': dueDate.toIso8601String(),
      'items': items.map((item) => item.toMap()).toList(),
      'subtotal': subtotal,
      'tax': tax,
      'total': total,
      'status': status,
      'paymentMethod': paymentMethod,
      'paidDate': paidDate?.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  factory Invoice.fromMap(Map<String, dynamic> map) {
    return Invoice(
      id: map['id'] as String,
      patientId: map['patientId'] as String,
      patientName: map['patientName'] as String,
      treatmentId: map['treatmentId'] as String?,
      invoiceDate: DateTime.parse(map['invoiceDate'] as String),
      dueDate: DateTime.parse(map['dueDate'] as String),
      items: (map['items'] as List)
          .map((item) => InvoiceItem.fromMap(item as Map<String, dynamic>))
          .toList(),
      subtotal: (map['subtotal'] as num).toDouble(),
      tax: (map['tax'] as num).toDouble(),
      total: (map['total'] as num).toDouble(),
      status: map['status'] as String,
      paymentMethod: map['paymentMethod'] as String?,
      paidDate: map['paidDate'] != null
          ? DateTime.parse(map['paidDate'] as String)
          : null,
      createdAt: DateTime.parse(map['createdAt'] as String),
      updatedAt: DateTime.parse(map['updatedAt'] as String),
    );
  }
}

class InvoiceItem {
  final String description;
  final int quantity;
  final double unitPrice;
  final double total;

  InvoiceItem({
    required this.description,
    required this.quantity,
    required this.unitPrice,
    required this.total,
  });

  Map<String, dynamic> toMap() {
    return {
      'description': description,
      'quantity': quantity,
      'unitPrice': unitPrice,
      'total': total,
    };
  }

  factory InvoiceItem.fromMap(Map<String, dynamic> map) {
    return InvoiceItem(
      description: map['description'] as String,
      quantity: map['quantity'] as int,
      unitPrice: (map['unitPrice'] as num).toDouble(),
      total: (map['total'] as num).toDouble(),
    );
  }
}
