const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other']
  },
  address: {
    type: String,
    required: true
  },
  medicalHistory: {
    type: String,
    default: null
  },
  allergies: {
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
patientSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
patientSchema.index({ email: 1 });
patientSchema.index({ name: 1 });

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
