import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/dashboard_provider.dart';
import '../providers/appointment_provider.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: () async {
        await Provider.of<DashboardProvider>(context, listen: false).loadStats();
        await Provider.of<AppointmentProvider>(context, listen: false).loadAppointments();
      },
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Dashboard Overview',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 24),
            Consumer<DashboardProvider>(
              builder: (context, provider, _) {
                if (provider.isLoading) {
                  return const Center(child: CircularProgressIndicator());
                }
                
                final stats = provider.stats;
                return Column(
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: _StatCard(
                            title: 'Total Patients',
                            value: '${stats['patientCount'] ?? 0}',
                            icon: Icons.people,
                            color: Colors.blue,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: _StatCard(
                            title: 'Scheduled Appointments',
                            value: '${stats['appointmentCount'] ?? 0}',
                            icon: Icons.calendar_today,
                            color: Colors.green,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: _StatCard(
                            title: 'Today\'s Appointments',
                            value: '${stats['todayAppointments'] ?? 0}',
                            icon: Icons.today,
                            color: Colors.orange,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: _StatCard(
                            title: 'Total Revenue',
                            value: '\$${NumberFormat('#,##0.00').format(stats['totalRevenue'] ?? 0)}',
                            icon: Icons.attach_money,
                            color: Colors.purple,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: _StatCard(
                            title: 'Total Expenses',
                            value: '\$${NumberFormat('#,##0.00').format(stats['totalExpenses'] ?? 0)}',
                            icon: Icons.money_off,
                            color: Colors.red,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: _StatCard(
                            title: 'Net Profit',
                            value: '\$${NumberFormat('#,##0.00').format(stats['profit'] ?? 0)}',
                            icon: Icons.trending_up,
                            color: stats['profit'] != null && stats['profit'] >= 0 ? Colors.green : Colors.red,
                          ),
                        ),
                      ],
                    ),
                  ],
                );
              },
            ),
            const SizedBox(height: 32),
            const Text(
              'Today\'s Appointments',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Consumer<AppointmentProvider>(
              builder: (context, provider, _) {
                if (provider.isLoading) {
                  return const Center(child: CircularProgressIndicator());
                }
                
                final today = DateTime.now();
                final todayAppointments = provider.appointments.where((apt) {
                  return apt.appointmentDate.year == today.year &&
                      apt.appointmentDate.month == today.month &&
                      apt.appointmentDate.day == today.day &&
                      apt.status == 'scheduled';
                }).toList();
                
                if (todayAppointments.isEmpty) {
                  return const Card(
                    child: Padding(
                      padding: EdgeInsets.all(24),
                      child: Center(child: Text('No appointments scheduled for today')),
                    ),
                  );
                }
                
                return ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: todayAppointments.length,
                  itemBuilder: (context, index) {
                    final apt = todayAppointments[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 8),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: Colors.blue.shade100,
                          child: Icon(Icons.person, color: Colors.blue.shade700),
                        ),
                        title: Text(apt.patientName),
                        subtitle: Text('${DateFormat('h:mm a').format(apt.appointmentDate)} - ${apt.timeSlot}'),
                        trailing: Chip(
                          label: Text(apt.status),
                          backgroundColor: _getStatusColor(apt.status),
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ],
        ),
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

class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;

  const _StatCard({
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Icon(icon, color: color, size: 32),
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: color,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              title,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey.shade600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
