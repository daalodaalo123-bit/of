const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');

// GET all appointments
router.get('/', async (req, res) => {
  try {
    const { date } = req.query;
    
    let query = {};
    if (date) {
      // Filter by date (YYYY-MM-DD format)
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query.appointmentDate = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }

    const appointments = await Appointment.find(query)
      .sort({ appointmentDate: 1, timeSlot: 1 });
    
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET appointment by ID
router.get('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ id: req.params.id });
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new appointment
router.post('/', async (req, res) => {
  try {
    const appointmentData = req.body;
    
    // Check if appointment with same ID exists
    const existingAppointment = await Appointment.findOne({ id: appointmentData.id });
    if (existingAppointment) {
      return res.status(400).json({ error: 'Appointment with this ID already exists' });
    }

    const appointment = new Appointment(appointmentData);
    await appointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// PUT update appointment
router.put('/:id', async (req, res) => {
  try {
    const appointmentData = req.body;
    appointmentData.updatedAt = new Date();

    const appointment = await Appointment.findOneAndUpdate(
      { id: req.params.id },
      appointmentData,
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// DELETE appointment
router.delete('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndDelete({ id: req.params.id });
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({ message: 'Appointment deleted successfully', appointment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
