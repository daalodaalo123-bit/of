const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');

// GET all patients
router.get('/', async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET patient by ID
router.get('/:id', async (req, res) => {
  try {
    const patient = await Patient.findOne({ id: req.params.id });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new patient
router.post('/', async (req, res) => {
  try {
    const patientData = req.body;
    
    // Check if patient with same ID exists
    const existingPatient = await Patient.findOne({ id: patientData.id });
    if (existingPatient) {
      return res.status(400).json({ error: 'Patient with this ID already exists' });
    }

    const patient = new Patient(patientData);
    await patient.save();
    res.status(201).json(patient);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// PUT update patient
router.put('/:id', async (req, res) => {
  try {
    const patientData = req.body;
    patientData.updatedAt = new Date();

    const patient = await Patient.findOneAndUpdate(
      { id: req.params.id },
      patientData,
      { new: true, runValidators: true }
    );

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json(patient);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// DELETE patient
router.delete('/:id', async (req, res) => {
  try {
    const patient = await Patient.findOneAndDelete({ id: req.params.id });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json({ message: 'Patient deleted successfully', patient });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
