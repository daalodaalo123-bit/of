import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctor extends Document {
  id: string;
  name: string;
  email?: string;
  phone: string;
  specialization?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: false, default: null },
  phone: { type: String, required: true },
  specialization: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, {
  timestamps: false,
});

DoctorSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

DoctorSchema.index({ name: 1 });
DoctorSchema.index({ email: 1 });

export default mongoose.models.Doctor || mongoose.model<IDoctor>('Doctor', DoctorSchema);
