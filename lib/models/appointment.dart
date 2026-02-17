class Appointment {
  final String id;
  final String patientId;
  final String patientName;
  final DateTime appointmentDate;
  final String timeSlot;
  final String status; // scheduled, completed, cancelled, no_show
  final String? notes;
  final String? treatmentType;
  final DateTime createdAt;
  final DateTime updatedAt;

  Appointment({
    required this.id,
    required this.patientId,
    required this.patientName,
    required this.appointmentDate,
    required this.timeSlot,
    required this.status,
    this.notes,
    this.treatmentType,
    required this.createdAt,
    required this.updatedAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'patientId': patientId,
      'patientName': patientName,
      'appointmentDate': appointmentDate.toIso8601String(),
      'timeSlot': timeSlot,
      'status': status,
      'notes': notes,
      'treatmentType': treatmentType,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  factory Appointment.fromMap(Map<String, dynamic> map) {
    return Appointment(
      id: map['id'] as String,
      patientId: map['patientId'] as String,
      patientName: map['patientName'] as String,
      appointmentDate: DateTime.parse(map['appointmentDate'] as String),
      timeSlot: map['timeSlot'] as String,
      status: map['status'] as String,
      notes: map['notes'] as String?,
      treatmentType: map['treatmentType'] as String?,
      createdAt: DateTime.parse(map['createdAt'] as String),
      updatedAt: DateTime.parse(map['updatedAt'] as String),
    );
  }

  Appointment copyWith({
    String? id,
    String? patientId,
    String? patientName,
    DateTime? appointmentDate,
    String? timeSlot,
    String? status,
    String? notes,
    String? treatmentType,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Appointment(
      id: id ?? this.id,
      patientId: patientId ?? this.patientId,
      patientName: patientName ?? this.patientName,
      appointmentDate: appointmentDate ?? this.appointmentDate,
      timeSlot: timeSlot ?? this.timeSlot,
      status: status ?? this.status,
      notes: notes ?? this.notes,
      treatmentType: treatmentType ?? this.treatmentType,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
