import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:uuid/uuid.dart';
import 'package:intl/intl.dart';
import '../providers/invoice_provider.dart';
import '../providers/patient_provider.dart';
import '../providers/treatment_provider.dart';
import '../models/invoice.dart';

class InvoiceFormScreen extends StatefulWidget {
  const InvoiceFormScreen({super.key});

  @override
  State<InvoiceFormScreen> createState() => _InvoiceFormScreenState();
}

class _InvoiceFormScreenState extends State<InvoiceFormScreen> {
  final _formKey = GlobalKey<FormState>();
  String? _selectedPatientId;
  String? _selectedTreatmentId;
  DateTime? _invoiceDate;
  DateTime? _dueDate;
  String _status = 'pending';
  String? _paymentMethod;
  final List<InvoiceItem> _items = [];
  final _itemDescriptionController = TextEditingController();
  final _itemQuantityController = TextEditingController();
  final _itemPriceController = TextEditingController();
  double _taxRate = 0.0;

  @override
  void initState() {
    super.initState();
    _invoiceDate = DateTime.now();
    _dueDate = DateTime.now().add(const Duration(days: 30));
  }

  @override
  void dispose() {
    _itemDescriptionController.dispose();
    _itemQuantityController.dispose();
    _itemPriceController.dispose();
    super.dispose();
  }

  void _addItem() {
    final description = _itemDescriptionController.text.trim();
    final quantity = int.tryParse(_itemQuantityController.text) ?? 1;
    final unitPrice = double.tryParse(_itemPriceController.text) ?? 0.0;
    final total = quantity * unitPrice;

    if (description.isNotEmpty && unitPrice > 0) {
      setState(() {
        _items.add(InvoiceItem(
          description: description,
          quantity: quantity,
          unitPrice: unitPrice,
          total: total,
        ));
        _itemDescriptionController.clear();
        _itemQuantityController.clear();
        _itemPriceController.clear();
      });
    }
  }

  void _removeItem(int index) {
    setState(() {
      _items.removeAt(index);
    });
  }

  double _calculateSubtotal() {
    return _items.fold(0.0, (sum, item) => sum + item.total);
  }

  double _calculateTax() {
    return _calculateSubtotal() * (_taxRate / 100);
  }

