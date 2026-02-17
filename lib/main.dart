import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/patient_provider.dart';
import 'providers/appointment_provider.dart';
import 'providers/dashboard_provider.dart';
import 'providers/user_provider.dart';
import 'screens/login_screen.dart';
import 'screens/home_screen.dart';

void main() {
  runApp(const HealthcareApp());
}

class HealthcareApp extends StatelessWidget {
  const HealthcareApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => UserProvider()),
        ChangeNotifierProvider(create: (_) => PatientProvider()),
        ChangeNotifierProvider(create: (_) => AppointmentProvider()),
        ChangeNotifierProvider(create: (_) => DashboardProvider()),
      ],
      child: MaterialApp(
        title: 'Healthcare Management',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          primarySwatch: Colors.blue,
          useMaterial3: true,
          colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        ),
        home: const AuthWrapper(),
      ),
    );
  }
}

class AuthWrapper extends StatelessWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    final userProvider = Provider.of<UserProvider>(context);
    
    if (userProvider.currentUser == null) {
      return const LoginScreen();
    }
    
    return const HomeScreen();
  }
}
