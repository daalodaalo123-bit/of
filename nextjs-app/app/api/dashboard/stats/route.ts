import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Patient from '@/models/Patient'
import Appointment from '@/models/Appointment'
import Payment from '@/models/Payment'
import Expense from '@/models/Expense'

export async function GET() {
  try {
    await connectDB()

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const patientCount = await Patient.countDocuments()
    const appointmentCount = await Appointment.countDocuments({ status: 'scheduled' })
    const todayAppointments = await Appointment.countDocuments({
      appointmentDate: {
        $gte: today,
        $lt: tomorrow,
      },
      status: 'scheduled',
    })

    const payments = await Payment.find({}).lean()
    const totalRevenue = payments.reduce((sum: number, p: any) => sum + (p.amountPaid || 0), 0)

    const expenses = await Expense.find({}).lean()
    const totalExpenses = expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0)

    const stats = {
      patientCount,
      appointmentCount,
      todayAppointments,
      totalRevenue,
      totalExpenses,
      profit: totalRevenue - totalExpenses,
    }

    return NextResponse.json(stats)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
