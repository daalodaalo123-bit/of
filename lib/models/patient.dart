class Patient {
  final String id;
  final String name;
  final String email;
  final String phone;
  final DateTime dateOfBirth;
  final String gender;
  final String address;
  final String? medicalHistory;
  final String? allergies;
  final DateTime createdAt;
  final DateTime updatedAt;

  Patient({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.dateOfBirth,
    required this.gender,
    required this.address,
    this.medicalHistory,
    this.allergies,
    required this.createdAt,
    required this.updatedAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'dateOfBirth': dateOfBirth.toIso8601String(),
      'gender': gender,
      'address': address,
      'medicalHistory': medicalHistory,
      'allergies': allergies,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  factory Patient.fromMap(Map<String, dynamic> map) {
    return Patient(
      id: map['id'] as String,
      name: map['name'] as String,
      email: map['email'] as String,
      phone: map['phone'] as String,
      dateOfBirth: DateTime.parse(map['dateOfBirth'] as String),
      gender: map['gender'] as String,
      address: map['address'] as String,
      medicalHistory: map['medicalHistory'] as String?,
      allergies: map['allergies'] as String?,
      createdAt: DateTime.parse(map['createdAt'] as String),
      updatedAt: DateTime.parse(map['updatedAt'] as String),
    );
  }

  Patient copyWith({
    String? id,
    String? name,
    String? email,
    String? phone,
    DateTime? dateOfBirth,
    String? gender,
    String? address,
    String? medicalHistory,
    String? allergies,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Patient(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      dateOfBirth: dateOfBirth ?? this.dateOfBirth,
      gender: gender ?? this.gender,
      address: address ?? this.address,
      medicalHistory: medicalHistory ?? this.medicalHistory,
      allergies: allergies ?? this.allergies,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
