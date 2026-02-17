import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:fl_chart/fl_chart.dart';
import '../providers/dashboard_provider.dart';
import '../providers/invoice_provider.dart';
import '../providers/expense_provider.dart';
import '../services/database_service.dart';

class ReportsScreen extends StatefulWidget {
  const ReportsScreen({super.key});

  @override
  State<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends State<ReportsScreen> {
  String _selectedReport = 'Financial Overview';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<DashboardProvider>(context, listen: false).loadStats();
      Provider.of<InvoiceProvider>(context, listen: false).loadInvoices();
      Provider.of<ExpenseProvider>(context, listen: false).loadExpenses();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: DropdownButtonFormField<String>(
            value: _selectedReport,
            decoration: const InputDecoration(
              labelText: 'Select Report',
              border: OutlineInputBorder(),
            ),
            items: [
              'Financial Overview',
              'Revenue by Month',
              'Expenses by Category',
              'Patient Statistics',
            ].map((r) => DropdownMenuItem(value: r, child: Text(r))).toList(),
            onChanged: (value) => setState(() => _selectedReport = value!),
          ),
        ),
        Expanded(
          child: _buildReportContent(),
        ),
      ],
    );
  }

  Widget _buildReportContent() {
    switch (_selectedReport) {
      case 'Financial Overview':
        return _buildFinancialOverview();
      case 'Revenue by Month':
        return _buildRevenueByMonth();
      case 'Expenses by Category':
        return _buildExpensesByCategory();
      case 'Patient Statistics':
        return _buildPatientStatistics();
      default:
        return const Center(child: Text('Select a report'));
    }
  }

  Widget _buildFinancialOverview() {
    return Consumer<DashboardProvider>(
      builder: (context, provider, _) {
        final stats = provider.stats;
        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      _buildStatRow('Total Revenue', stats['totalRevenue'] ?? 0.0, Colors.green),
                      const Divider(),
                      _buildStatRow('Total Expenses', stats['totalExpenses'] ?? 0.0, Colors.red),
                      const Divider(),
                      _buildStatRow('Net Profit', stats['profit'] ?? 0.0,
                          (stats['profit'] ?? 0.0) >= 0 ? Colors.green : Colors.red),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
              const Text('Profit/Loss Chart', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              SizedBox(
                height: 300,
                child: Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: PieChart(
                      PieChartData(
                        sections: [
                          PieChartSectionData(
                            value: stats['totalRevenue'] ?? 0.0,
                            title: 'Revenue',
                            color: Colors.green,
                            radius: 80,
                          ),
                          PieChartSectionData(
                            value: stats['totalExpenses'] ?? 0.0,
                            title: 'Expenses',
                            color: Colors.red,
                            radius: 80,
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildRevenueByMonth() {
    return FutureBuilder<List<Map<String, dynamic>>>(
      future: DatabaseService().getRevenueByMonth(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        if (!snapshot.hasData || snapshot.data!.isEmpty) {
          return const Center(child: Text('No revenue data available'));
        }

        final data = snapshot.data!;
        final maxRevenue = data.map((d) => (d['revenue'] as num).toDouble()).reduce((a, b) => a > b ? a : b);

        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Revenue by Month', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              SizedBox(
                height: 300,
                child: Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: BarChart(
                      BarChartData(
                        alignment: BarChartAlignment.spaceAround,
                        maxY: maxRevenue * 1.2,
                        barGroups: data.asMap().entries.map((entry) {
                          final index = entry.key;
                          final monthData = entry.value;
                          return BarChartGroupData(
                            x: index,
                            barRods: [
                              BarChartRodData(
                                toY: (monthData['revenue'] as num).toDouble(),
                                color: Colors.blue,
                                width: 20,
                              ),
                            ],
                          );
                        }).toList(),
                        titlesData: FlTitlesData(
                          leftTitles: const AxisTitles(
                            sideTitles: SideTitles(showTitles: true),
                          ),
                          bottomTitles: AxisTitles(
                            sideTitles: SideTitles(
                              showTitles: true,
                              getTitlesWidget: (value, meta) {
                                if (value.toInt() < data.length) {
                                  return Text(data[value.toInt()]['month'].toString().substring(5));
                                }
                                return const Text('');
                              },
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              ...data.map((monthData) {
                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    title: Text(monthData['month'].toString()),
                    trailing: Text(
                      '\$${NumberFormat('#,##0.00').format(monthData['revenue'])}',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ),
                );
              }),
            ],
          ),
        );
      },
    );
  }

  Widget _buildExpensesByCategory() {
    return FutureBuilder<List<Map<String, dynamic>>>(
      future: DatabaseService().getExpensesByCategory(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        if (!snapshot.hasData || snapshot.data!.isEmpty) {
          return const Center(child: Text('No expense data available'));
        }

        final data = snapshot.data!;
        final total = data.fold(0.0, (sum, d) => sum + (d['total'] as num).toDouble());

        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Expenses by Category', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              SizedBox(
                height: 300,
                child: Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: PieChart(
                      PieChartData(
                        sections: data.map((catData) {
                          final percentage = ((catData['total'] as num).toDouble() / total) * 100;
                          return PieChartSectionData(
                            value: (catData['total'] as num).toDouble(),
                            title: '${catData['category']}\n${percentage.toStringAsFixed(1)}%',
                            color: _getCategoryColor(catData['category'].toString()),
                            radius: 80,
                          );
                        }).toList(),
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              ...data.map((catData) {
                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: _getCategoryColor(catData['category'].toString()),
                      child: Text(
                        catData['category'].toString()[0],
                        style: const TextStyle(color: Colors.white),
                      ),
                    ),
                    title: Text(catData['category'].toString()),
                    trailing: Text(
                      '\$${NumberFormat('#,##0.00').format(catData['total'])}',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ),
                );
              }),
            ],
          ),
        );
      },
    );
  }

  Widget _buildPatientStatistics() {
    return Consumer<DashboardProvider>(
      builder: (context, provider, _) {
        final stats = provider.stats;
        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      _buildStatRow('Total Patients', stats['patientCount'] ?? 0, Colors.blue),
                      const Divider(),
                      _buildStatRow('Scheduled Appointments', stats['appointmentCount'] ?? 0, Colors.green),
                      const Divider(),
                      _buildStatRow('Today\'s Appointments', stats['todayAppointments'] ?? 0, Colors.orange),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildStatRow(String label, dynamic value, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 16)),
          Text(
            value is double ? '\$${NumberFormat('#,##0.00').format(value)}' : value.toString(),
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: color),
          ),
        ],
      ),
    );
  }

  Color _getCategoryColor(String category) {
    final colors = [
      Colors.blue,
      Colors.green,
      Colors.orange,
      Colors.purple,
      Colors.red,
      Colors.teal,
      Colors.pink,
      Colors.amber,
    ];
    return colors[category.hashCode % colors.length];
  }
}
