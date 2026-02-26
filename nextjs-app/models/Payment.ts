import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentTransaction {
  amount: number;
  createdAt: Date;
  paymentMethod?: string;
  notes?: string;
}

export interface IPayment extends Document {
  id: string;
  patientId: string;
  patientName: string;
  totalAmount: number;
  amountPaid: number;
  remainingBalance: number;
  paymentMethod?: 'zaad' | 'edahab' | 'cash';
  notes?: string;
  transactions?: IPaymentTransaction[];
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  totalAmount: { type: Number, required: true, default: 0 },
  amountPaid: { type: Number, required: true, default: 0 },
  remainingBalance: { type: Number, required: true, default: 0 },
  paymentMethod: { type: String, enum: ['zaad', 'edahab', 'cash'], default: undefined },
  notes: { type: String, default: null },
  transactions: {
    type: [{ amount: Number, createdAt: Date, paymentMethod: String, notes: String }],
    default: undefined,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, {
  timestamps: false,
});

PaymentSchema.pre('save', function(next) {
  const doc = this as any;
  doc.updatedAt = new Date();
  doc.remainingBalance = (doc.totalAmount || 0) - (doc.amountPaid || 0);
  next();
});

PaymentSchema.index({ patientId: 1 });
PaymentSchema.index({ patientName: 1 });

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
