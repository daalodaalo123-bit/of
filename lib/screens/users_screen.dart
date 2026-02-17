import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:uuid/uuid.dart';
import '../providers/user_provider.dart';
import '../models/user.dart';
import 'user_form_screen.dart';

class UsersScreen extends StatelessWidget {
  const UsersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('User Management')),
      body: Consumer<UserProvider>(
        builder: (context, provider, _) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: provider.users.length,
            itemBuilder: (context, index) {
              final user = provider.users[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: _getRoleColor(user.role),
                    child: Text(
                      user.fullName[0].toUpperCase(),
                      style: const TextStyle(color: Colors.white),
                    ),
                  ),
                  title: Text(user.fullName),
                  subtitle: Text('${user.email} • ${user.role}'),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Chip(
                        label: Text(user.isActive ? 'Active' : 'Inactive'),
                        backgroundColor: user.isActive ? Colors.green.shade100 : Colors.red.shade100,
                      ),
                      IconButton(
                        icon: const Icon(Icons.edit),
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => UserFormScreen(user: user),
                            ),
                          );
                        },
                      ),
                    ],
                  ),
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
            MaterialPageRoute(builder: (_) => const UserFormScreen()),
          );
        },
        child: const Icon(Icons.add),
      ),
    );
  }

  Color _getRoleColor(String role) {
    switch (role) {
      case 'admin':
        return Colors.red;
      case 'doctor':
        return Colors.blue;
      case 'staff':
        return Colors.green;
      default:
        return Colors.grey;
    }
  }
}
