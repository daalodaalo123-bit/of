import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:uuid/uuid.dart';
import 'package:intl/intl.dart';
import '../providers/expense_provider.dart';
import '../models/expense.dart';

class ExpenseFormScreen extends StatefulWidget {
  const ExpenseFormScreen({super.key});

  @override
  State<ExpenseFormScreen> createState() => _ExpenseFormScreenState();
}

class _ExpenseFormScreenState extends State<ExpenseFormScreen> {
  final _formKey = GlobalKey<FormState>();
  String _category = 'Office Supplies';
  final _descriptionController = TextEditingController();
  final _amountController = TextEditingController();
  final _notesController = TextEditingController();
  DateTime? _expenseDate;

  final List<String> _categories = [
    'Office Supplies',
    'Equipment',
    'Utilities',
    'Rent',
    'Salaries',
    'Marketing',
    'Insurance',
    'Other',
  ];

  @override
  void initState() {
    super.initState();
    _expenseDate = DateTime.now();
  }

  @override
  void dispose() {
    _descriptionController.dispose();
    _amountController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate() || _expenseDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill all required fields')),
      );
      return;
    }

    final amount = double.tryParse(_amountController.text) ?? 0.0;
    final now = DateTime.now();

    final expense = Expense(
      id: const Uuid().v4(),
      category: _category,
      description: _descriptionController.text.trim(),
      amount: amount,
      expenseDate: _expenseDate!,
      notes: _notesController.text.trim().isEmpty
          ? null
          : _notesController.text.trim(),
      createdAt: now,
      updatedAt: now,
    );

    final provider = Provider.of<ExpenseProvider>(context, listen: false);
    final success = await provider.addExpense(expense);

    if (success && mounted) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Expense recorded')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Record Expense')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            DropdownButtonFormField<String>(
              value: _category,
              decoration: const InputDecoration(
                labelText: 'Category *',
                border: OutlineInputBorder(),
              ),
              items: _categories.map((cat) {
                return DropdownMenuItem(value: cat, child: Text(cat));
              }).toList(),
              onChanged: (value) => setState(() => _category = value!),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _descriptionController,
              decoration: const InputDecoration(
                labelText: 'Description *',
                border: OutlineInputBorder(),
              ),
              validator: (value) =>
                  value?.isEmpty ?? true ? 'Please enter description' : null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _amountController,
              decoration: const InputDecoration(
                labelText: 'Amount *',
                border: OutlineInputBorder(),
                prefixText: '\$',
              ),
              keyboardType: TextInputType.number,
              validator: (value) {
                if (value?.isEmpty ?? true) return 'Please enter amount';
                if (double.tryParse(value!) == null) return 'Please enter valid number';
                return null;
              },
            ),
            const SizedBox(height: 16),
            InkWell(
              onTap: () async {
                final picked = await showDatePicker(
                  context: context,
                  initialDate: _expenseDate ?? DateTime.now(),
                  firstDate: DateTime(2020),
                  lastDate: DateTime.now(),
                );
                if (picked != null) {
                  setState(() => _expenseDate = picked);
                }
              },
              child: InputDecorator(
                decoration: const InputDecoration(
                  labelText: 'Date *',
                  border: OutlineInputBorder(),
                ),
                child: Text(
                  _expenseDate == null
                      ? 'Select date'
                      : DateFormat('yyyy-MM-dd').format(_expenseDate!),
                ),
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
