import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:intl/intl.dart';
import '../providers/appointment_provider.dart';
import '../providers/patient_provider.dart';
import 'appointment_form_screen.dart';

class AppointmentsScreen extends StatefulWidget {
  const AppointmentsScreen({super.key});

  @override
  State<AppointmentsScreen> createState() => _AppointmentsScreenState();
}

class _AppointmentsScreenState extends State<AppointmentsScreen> {
  DateTime _focusedDay = DateTime.now();
  DateTime _selectedDay = DateTime.now();
  CalendarFormat _calendarFormat = CalendarFormat.month;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<AppointmentProvider>(context, listen: false).loadAppointments();
      Provider.of<PatientProvider>(context, listen: false).loadPatients();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Card(
          margin: const EdgeInsets.all(8),
          child: TableCalendar(
            firstDay: DateTime.utc(2020, 1, 1),
            lastDay: DateTime.utc(2030, 12, 31),
            focusedDay: _focusedDay,
            selectedDayPredicate: (day) => isSameDay(_selectedDay, day),
            calendarFormat: _calendarFormat,
            onFormatChanged: (format) {
              setState(() => _calendarFormat = format);
            },
            onDaySelected: (selectedDay, focusedDay) {
              setState(() {
                _selectedDay = selectedDay;
                _focusedDay = focusedDay;
              });
            },
            eventLoader: (day) {
              return Provider.of<AppointmentProvider>(context)
                  .appointments
                  .where((apt) => isSameDay(apt.appointmentDate, day))
                  .toList();
            },
            calendarStyle: const CalendarStyle(
              todayDecoration: BoxDecoration(
                color: Colors.blue,
                shape: BoxShape.circle,
              ),
              selectedDecoration: BoxDecoration(
                color: Colors.green,
                shape: BoxShape.circle,
              ),
              markerDecoration: BoxDecoration(
                color: Colors.orange,
                shape: BoxShape.circle,
              ),
            ),
          ),
        ),
        Expanded(
          child: Consumer<AppointmentProvider>(
            builder: (context, provider, _) {
              final appointments = provider.appointments.where((apt) {
                return isSameDay(apt.appointmentDate, _selectedDay);
              }).toList();

              if (appointments.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.calendar_today_outlined, size: 64, color: Colors.grey.shade400),
                      const SizedBox(height: 16),
                      Text(
                        'No appointments on ${DateFormat('MMM dd, yyyy').format(_selectedDay)}',
                        style: TextStyle(color: Colors.grey.shade600),
                      ),
                    ],
                  ),
                );
              }

              return ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: appointments.length,
                itemBuilder: (context, index) {
                  final apt = appointments[index];
                  return Card(
                    margin: const EdgeInsets.only(bottom: 8),
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor: Colors.blue.shade100,
                        child: Icon(Icons.person, color: Colors.blue.shade700),
                      ),
                      title: Text(apt.patientName),
                      subtitle: Text('${DateFormat('h:mm a').format(apt.appointmentDate)} - ${apt.timeSlot}'),
                      trailing: PopupMenuButton(
                        itemBuilder: (context) => [
                          const PopupMenuItem(
                            value: 'edit',
                            child: Row(
                              children: [
                                Icon(Icons.edit),
                                SizedBox(width: 8),
                                Text('Edit'),
                              ],
                            ),
                          ),
                          const PopupMenuItem(
                            value: 'delete',
                            child: Row(
                              children: [
                                Icon(Icons.delete, color: Colors.red),
                                SizedBox(width: 8),
                                Text('Delete', style: TextStyle(color: Colors.red)),
                              ],
                            ),
                          ),
                        ],
                        onSelected: (value) async {
                          if (value == 'edit') {
                            // Navigate to edit form
                          } else if (value == 'delete') {
                            final confirm = await showDialog<bool>(
                              context: context,
                              builder: (context) => AlertDialog(
                                title: const Text('Delete Appointment'),
                                content: const Text('Are you sure you want to delete this appointment?'),
                                actions: [
                                  TextButton(
                                    onPressed: () => Navigator.pop(context, false),
                                    child: const Text('Cancel'),
                                  ),
                                  TextButton(
                                    onPressed: () => Navigator.pop(context, true),
                                    child: const Text('Delete', style: TextStyle(color: Colors.red)),
                                  ),
                                ],
                              ),
                            );
                            if (confirm == true) {
                              await provider.deleteAppointment(apt.id);
                              if (mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Appointment deleted')),
                                );
                              }
                            }
                          }
                        },
                      ),
                    ),
                  );
                },
              );
            },
          ),
        ),
      ],
    );
  }
}

bool isSameDay(DateTime a, DateTime b) {
  return a.year == b.year && a.month == b.month && a.day == b.day;
}
