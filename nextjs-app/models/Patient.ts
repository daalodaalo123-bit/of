import mongoose, { Schema, Document } from 'mongoose';

export interface IPatient extends Document {
  id: string;
  name: string;
  email?: string;
  phone: string;
  dateOfBirth?: Date;
  gender: 'Male' | 'Female' | 'Other';
  address: string;
  medicalHistory?: string;
  allergies?: string;
  doctorId?: string;
  doctorName?: string;
  totalDue?: number;
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: false, default: null },
  phone: { type: String, required: true },
  dateOfBirth: { type: Date, required: false, default: null },
  gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
  address: { type: String, required: true },
  medicalHistory: { type: String, default: null },
  allergies: { type: String, default: null },
  doctorId: { type: String, default: null },
  doctorName: { type: String, default: null },
  totalDue: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, {
  timestamps: false,
});

PatientSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

PatientSchema.index({ email: 1 });
PatientSchema.index({ name: 1 });

export default mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema);
