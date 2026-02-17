import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:uuid/uuid.dart';
import '../providers/user_provider.dart';
import '../models/user.dart';

class UserFormScreen extends StatefulWidget {
  final User? user;

  const UserFormScreen({super.key, this.user});

  @override
  State<UserFormScreen> createState() => _UserFormScreenState();
}

class _UserFormScreenState extends State<UserFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _emailController = TextEditingController();
  final _fullNameController = TextEditingController();
  String _role = 'staff';
  bool _isActive = true;
  final List<String> _selectedPermissions = [];

  final List<String> _availablePermissions = [
    'view_patients',
    'edit_patients',
    'delete_patients',
    'view_appointments',
    'edit_appointments',
    'delete_appointments',
    'view_treatments',
    'edit_treatments',
    'view_invoices',
    'edit_invoices',
    'view_expenses',
    'edit_expenses',
    'view_reports',
  ];

  @override
  void initState() {
    super.initState();
    if (widget.user != null) {
      _usernameController.text = widget.user!.username;
      _emailController.text = widget.user!.email;
      _fullNameController.text = widget.user!.fullName;
      _role = widget.user!.role;
      _isActive = widget.user!.isActive;
      _selectedPermissions.addAll(widget.user!.permissions);
    }
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _emailController.dispose();
    _fullNameController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final now = DateTime.now();
    final user = User(
      id: widget.user?.id ?? const Uuid().v4(),
      username: _usernameController.text.trim(),
      email: _emailController.text.trim(),
      fullName: _fullNameController.text.trim(),
      role: _role,
      permissions: _role == 'admin' ? ['all'] : _selectedPermissions,
      isActive: _isActive,
      createdAt: widget.user?.createdAt ?? now,
      updatedAt: now,
    );

    final provider = Provider.of<UserProvider>(context, listen: false);
    final success = widget.user == null
        ? await provider.addUser(user)
        : await provider.updateUser(user);

    if (success && mounted) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(widget.user == null ? 'User added' : 'User updated')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.user == null ? 'Add User' : 'Edit User'),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            TextFormField(
              controller: _usernameController,
              decoration: const InputDecoration(
                labelText: 'Username *',
                border: OutlineInputBorder(),
              ),
              validator: (value) =>
                  value?.isEmpty ?? true ? 'Please enter username' : null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _emailController,
              decoration: const InputDecoration(
                labelText: 'Email *',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.emailAddress,
              validator: (value) {
                if (value?.isEmpty ?? true) return 'Please enter email';
                if (!value!.contains('@')) return 'Please enter valid email';
                return null;
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _fullNameController,
              decoration: const InputDecoration(
                labelText: 'Full Name *',
                border: OutlineInputBorder(),
              ),
              validator: (value) =>
                  value?.isEmpty ?? true ? 'Please enter full name' : null,
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: _role,
              decoration: const InputDecoration(
                labelText: 'Role *',
                border: OutlineInputBorder(),
              ),
              items: ['admin', 'doctor', 'staff']
                  .map((r) => DropdownMenuItem(value: r, child: Text(r.toUpperCase())))
                  .toList(),
              onChanged: (value) => setState(() => _role = value!),
            ),
            const SizedBox(height: 16),
            SwitchListTile(
              title: const Text('Active'),
              value: _isActive,
              onChanged: (value) => setState(() => _isActive = value),
            ),
            if (_role != 'admin') ...[
              const SizedBox(height: 16),
              const Text('Permissions', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              ..._availablePermissions.map((permission) {
                return CheckboxListTile(
                  title: Text(permission.replaceAll('_', ' ').toUpperCase()),
                  value: _selectedPermissions.contains(permission),
                  onChanged: (value) {
                    setState(() {
                      if (value == true) {
                        _selectedPermissions.add(permission);
                      } else {
                        _selectedPermissions.remove(permission);
                      }
                    });
                  },
                );
              }),
            ],
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _save,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text('Save'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
