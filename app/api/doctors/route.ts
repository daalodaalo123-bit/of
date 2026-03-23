import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../lib/mongodb'
import Doctor from '../../../models/Doctor'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await connectDB()
    const doctors = await Doctor.find().sort({ name: 1 })
    return NextResponse.json(doctors)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()

    if (!body.name || !body.phone) {
      return NextResponse.json({ error: 'Missing required fields (name, phone)' }, { status: 400 })
    }

    const orConditions: { id?: string; email?: string }[] = [{ id: body.id }]
    if (body.email && body.email.trim()) {
      orConditions.push({ email: body.email.trim() })
    }

    const existingDoctor = await Doctor.findOne({ 
      $or: orConditions
    })
    
    if (existingDoctor) {
      return NextResponse.json({ 
        error: existingDoctor.email === body.email 
          ? 'Doctor with this email already exists' 
          : 'Doctor with this ID already exists' 
      }, { status: 400 })
    }

    const doctorData = {
      ...body,
      email: body.email?.trim() || null,
      id: body.id || `doctor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const doctor = new Doctor(doctorData)
    await doctor.save()
    
    return NextResponse.json(doctor, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
