import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/user_provider.dart';
import 'users_screen.dart';
import '../services/sms_service.dart';
import '../services/export_service.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final userProvider = Provider.of<UserProvider>(context);
    final currentUser = userProvider.currentUser;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          child: ListTile(
            leading: const Icon(Icons.person),
            title: const Text('Current User'),
            subtitle: Text('${currentUser?.fullName} (${currentUser?.role})'),
          ),
        ),
        const SizedBox(height: 16),
        if (currentUser?.role == 'admin') ...[
          Card(
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.people),
                  title: const Text('User Management'),
                  subtitle: const Text('Manage users, roles, and permissions'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const UsersScreen()),
                    );
                  },
                ),
                const Divider(),
                ListTile(
                  leading: const Icon(Icons.sms),
                  title: const Text('SMS Reminder Settings'),
                  subtitle: const Text('Configure SMS reminders for appointments'),
                  trailing: Switch(
                    value: SMSService().isEnabled(),
                    onChanged: (value) {
                      SMSService().setEnabled(value);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text(value ? 'SMS reminders enabled' : 'SMS reminders disabled')),
                      );
                    },
                  ),
                ),
                const Divider(),
                ListTile(
                  leading: const Icon(Icons.backup),
                  title: const Text('Backup & Export'),
                  subtitle: const Text('Export data and create backups'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () async {
                    final exportService = ExportService();
                    final success = await exportService.exportAllData();
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(success
                              ? 'Data exported successfully'
                              : 'Export failed'),
                        ),
                      );
                    }
                  },
                ),
              ],
            ),
          ),
        ],
        const SizedBox(height: 16),
        Card(
          child: ListTile(
            leading: const Icon(Icons.info),
            title: const Text('About'),
            subtitle: const Text('Healthcare Management System v1.0.0'),
          ),
        ),
      ],
    );
  }
}
