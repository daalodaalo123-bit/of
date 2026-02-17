const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');

// GET dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Count total patients
    const patientCount = await Patient.countDocuments();

    // Count scheduled appointments
    const appointmentCount = await Appointment.countDocuments({ status: 'scheduled' });

    // Count today's appointments
    const todayAppointments = await Appointment.countDocuments({
      appointmentDate: {
        $gte: today,
        $lt: tomorrow
      },
      status: 'scheduled'
    });

    // For Phase 1, revenue/expenses are 0 (will be added in Phase 2)
    const stats = {
      patientCount,
      appointmentCount,
      todayAppointments,
      totalRevenue: 0.0,
      totalExpenses: 0.0,
      profit: 0.0
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
