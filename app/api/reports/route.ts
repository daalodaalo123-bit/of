import { NextResponse } from 'next/server'
import connectDB from '../../../lib/mongodb'
import Patient from '../../../models/Patient'
import Appointment from '../../../models/Appointment'
import Payment from '../../../models/Payment'
import Expense from '../../../models/Expense'

export const dynamic = 'force-dynamic'

const CATEGORY_LABELS: Record<string, string> = {
  supplies: 'Supplies',
  rent: 'Rent',
  salaries: 'Salaries',
  utilities: 'Utilities',
  equipment: 'Equipment',
  other: 'Other',
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  zaad: 'Zaad',
  edahab: 'Edahab',
  cash: 'Cash',
  other: 'Other',
}

export async function GET() {
  try {
    await connectDB()

    const now = new Date()
    const sixMonthsAgo = new Date(now)
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    sixMonthsAgo.setDate(1)
    sixMonthsAgo.setHours(0, 0, 0, 0)

    const [patients, appointments, payments, expenses] = await Promise.all([
      Patient.find({}).lean(),
      Appointment.find({}).lean(),
      Payment.find({ createdAt: { $gte: sixMonthsAgo } }).lean(),
      Expense.find({}).lean(),
    ])

    // Revenue by month (last 6 months)
    const revenueByMonth: { month: string; revenue: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now)
      d.setMonth(d.getMonth() - i)
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1)
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
      const monthPayments = (payments as any[]).filter(
        (p: any) => new Date(p.createdAt) >= monthStart && new Date(p.createdAt) <= monthEnd
      )
      const revenue = monthPayments.reduce((sum: number, p: any) => sum + (p.amountPaid || 0), 0)
      revenueByMonth.push({
        month: monthStart.toLocaleString('default', { month: 'short', year: '2-digit' }),
        revenue,
      })
    }

    // Expense by category
    const expensesByCategory: { category: string; label: string; amount: number }[] = []
    const categoryTotals: Record<string, number> = {}
    for (const e of expenses as any[]) {
      const cat = e.category || 'other'
      categoryTotals[cat] = (categoryTotals[cat] || 0) + (e.amount || 0)
    }
    for (const cat of ['supplies', 'rent', 'salaries', 'utilities', 'equipment', 'other']) {
      expensesByCategory.push({
        category: cat,
        label: CATEGORY_LABELS[cat] || cat,
        amount: categoryTotals[cat] || 0,
      })
    }

    // Payment methods
    const allPayments = await Payment.find({}).lean()
    const paymentMethods: { method: string; label: string; count: number; amount: number }[] = []
    const pmTotals: Record<string, { count: number; amount: number }> = {
      zaad: { count: 0, amount: 0 },
      edahab: { count: 0, amount: 0 },
      cash: { count: 0, amount: 0 },
      other: { count: 0, amount: 0 },
    }
    for (const p of allPayments) {
      const pm = (p as any).paymentMethod || 'other'
      const key = pm === 'zaad' || pm === 'edahab' || pm === 'cash' || pm === 'premier_bank' ? (pm === 'premier_bank' ? 'cash' : pm) : 'other'
      pmTotals[key].count++
      pmTotals[key].amount += (p as any).amountPaid || 0
    }
    for (const key of ['zaad', 'edahab', 'cash', 'other']) {
      paymentMethods.push({
        method: key,
        label: PAYMENT_METHOD_LABELS[key] || key,
        count: pmTotals[key].count,
        amount: pmTotals[key].amount,
      })
    }

    // Appointments by status
    const appointmentsByStatus = { scheduled: 0, completed: 0, cancelled: 0, no_show: 0 }
    for (const a of appointments) {
      const s = (a as any).status || 'scheduled'
      if (s in appointmentsByStatus) (appointmentsByStatus as any)[s]++
    }

    const totalRevenue = (allPayments as any[]).reduce((s: number, p: any) => s + (p.amountPaid || 0), 0)
    const totalExpenses = (expenses as any[]).reduce((s: number, e: any) => s + (e.amount || 0), 0)

    return NextResponse.json({
      financialOverview: {
        totalRevenue,
        totalExpenses,
        profit: totalRevenue - totalExpenses,
      },
      revenueByMonth,
      expensesByCategory,
      paymentMethods,
      appointmentsByStatus,
      patientStats: {
        total: patients.length,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
