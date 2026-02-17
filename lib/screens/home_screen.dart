import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/dashboard_provider.dart';
import '../providers/user_provider.dart';
import 'dashboard_screen.dart';
import 'patients_screen.dart';
import 'appointments_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  // Phase 1 Screens Only
  final List<Widget> _screens = [
    const DashboardScreen(),
    const PatientsScreen(),
    const AppointmentsScreen(),
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<DashboardProvider>(context, listen: false).loadStats();
    });
  }

  @override
  Widget build(BuildContext context) {
    final userProvider = Provider.of<UserProvider>(context);
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Healthcare Management'),
        actions: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Center(
              child: Text(
                userProvider.currentUser?.fullName ?? '',
                style: const TextStyle(fontSize: 14),
              ),
            ),
          ),
        ],
      ),
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            DrawerHeader(
              decoration: BoxDecoration(color: Colors.blue.shade700),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.local_hospital, size: 48, color: Colors.white),
                  const SizedBox(height: 8),
                  Text(
                    userProvider.currentUser?.fullName ?? '',
                    style: const TextStyle(color: Colors.white, fontSize: 18),
                  ),
                  Text(
                    userProvider.currentUser?.role ?? '',
                    style: const TextStyle(color: Colors.white70, fontSize: 14),
                  ),
                ],
              ),
            ),
            _buildDrawerItem(Icons.dashboard, 'Dashboard', 0),
            _buildDrawerItem(Icons.people, 'Patients', 1),
            _buildDrawerItem(Icons.calendar_today, 'Appointments', 2),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.logout),
              title: const Text('Logout'),
              onTap: () {
                userProvider.logout();
                Navigator.of(context).pop();
              },
            ),
          ],
        ),
      ),
      body: _screens[_selectedIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard), label: 'Dashboard'),
          NavigationDestination(icon: Icon(Icons.people), label: 'Patients'),
          NavigationDestination(icon: Icon(Icons.calendar_today), label: 'Appointments'),
        ],
      ),
    );
  }

  Widget _buildDrawerItem(IconData icon, String title, int index) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      selected: _selectedIndex == index,
      onTap: () {
        setState(() {
          _selectedIndex = index;
        });
        Navigator.of(context).pop();
      },
    );
  }
}
