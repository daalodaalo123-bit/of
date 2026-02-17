import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:uuid/uuid.dart';
import 'package:intl/intl.dart';
import '../providers/treatment_provider.dart';
import '../providers/patient_provider.dart';
import '../providers/appointment_provider.dart';
import '../models/treatment.dart';

class TreatmentFormScreen extends StatefulWidget {
  final String? patientId;
  final String? appointmentId;

  const TreatmentFormScreen({super.key, this.patientId, this.appointmentId});

  @override
  State<TreatmentFormScreen> createState() => _TreatmentFormScreenState();
}

class _TreatmentFormScreenState extends State<TreatmentFormScreen> {
  final _formKey = GlobalKey<FormState>();
  String? _selectedPatientId;
  String? _selectedAppointmentId;
  DateTime? _treatmentDate;
  final _treatmentTypeController = TextEditingController();
  final _diagnosisController = TextEditingController();
  final _prescriptionController = TextEditingController();
  final _notesController = TextEditingController();
  final _costController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _selectedPatientId = widget.patientId;
    _selectedAppointmentId = widget.appointmentId;
    _treatmentDate = DateTime.now();
  }

  @override
  void dispose() {
    _treatmentTypeController.dispose();
    _diagnosisController.dispose();
    _prescriptionController.dispose();
    _notesController.dispose();
    _costController.dispose();
    super.dispose();
  }

  Future<void> _selectDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _treatmentDate ?? DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
    );
    if (picked != null) {
      setState(() => _treatmentDate = picked);
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate() ||
        _selectedPatientId == null ||
        _selectedAppointmentId == null ||
        _treatmentDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill all required fields')),
      );
      return;
    }

    final patientProvider = Provider.of<PatientProvider>(context, listen: false);
    final patient = patientProvider.getPatientById(_selectedPatientId!);
    if (patient == null) return;

    final cost = double.tryParse(_costController.text) ?? 0.0;
    final now = DateTime.now();

    final treatment = Treatment(
      id: const Uuid().v4(),
      patientId: _selectedPatientId!,
      patientName: patient.name,
      appointmentId: _selectedAppointmentId!,
      treatmentDate: _treatmentDate!,
      treatmentType: _treatmentTypeController.text.trim(),
      diagnosis: _diagnosisController.text.trim(),
      prescription: _prescriptionController.text.trim().isEmpty
          ? null
          : _prescriptionController.text.trim(),
      notes: _notesController.text.trim().isEmpty
          ? null
          : _notesController.text.trim(),
      cost: cost,
      createdAt: now,
      updatedAt: now,
    );

    final provider = Provider.of<TreatmentProvider>(context, listen: false);
    final success = await provider.addTreatment(treatment);

    if (success && mounted) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Treatment recorded')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final patientProvider = Provider.of<PatientProvider>(context);
    final appointmentProvider = Provider.of<AppointmentProvider>(context);
    final patients = patientProvider.patients;
    final appointments = appointmentProvider.appointments
        .where((apt) => _selectedPatientId == null || apt.patientId == _selectedPatientId)
        .toList();

    return Scaffold(
      appBar: AppBar(title: const Text('Record Treatment')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            DropdownButtonFormField<String>(
              value: _selectedPatientId,
              decoration: const InputDecoration(
                labelText: 'Patient *',
                border: OutlineInputBorder(),
              ),
              items: patients.map((p) {
                return DropdownMenuItem(
                  value: p.id,
                  child: Text(p.name),
                );
              }).toList(),
              onChanged: (value) {
                setState(() {
                  _selectedPatientId = value;
                  _selectedAppointmentId = null;
                });
              },
              validator: (value) => value == null ? 'Please select patient' : null,
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: _selectedAppointmentId,
              decoration: const InputDecoration(
                labelText: 'Appointment *',
                border: OutlineInputBorder(),
              ),
              items: appointments.map((apt) {
                return DropdownMenuItem(
                  value: apt.id,
                  child: Text('${DateFormat('MMM dd, yyyy').format(apt.appointmentDate)} - ${apt.timeSlot}'),
                );
              }).toList(),
              onChanged: (value) => setState(() => _selectedAppointmentId = value),
              validator: (value) => value == null ? 'Please select appointment' : null,
            ),
            const SizedBox(height: 16),
            InkWell(
              onTap: _selectDate,
              child: InputDecorator(
                decoration: const InputDecoration(
                  labelText: 'Treatment Date *',
                  border: OutlineInputBorder(),
                ),
                child: Text(
                  _treatmentDate == null
                      ? 'Select date'
                      : DateFormat('yyyy-MM-dd').format(_treatmentDate!),
                ),
              ),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _treatmentTypeController,
              decoration: const InputDecoration(
                labelText: 'Treatment Type *',
                border: OutlineInputBorder(),
              ),
              validator: (value) =>
                  value?.isEmpty ?? true ? 'Please enter treatment type' : null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _diagnosisController,
              decoration: const InputDecoration(
                labelText: 'Diagnosis *',
                border: OutlineInputBorder(),
              ),
              maxLines: 2,
              validator: (value) =>
                  value?.isEmpty ?? true ? 'Please enter diagnosis' : null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _prescriptionController,
              decoration: const InputDecoration(
                labelText: 'Prescription',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _notesController,
              decoration: const InputDecoration(
                labelText: 'Notes',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _costController,
              decoration: const InputDecoration(
                labelText: 'Cost *',
                border: OutlineInputBorder(),
                prefixText: '\$',
              ),
              keyboardType: TextInputType.number,
              validator: (value) {
                if (value?.isEmpty ?? true) return 'Please enter cost';
                if (double.tryParse(value!) == null) return 'Please enter valid number';
                return null;
              },
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
