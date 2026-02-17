import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Patient from '@/models/Patient'
import Appointment from '@/models/Appointment'

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

    const stats = {
      patientCount,
      appointmentCount,
      todayAppointments,
      totalRevenue: 0.0,
      totalExpenses: 0.0,
      profit: 0.0,
    }

    return NextResponse.json(stats)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