  double _calculateTotal() {
    return _calculateSubtotal() + _calculateTax();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate() ||
        _selectedPatientId == null ||
        _invoiceDate == null ||
        _dueDate == null ||
        _items.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill all required fields')),
      );
      return;
    }

    final patientProvider = Provider.of<PatientProvider>(context, listen: false);
    final patient = patientProvider.getPatientById(_selectedPatientId!);
    if (patient == null) return;

    final now = DateTime.now();
    final invoice = Invoice(
      id: const Uuid().v4(),
      patientId: _selectedPatientId!,
      patientName: patient.name,
      treatmentId: _selectedTreatmentId,
      invoiceDate: _invoiceDate!,
      dueDate: _dueDate!,
      items: _items,
      subtotal: _calculateSubtotal(),
      tax: _calculateTax(),
      total: _calculateTotal(),
      status: _status,
      paymentMethod: _paymentMethod,
      paidDate: _status == 'paid' ? DateTime.now() : null,
      createdAt: now,
      updatedAt: now,
    );

    final provider = Provider.of<InvoiceProvider>(context, listen: false);
    final success = await provider.addInvoice(invoice);

    if (success && mounted) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Invoice created')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final patientProvider = Provider.of<PatientProvider>(context);
    final treatmentProvider = Provider.of<TreatmentProvider>(context);
    final patients = patientProvider.patients;
    final treatments = treatmentProvider.treatments
        .where((t) => _selectedPatientId == null || t.patientId == _selectedPatientId)
        .toList();

    return Scaffold(
      appBar: AppBar(title: const Text('Create Invoice')),
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
                  _selectedTreatmentId = null;
                });
              },
              validator: (value) => value == null ? 'Please select patient' : null,
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: _selectedTreatmentId,
              decoration: const InputDecoration(
                labelText: 'Treatment (Optional)',
                border: OutlineInputBorder(),
              ),
              items: treatments.map((t) {
                return DropdownMenuItem(
                  value: t.id,
                  child: Text('${t.treatmentType} - \$${t.cost.toStringAsFixed(2)}'),
                );
              }).toList(),
              onChanged: (value) => setState(() => _selectedTreatmentId = value),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: InkWell(
                    onTap: () async {
                      final picked = await showDatePicker(
                        context: context,
                        initialDate: _invoiceDate ?? DateTime.now(),
                        firstDate: DateTime(2020),
                        lastDate: DateTime.now(),
                      );
                      if (picked != null) {
                        setState(() => _invoiceDate = picked);
                      }
                    },
                    child: InputDecorator(
                      decoration: const InputDecoration(
                        labelText: 'Invoice Date *',
                        border: OutlineInputBorder(),
                      ),
                      child: Text(
                        _invoiceDate == null
                            ? 'Select date'
                            : DateFormat('yyyy-MM-dd').format(_invoiceDate!),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: InkWell(
                    onTap: () async {
                      final picked = await showDatePicker(
                        context: context,
                        initialDate: _dueDate ?? DateTime.now(),
                        firstDate: DateTime.now(),
                        lastDate: DateTime.now().add(const Duration(days: 365)),
                      );
                      if (picked != null) {
                        setState(() => _dueDate = picked);
                      }
                    },
                    child: InputDecorator(
                      decoration: const InputDecoration(
                        labelText: 'Due Date *',
                        border: OutlineInputBorder(),
                      ),
                      child: Text(
                        _dueDate == null
                            ? 'Select date'
                            : DateFormat('yyyy-MM-dd').format(_dueDate!),
                      ),
                    ),
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
              items: ['pending', 'paid', 'overdue', 'cancelled']
                  .map((s) => DropdownMenuItem(value: s, child: Text(s.toUpperCase())))
                  .toList(),
              onChanged: (value) => setState(() => _status = value!),
            ),
            if (_status == 'paid') ...[
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _paymentMethod,
                decoration: const InputDecoration(
                  labelText: 'Payment Method',
                  border: OutlineInputBorder(),
                ),
                items: ['Cash', 'Card', 'Bank Transfer', 'Check']
                    .map((m) => DropdownMenuItem(value: m, child: Text(m)))
                    .toList(),
                onChanged: (value) => setState(() => _paymentMethod = value),
              ),
            ],
            const SizedBox(height: 24),
            const Text('Invoice Items', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  flex: 3,
                  child: TextFormField(
                    controller: _itemDescriptionController,
                    decoration: const InputDecoration(
                      labelText: 'Description',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: TextFormField(
                    controller: _itemQuantityController,
                    decoration: const InputDecoration(
                      labelText: 'Qty',
                      border: OutlineInputBorder(),
                    ),
                    keyboardType: TextInputType.number,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: TextFormField(
                    controller: _itemPriceController,
                    decoration: const InputDecoration(
                      labelText: 'Price',
                      border: OutlineInputBorder(),
                      prefixText: '\$',
                    ),
                    keyboardType: TextInputType.number,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.add),
                  onPressed: _addItem,
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (_items.isNotEmpty) ...[
              Card(
                child: Column(
                  children: _items.asMap().entries.map((entry) {
                    final index = entry.key;
                    final item = entry.value;
                    return ListTile(
                      title: Text(item.description),
                      subtitle: Text('${item.quantity} x \$${item.unitPrice.toStringAsFixed(2)}'),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text('\$${item.total.toStringAsFixed(2)}'),
                          IconButton(
                            icon: const Icon(Icons.delete, color: Colors.red),
                            onPressed: () => _removeItem(index),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(height: 16),
            ],
            TextFormField(
              decoration: const InputDecoration(
                labelText: 'Tax Rate (%)',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.number,
              onChanged: (value) {
                setState(() {
                  _taxRate = double.tryParse(value) ?? 0.0;
                });
              },
            ),
            const SizedBox(height: 24),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Subtotal:'),
                        Text('\$${_calculateSubtotal().toStringAsFixed(2)}'),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Tax (${_taxRate.toStringAsFixed(1)}%):'),
                        Text('\$${_calculateTax().toStringAsFixed(2)}'),
                      ],
                    ),
                    const Divider(),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Total:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                        Text(
                          '\$${_calculateTotal().toStringAsFixed(2)}',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _save,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text('Create Invoice'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
