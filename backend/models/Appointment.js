const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  patientId: {
    type: String,
    required: true,
    ref: 'Patient'
  },
  patientName: {
    type: String,
    required: true
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  timeSlot: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['scheduled', 'completed', 'cancelled', 'no_show'],
    default: 'scheduled'
  },
  notes: {
    type: String,
    default: null
  },
  treatmentType: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false // We're handling timestamps manually
});

// Update updatedAt before saving
appointmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for faster queries
appointmentSchema.index({ patientId: 1 });
appointmentSchema.index({ appointmentDate: 1 });
appointmentSchema.index({ status: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
