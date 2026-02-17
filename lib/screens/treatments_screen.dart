import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/treatment_provider.dart';
import '../providers/patient_provider.dart';
import 'treatment_form_screen.dart';

class TreatmentsScreen extends StatefulWidget {
  const TreatmentsScreen({super.key});

  @override
  State<TreatmentsScreen> createState() => _TreatmentsScreenState();
}

class _TreatmentsScreenState extends State<TreatmentsScreen> {
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<TreatmentProvider>(context, listen: false).loadTreatments();
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
                hintText: 'Search treatments...',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              onChanged: (_) => setState(() {}),
            ),
          ),
          Expanded(
            child: Consumer<TreatmentProvider>(
              builder: (context, provider, _) {
                if (provider.isLoading) {
                  return const Center(child: CircularProgressIndicator());
                }

                var treatments = provider.treatments;
                final query = _searchController.text.toLowerCase();
                if (query.isNotEmpty) {
                  treatments = treatments.where((t) {
                    return t.patientName.toLowerCase().contains(query) ||
                        t.treatmentType.toLowerCase().contains(query) ||
                        t.diagnosis.toLowerCase().contains(query);
                  }).toList();
                }

                if (treatments.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.medical_services_outlined, size: 64, color: Colors.grey.shade400),
                        const SizedBox(height: 16),
                        Text(
                          query.isEmpty ? 'No treatments yet' : 'No treatments found',
                          style: TextStyle(color: Colors.grey.shade600),
                        ),
                      ],
                    ),
                  );
                }

                return ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: treatments.length,
                  itemBuilder: (context, index) {
                    final treatment = treatments[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 8),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: Colors.green.shade100,
                          child: Icon(Icons.medical_services, color: Colors.green.shade700),
                        ),
                        title: Text(treatment.patientName),
                        subtitle: Text('${treatment.treatmentType}\n${treatment.diagnosis}'),
                        trailing: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              '\$${treatment.cost.toStringAsFixed(2)}',
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                            Text(
                              DateFormat('MMM dd, yyyy').format(treatment.treatmentDate),
                              style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                            ),
                          ],
                        ),
                        onTap: () {
                          showDialog(
                            context: context,
                            builder: (context) => AlertDialog(
                              title: Text(treatment.treatmentType),
                              content: Column(
                                mainAxisSize: MainAxisSize.min,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('Patient: ${treatment.patientName}'),
                                  Text('Date: ${DateFormat('yyyy-MM-dd').format(treatment.treatmentDate)}'),
                                  Text('Diagnosis: ${treatment.diagnosis}'),
                                  if (treatment.prescription != null)
                                    Text('Prescription: ${treatment.prescription}'),
                                  if (treatment.notes != null)
                                    Text('Notes: ${treatment.notes}'),
                                  Text('Cost: \$${treatment.cost.toStringAsFixed(2)}'),
                                ],
                              ),
                              actions: [
                                TextButton(
                                  onPressed: () => Navigator.pop(context),
                                  child: const Text('Close'),
                                ),
                              ],
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
            MaterialPageRoute(builder: (_) => const TreatmentFormScreen()),
          );
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
