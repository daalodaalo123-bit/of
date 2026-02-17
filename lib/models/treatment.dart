class Treatment {
  final String id;
  final String patientId;
  final String patientName;
  final String appointmentId;
  final DateTime treatmentDate;
  final String treatmentType;
  final String diagnosis;
  final String? prescription;
  final String? notes;
  final double cost;
  final DateTime createdAt;
  final DateTime updatedAt;

  Treatment({
    required this.id,
    required this.patientId,
    required this.patientName,
    required this.appointmentId,
    required this.treatmentDate,
    required this.treatmentType,
    required this.diagnosis,
    this.prescription,
    this.notes,
    required this.cost,
    required this.createdAt,
    required this.updatedAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'patientId': patientId,
      'patientName': patientName,
      'appointmentId': appointmentId,
      'treatmentDate': treatmentDate.toIso8601String(),
      'treatmentType': treatmentType,
      'diagnosis': diagnosis,
      'prescription': prescription,
      'notes': notes,
      'cost': cost,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  factory Treatment.fromMap(Map<String, dynamic> map) {
    return Treatment(
      id: map['id'] as String,
      patientId: map['patientId'] as String,
      patientName: map['patientName'] as String,
      appointmentId: map['appointmentId'] as String,
      treatmentDate: DateTime.parse(map['treatmentDate'] as String),
      treatmentType: map['treatmentType'] as String,
      diagnosis: map['diagnosis'] as String,
      prescription: map['prescription'] as String?,
      notes: map['notes'] as String?,
      cost: (map['cost'] as num).toDouble(),
      createdAt: DateTime.parse(map['createdAt'] as String),
      updatedAt: DateTime.parse(map['updatedAt'] as String),
    );
  }
}
