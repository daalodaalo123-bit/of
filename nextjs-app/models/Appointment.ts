import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  id: string;
  patientId: string;
  patientName: string;
  appointmentDate: Date;
  timeSlot: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  treatmentType?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  appointmentDate: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['scheduled', 'completed', 'cancelled', 'no_show'],
    default: 'scheduled'
  },
  notes: { type: String, default: null },
  treatmentType: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, {
  timestamps: false,
});

AppointmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

AppointmentSchema.index({ patientId: 1 });
AppointmentSchema.index({ appointmentDate: 1 });
AppointmentSchema.index({ status: 1 });

export default mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);
