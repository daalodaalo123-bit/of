import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import '../models/appointment.dart';

class SMSService {
  static final SMSService _instance = SMSService._internal();
  factory SMSService() => _instance;
  SMSService._internal();

  final FlutterLocalNotificationsPlugin _notifications = FlutterLocalNotificationsPlugin();
  bool _initialized = false;

  Future<void> initialize() async {
    if (_initialized) return;

    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings();
    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _notifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: (details) {},
    );

    _initialized = true;
  }

  Future<bool> isEnabled() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool('sms_reminders_enabled') ?? false;
  }

  Future<void> setEnabled(bool enabled) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('sms_reminders_enabled', enabled);
  }

  Future<void> sendAppointmentReminder(Appointment appointment) async {
    final enabled = await isEnabled();
    if (!enabled) return;

    await initialize();

    // Schedule notification as SMS reminder
    final androidDetails = AndroidNotificationDetails(
      'appointment_reminders',
      'Appointment Reminders',
      channelDescription: 'Reminders for upcoming appointments',
      importance: Importance.high,
      priority: Priority.high,
    );

    const iosDetails = DarwinNotificationDetails();

    final notificationDetails = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    // Schedule notification 24 hours before appointment
    final reminderTime = appointment.appointmentDate.subtract(const Duration(hours: 24));
    if (reminderTime.isAfter(DateTime.now())) {
      final delay = reminderTime.difference(DateTime.now());
      await Future.delayed(delay);
      await _notifications.show(
        appointment.id.hashCode,
        'Appointment Reminder',
        'You have an appointment with ${appointment.patientName} on ${appointment.appointmentDate.toString().split(' ')[0]} at ${appointment.timeSlot}',
        notificationDetails,
      );
    }

    // Also schedule a reminder 1 hour before
    final oneHourBefore = appointment.appointmentDate.subtract(const Duration(hours: 1));
    if (oneHourBefore.isAfter(DateTime.now())) {
      final delay = oneHourBefore.difference(DateTime.now());
      await Future.delayed(delay);
      await _notifications.show(
        appointment.id.hashCode + 1,
        'Appointment Reminder',
        'Reminder: Appointment with ${appointment.patientName} in 1 hour',
        notificationDetails,
      );
    }
  }

  Future<void> cancelReminder(String appointmentId) async {
    await _notifications.cancel(appointmentId.hashCode);
    await _notifications.cancel(appointmentId.hashCode + 1);
  }

  Future<void> sendImmediateReminder(Appointment appointment) async {
    final enabled = await isEnabled();
    if (!enabled) return;

    await initialize();

    final androidDetails = AndroidNotificationDetails(
      'appointment_reminders',
      'Appointment Reminders',
      channelDescription: 'Reminders for upcoming appointments',
      importance: Importance.high,
      priority: Priority.high,
    );

    const iosDetails = DarwinNotificationDetails();

    final notificationDetails = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _notifications.show(
      appointment.id.hashCode,
      'Appointment Reminder',
      'You have an appointment with ${appointment.patientName} on ${appointment.appointmentDate.toString().split(' ')[0]} at ${appointment.timeSlot}',
      notificationDetails,
    );
  }
}
