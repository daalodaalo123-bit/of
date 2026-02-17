import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:uuid/uuid.dart';
import 'package:intl/intl.dart';
import '../providers/appointment_provider.dart';
import '../providers/patient_provider.dart';
import '../models/appointment.dart';

class AppointmentFormScreen extends StatefulWidget {
  final String? patientId;
  final Appointment? appointment;

  const AppointmentFormScreen({super.key, this.patientId, this.appointment});

  @override
  State<AppointmentFormScreen> createState() => _AppointmentFormScreenState();
}

class _AppointmentFormScreenState extends State<AppointmentFormScreen> {
  final _formKey = GlobalKey<FormState>();
  String? _selectedPatientId;
  DateTime? _selectedDate;
  TimeOfDay? _selectedTime;
  String _timeSlot = '09:00 AM';
  String _status = 'scheduled';
  final _notesController = TextEditingController();
  final _treatmentTypeController = TextEditingController();

  final List<String> _timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
    '05:00 PM', '05:30 PM',
  ];

  @override
  void initState() {
    super.initState();
    if (widget.appointment != null) {
      _selectedPatientId = widget.appointment!.patientId;
      _selectedDate = widget.appointment!.appointmentDate;
      _timeSlot = widget.appointment!.timeSlot;
      _status = widget.appointment!.status;
      _notesController.text = widget.appointment!.notes ?? '';
      _treatmentTypeController.text = widget.appointment!.treatmentType ?? '';
    } else if (widget.patientId != null) {
      _selectedPatientId = widget.patientId;
    }
    _selectedDate ??= DateTime.now();
    _selectedTime ??= TimeOfDay.now();
  }

  @override
  void dispose() {
    _notesController.dispose();
    _treatmentTypeController.dispose();
    super.dispose();
  }

  Future<void> _selectDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate ?? DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked != null) {
      setState(() => _selectedDate = picked);
    }
  }

  Future<void> _selectTime() async {
    final picked = await showTimePicker(
      context: context,
      initialTime: _selectedTime ?? TimeOfDay.now(),
    );
    if (picked != null) {
      setState(() => _selectedTime = picked);
      _timeSlot = picked.format(context);
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate() || _selectedPatientId == null || _selectedDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill all required fields')),
      );
      return;
    }

    final patientProvider = Provider.of<PatientProvider>(context, listen: false);
    final patient = patientProvider.getPatientById(_selectedPatientId!);
    if (patient == null) return;

    final appointmentDate = DateTime(
      _selectedDate!.year,
      _selectedDate!.month,
      _selectedDate!.day,
      _selectedTime?.hour ?? 9,
      _selectedTime?.minute ?? 0,
    );

    final now = DateTime.now();
    final appointment = Appointment(
      id: widget.appointment?.id ?? const Uuid().v4(),
      patientId: _selectedPatientId!,
      patientName: patient.name,
      appointmentDate: appointmentDate,
      timeSlot: _timeSlot,
      status: _status,
      notes: _notesController.text.trim().isEmpty ? null : _notesController.text.trim(),
      treatmentType: _treatmentTypeController.text.trim().isEmpty
          ? null
          : _treatmentTypeController.text.trim(),
      createdAt: widget.appointment?.createdAt ?? now,
      updatedAt: now,
    );

    final provider = Provider.of<AppointmentProvider>(context, listen: false);
    final success = widget.appointment == null
        ? await provider.addAppointment(appointment)
        : await provider.updateAppointment(appointment);

    if (success && mounted) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(widget.appointment == null ? 'Appointment scheduled' : 'Appointment updated')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final patientProvider = Provider.of<PatientProvider>(context);
    final patients = patientProvider.patients;

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.appointment == null ? 'Schedule Appointment' : 'Edit Appointment'),
      ),
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
              onChanged: (value) => setState(() => _selectedPatientId = value),
              validator: (value) => value == null ? 'Please select patient' : null,
            ),
            const SizedBox(height: 16),
            InkWell(
              onTap: _selectDate,
              child: InputDecorator(
                decoration: const InputDecoration(
                  labelText: 'Date *',
                  border: OutlineInputBorder(),
                ),
                child: Text(
                  _selectedDate == null
                      ? 'Select date'
                      : DateFormat('yyyy-MM-dd').format(_selectedDate!),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: InkWell(
                    onTap: _selectTime,
                    child: InputDecorator(
                      decoration: const InputDecoration(
                        labelText: 'Time *',
                        border: OutlineInputBorder(),
                      ),
                      child: Text(_selectedTime?.format(context) ?? 'Select time'),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: DropdownButtonFormField<String>(
                    value: _timeSlot,
                    decoration: const InputDecoration(
                      labelText: 'Time Slot',
                      border: OutlineInputBorder(),
                    ),
                    items: _timeSlots.map((slot) {
                      return DropdownMenuItem(value: slot, child: Text(slot));
                    }).toList(),
                    onChanged: (value) => setState(() => _timeSlot = value!),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: _status,
              decoration: const InputDecoration(
                labelText: 'Status *',
                border: OutlineInputBorder(),
              ),
              items: ['scheduled', 'completed', 'cancelled', 'no_show']
                  .map((s) => DropdownMenuItem(value: s, child: Text(s.toUpperCase())))
                  .toList(),
              onChanged: (value) => setState(() => _status = value!),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _treatmentTypeController,
              decoration: const InputDecoration(
                labelText: 'Treatment Type',
                border: OutlineInputBorder(),
              ),
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
