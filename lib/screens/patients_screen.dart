import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:uuid/uuid.dart';
import '../providers/patient_provider.dart';
import '../models/patient.dart';
import 'patient_form_screen.dart';
import 'patient_detail_screen.dart';

class PatientsScreen extends StatefulWidget {
  const PatientsScreen({super.key});

  @override
  State<PatientsScreen> createState() => _PatientsScreenState();
}

class _PatientsScreenState extends State<PatientsScreen> {
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<PatientProvider>(context, listen: false).loadPatients();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search patients...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          setState(() {});
                        },
                      )
                    : null,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              onChanged: (_) => setState(() {}),
            ),
          ),
          Expanded(
            child: Consumer<PatientProvider>(
              builder: (context, provider, _) {
                if (provider.isLoading) {
                  return const Center(child: CircularProgressIndicator());
                }

                var patients = provider.patients;
                final query = _searchController.text.toLowerCase();
                if (query.isNotEmpty) {
                  patients = patients.where((p) {
                    return p.name.toLowerCase().contains(query) ||
                        p.email.toLowerCase().contains(query) ||
                        p.phone.contains(query);
                  }).toList();
                }

                if (patients.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.people_outline, size: 64, color: Colors.grey.shade400),
                        const SizedBox(height: 16),
                        Text(
                          query.isEmpty ? 'No patients yet' : 'No patients found',
                          style: TextStyle(color: Colors.grey.shade600),
                        ),
                      ],
                    ),
                  );
                }

                return ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: patients.length,
                  itemBuilder: (context, index) {
                    final patient = patients[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 8),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: Colors.blue.shade100,
                          child: Text(
                            patient.name[0].toUpperCase(),
                            style: TextStyle(color: Colors.blue.shade700),
                          ),
                        ),
                        title: Text(patient.name),
                        subtitle: Text('${patient.email} • ${patient.phone}'),
                        trailing: PopupMenuButton(
                          itemBuilder: (context) => [
                            const PopupMenuItem(
                              value: 'view',
                              child: Row(
                                children: [
                                  Icon(Icons.visibility),
                                  SizedBox(width: 8),
                                  Text('View Details'),
                                ],
                              ),
                            ),
                            const PopupMenuItem(
                              value: 'edit',
                              child: Row(
                                children: [
                                  Icon(Icons.edit),
                                  SizedBox(width: 8),
                                  Text('Edit'),
                                ],
                              ),
                            ),
                            const PopupMenuItem(
                              value: 'delete',
                              child: Row(
                                children: [
                                  Icon(Icons.delete, color: Colors.red),
                                  SizedBox(width: 8),
                                  Text('Delete', style: TextStyle(color: Colors.red)),
                                ],
                              ),
                            ),
                          ],
                          onSelected: (value) async {
                            if (value == 'view') {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => PatientDetailScreen(patientId: patient.id),
                                ),
                              );
                            } else if (value == 'edit') {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => PatientFormScreen(patient: patient),
                                ),
                              );
                            } else if (value == 'delete') {
                              final confirm = await showDialog<bool>(
                                context: context,
                                builder: (context) => AlertDialog(
                                  title: const Text('Delete Patient'),
                                  content: Text('Are you sure you want to delete ${patient.name}?'),
                                  actions: [
                                    TextButton(
                                      onPressed: () => Navigator.pop(context, false),
                                      child: const Text('Cancel'),
                                    ),
                                    TextButton(
                                      onPressed: () => Navigator.pop(context, true),
                                      child: const Text('Delete', style: TextStyle(color: Colors.red)),
                                    ),
                                  ],
                                ),
                              );
                              if (confirm == true) {
                                await provider.deletePatient(patient.id);
                                if (mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('Patient deleted')),
                                  );
                                }
                              }
                            }
                          },
                        ),
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => PatientDetailScreen(patientId: patient.id),
                            ),
                          );
                        },
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const PatientFormScreen()),
          );
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
