import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:uuid/uuid.dart';
import 'package:intl/intl.dart';
import '../providers/patient_provider.dart';
import '../models/patient.dart';

class PatientFormScreen extends StatefulWidget {
  final Patient? patient;

  const PatientFormScreen({super.key, this.patient});

  @override
  State<PatientFormScreen> createState() => _PatientFormScreenState();
}

class _PatientFormScreenState extends State<PatientFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  final _medicalHistoryController = TextEditingController();
  final _allergiesController = TextEditingController();
  
  DateTime? _dateOfBirth;
  String _gender = 'Male';

  @override
  void initState() {
    super.initState();
    if (widget.patient != null) {
      _nameController.text = widget.patient!.name;
      _emailController.text = widget.patient!.email;
      _phoneController.text = widget.patient!.phone;
      _addressController.text = widget.patient!.address;
      _medicalHistoryController.text = widget.patient!.medicalHistory ?? '';
      _allergiesController.text = widget.patient!.allergies ?? '';
      _dateOfBirth = widget.patient!.dateOfBirth;
      _gender = widget.patient!.gender;
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _medicalHistoryController.dispose();
    _allergiesController.dispose();
    super.dispose();
  }

  Future<void> _selectDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _dateOfBirth ?? DateTime.now().subtract(const Duration(days: 365 * 30)),
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
    );
    if (picked != null) {
      setState(() => _dateOfBirth = picked);
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate() || _dateOfBirth == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill all required fields')),
      );
      return;
    }

    final now = DateTime.now();
    final patient = Patient(
      id: widget.patient?.id ?? const Uuid().v4(),
      name: _nameController.text.trim(),
      email: _emailController.text.trim(),
      phone: _phoneController.text.trim(),
      dateOfBirth: _dateOfBirth!,
      gender: _gender,
      address: _addressController.text.trim(),
      medicalHistory: _medicalHistoryController.text.trim().isEmpty
          ? null
          : _medicalHistoryController.text.trim(),
      allergies: _allergiesController.text.trim().isEmpty
          ? null
          : _allergiesController.text.trim(),
      createdAt: widget.patient?.createdAt ?? now,
      updatedAt: now,
    );

    final provider = Provider.of<PatientProvider>(context, listen: false);
    final success = widget.patient == null
        ? await provider.addPatient(patient)
        : await provider.updatePatient(patient);

    if (success && mounted) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(widget.patient == null ? 'Patient added' : 'Patient updated')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.patient == null ? 'Add Patient' : 'Edit Patient'),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(
                labelText: 'Full Name *',
                border: OutlineInputBorder(),
              ),
              validator: (value) =>
                  value?.isEmpty ?? true ? 'Please enter name' : null,
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
              controller: _phoneController,
              decoration: const InputDecoration(
                labelText: 'Phone *',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.phone,
              validator: (value) =>
                  value?.isEmpty ?? true ? 'Please enter phone' : null,
            ),
            const SizedBox(height: 16),
            InkWell(
              onTap: _selectDate,
              child: InputDecorator(
                decoration: const InputDecoration(
                  labelText: 'Date of Birth *',
                  border: OutlineInputBorder(),
                ),
                child: Text(
                  _dateOfBirth == null
                      ? 'Select date'
                      : DateFormat('yyyy-MM-dd').format(_dateOfBirth!),
                ),
              ),
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: _gender,
              decoration: const InputDecoration(
                labelText: 'Gender *',
                border: OutlineInputBorder(),
              ),
              items: ['Male', 'Female', 'Other']
                  .map((g) => DropdownMenuItem(value: g, child: Text(g)))
                  .toList(),
              onChanged: (value) => setState(() => _gender = value!),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _addressController,
              decoration: const InputDecoration(
                labelText: 'Address *',
                border: OutlineInputBorder(),
              ),
              maxLines: 2,
              validator: (value) =>
                  value?.isEmpty ?? true ? 'Please enter address' : null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _medicalHistoryController,
              decoration: const InputDecoration(
                labelText: 'Medical History',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _allergiesController,
              decoration: const InputDecoration(
                labelText: 'Allergies',
                border: OutlineInputBorder(),
              ),
              maxLines: 2,
            ),
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
