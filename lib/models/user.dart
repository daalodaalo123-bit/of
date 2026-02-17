class User {
  final String id;
  final String username;
  final String email;
  final String fullName;
  final String role; // admin, doctor, staff
  final List<String> permissions;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;

  User({
    required this.id,
    required this.username,
    required this.email,
    required this.fullName,
    required this.role,
    required this.permissions,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'username': username,
      'email': email,
      'fullName': fullName,
      'role': role,
      'permissions': permissions.join(','),
      'isActive': isActive ? 1 : 0,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  factory User.fromMap(Map<String, dynamic> map) {
    return User(
      id: map['id'] as String,
      username: map['username'] as String,
      email: map['email'] as String,
      fullName: map['fullName'] as String,
      role: map['role'] as String,
      permissions: (map['permissions'] as String).split(',').where((p) => p.isNotEmpty).toList(),
      isActive: (map['isActive'] as int) == 1,
      createdAt: DateTime.parse(map['createdAt'] as String),
      updatedAt: DateTime.parse(map['updatedAt'] as String),
    );
  }

  bool hasPermission(String permission) {
    return permissions.contains(permission) || role == 'admin';
  }
}
