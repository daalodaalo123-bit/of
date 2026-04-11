import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../lib/mongodb'
import Appointment from '../../../models/Appointment'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    let query: any = {}
    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      query.appointmentDate = {
        $gte: startOfDay,
        $lte: endOfDay,
      }
    }

    const appointments = await Appointment.find(query)
      .sort({ appointmentDate: 1, timeSlot: 1 })

    return NextResponse.json(appointments)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()

    const existingAppointment = await Appointment.findOne({ id: body.id })
    if (existingAppointment) {
      return NextResponse.json({ error: 'Appointment with this ID already exists' }, { status: 400 })
    }

    const appointment = new Appointment(body)
    await appointment.save()

    return NextResponse.json(appointment, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
