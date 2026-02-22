import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../lib/mongodb'
import Appointment from '../../../../models/Appointment'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const appointment = await Appointment.findOne({ id: params.id })
    
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }
    
    return NextResponse.json(appointment)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const body = await request.json()
    body.updatedAt = new Date()

    const appointment = await Appointment.findOneAndUpdate(
      { id: params.id },
      body,
      { new: true, runValidators: true }
    )

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    return NextResponse.json(appointment)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const appointment = await Appointment.findOneAndDelete({ id: params.id })

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Appointment deleted successfully', appointment })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
