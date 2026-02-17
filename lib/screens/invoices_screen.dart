import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/invoice_provider.dart';
import '../providers/patient_provider.dart';
import 'invoice_form_screen.dart';

class InvoicesScreen extends StatefulWidget {
  const InvoicesScreen({super.key});

  @override
  State<InvoicesScreen> createState() => _InvoicesScreenState();
}

class _InvoicesScreenState extends State<InvoicesScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<InvoiceProvider>(context, listen: false).loadInvoices();
      Provider.of<PatientProvider>(context, listen: false).loadPatients();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Consumer<InvoiceProvider>(
        builder: (context, provider, _) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.invoices.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.receipt_outlined, size: 64, color: Colors.grey.shade400),
                  const SizedBox(height: 16),
                  Text(
                    'No invoices yet',
                    style: TextStyle(color: Colors.grey.shade600),
                  ),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: provider.invoices.length,
            itemBuilder: (context, index) {
              final invoice = provider.invoices[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: _getStatusColor(invoice.status),
                    child: Icon(Icons.receipt, color: Colors.white),
                  ),
                  title: Text(invoice.patientName),
                  subtitle: Text(
                    '${DateFormat('MMM dd, yyyy').format(invoice.invoiceDate)} • ${invoice.status}',
                  ),
                  trailing: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        '\$${invoice.total.toStringAsFixed(2)}',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      Chip(
                        label: Text(invoice.status.toUpperCase()),
                        backgroundColor: _getStatusColor(invoice.status),
                        labelStyle: const TextStyle(fontSize: 10),
                      ),
                    ],
                  ),
                  onTap: () {
                    showDialog(
                      context: context,
                      builder: (context) => AlertDialog(
                        title: Text('Invoice #${invoice.id.substring(0, 8)}'),
                        content: SingleChildScrollView(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Patient: ${invoice.patientName}'),
                              Text('Date: ${DateFormat('yyyy-MM-dd').format(invoice.invoiceDate)}'),
                              Text('Due Date: ${DateFormat('yyyy-MM-dd').format(invoice.dueDate)}'),
                              const Divider(),
                              const Text('Items:', style: TextStyle(fontWeight: FontWeight.bold)),
                              ...invoice.items.map((item) {
                                return Text('${item.description} x${item.quantity} - \$${item.total.toStringAsFixed(2)}');
                              }),
                              const Divider(),
                              Text('Subtotal: \$${invoice.subtotal.toStringAsFixed(2)}'),
                              Text('Tax: \$${invoice.tax.toStringAsFixed(2)}'),
                              Text('Total: \$${invoice.total.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold)),
                              Text('Status: ${invoice.status}'),
                              if (invoice.paymentMethod != null)
                                Text('Payment Method: ${invoice.paymentMethod}'),
                            ],
                          ),
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
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const InvoiceFormScreen()),
          );
        },
        child: const Icon(Icons.add),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'paid':
        return Colors.green.shade300;
      case 'pending':
        return Colors.orange.shade300;
      case 'overdue':
        return Colors.red.shade300;
      default:
        return Colors.grey.shade300;
    }
  }
}
