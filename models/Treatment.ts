import mongoose, { Schema, Document } from 'mongoose';

export interface ITreatment extends Document {
  patientId: string;
  patientName: string;
  title: string;
  notes?: string;
  beforeImages: string[];
  afterImages: string[];
  date: Date;
  createdAt: Date;
}

const TreatmentSchema: Schema = new Schema({
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  title: { type: String, required: true },
  notes: { type: String, default: '' },
  beforeImages: [{ type: String }],
  afterImages: [{ type: String }],
  date: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

TreatmentSchema.index({ patientId: 1 });

export default mongoose.models.Treatment || mongoose.model<ITreatment>('Treatment', TreatmentSchema);
