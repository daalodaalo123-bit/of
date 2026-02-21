import mongoose, { Schema, Document } from 'mongoose'

export type ExpenseCategory = 'supplies' | 'rent' | 'salaries' | 'utilities' | 'equipment' | 'other'

export interface IExpense extends Document {
  id: string
  amount: number
  category: ExpenseCategory
  description?: string
  expenseDate: Date
  createdAt: Date
  updatedAt: Date
}

const ExpenseSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  amount: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, enum: ['supplies', 'rent', 'salaries', 'utilities', 'equipment', 'other'] },
  description: { type: String, default: null },
  expenseDate: { type: Date, required: true, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, {
  timestamps: false,
})

ExpenseSchema.pre('save', function (next) {
  ;(this as any).updatedAt = new Date()
  next()
})

ExpenseSchema.index({ expenseDate: -1 })
ExpenseSchema.index({ category: 1 })

export default mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema)
