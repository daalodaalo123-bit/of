import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/patient_provider.dart';
import '../providers/treatment_provider.dart';
import '../providers/appointment_provider.dart';
import 'appointment_form_screen.dart';
import 'treatment_form_screen.dart';

class PatientDetailScreen extends StatelessWidget {
  final String patientId;

  const PatientDetailScreen({super.key, required this.patientId});

  @override
  Widget build(BuildContext context) {
    final patientProvider = Provider.of<PatientProvider>(context);
    final patient = patientProvider.getPatientById(patientId);

    if (patient == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Patient Details')),
        body: const Center(child: Text('Patient not found')),
      );
    }

    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: Text(patient.name),
          bottom: const TabBar(
            tabs: [
              Tab(text: 'Details'),
              Tab(text: 'Appointments'),
              Tab(text: 'Treatments'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _buildDetailsTab(context, patient),
            _buildAppointmentsTab(context, patient),
            _buildTreatmentsTab(context, patient),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailsTab(BuildContext context, patient) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildInfoRow('Email', patient.email),
                  _buildInfoRow('Phone', patient.phone),
                  _buildInfoRow('Date of Birth', DateFormat('yyyy-MM-dd').format(patient.dateOfBirth)),
                  _buildInfoRow('Gender', patient.gender),
                  _buildInfoRow('Address', patient.address),
                  if (patient.medicalHistory != null)
                    _buildInfoRow('Medical History', patient.medicalHistory!),
                  if (patient.allergies != null)
                    _buildInfoRow('Allergies', patient.allergies!),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAppointmentsTab(BuildContext context, patient) {
    return FutureBuilder(
      future: Provider.of<AppointmentProvider>(context, listen: false).loadAppointments(),
      builder: (context, snapshot) {
        final appointments = Provider.of<AppointmentProvider>(context)
            .appointments
            .where((apt) => apt.patientId == patient.id)
            .toList();

        return Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => AppointmentFormScreen(patientId: patient.id),
                      ),
                    );
                  },
                  icon: const Icon(Icons.add),
                  label: const Text('New Appointment'),
                ),
              ),
            ),
            Expanded(
              child: appointments.isEmpty
                  ? const Center(child: Text('No appointments'))
                  : ListView.builder(
                      itemCount: appointments.length,
                      itemBuilder: (context, index) {
                        final apt = appointments[index];
                        return Card(
                          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                          child: ListTile(
                            title: Text(DateFormat('yyyy-MM-dd h:mm a').format(apt.appointmentDate)),
                            subtitle: Text('${apt.timeSlot} • ${apt.status}'),
                            trailing: Chip(
                              label: Text(apt.status),
                              backgroundColor: _getStatusColor(apt.status),
                            ),
                          ),
                        );
                      },
                    ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildTreatmentsTab(BuildContext context, patient) {
    return FutureBuilder(
      future: Provider.of<TreatmentProvider>(context, listen: false).loadTreatments(),
      builder: (context, snapshot) {
        final treatments = Provider.of<TreatmentProvider>(context)
            .treatments
            .where((t) => t.patientId == patient.id)
            .toList();

        return Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => TreatmentFormScreen(patientId: patient.id),
                      ),
                    );
                  },
                  icon: const Icon(Icons.add),
                  label: const Text('New Treatment'),
                ),
              ),
            ),
            Expanded(
              child: treatments.isEmpty
                  ? const Center(child: Text('No treatments'))
                  : ListView.builder(
                      itemCount: treatments.length,
                      itemBuilder: (context, index) {
                        final treatment = treatments[index];
                        return Card(
                          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                          child: ListTile(
                            title: Text(treatment.treatmentType),
                            subtitle: Text('${treatment.diagnosis}\n${DateFormat('yyyy-MM-dd').format(treatment.treatmentDate)}'),
                            trailing: Text('\$${treatment.cost.toStringAsFixed(2)}'),
                          ),
                        );
                      },
                    ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'scheduled':
        return Colors.blue.shade100;
      case 'completed':
        return Colors.green.shade100;
      case 'cancelled':
        return Colors.red.shade100;
      default:
        return Colors.grey.shade100;
    }
  }
}
