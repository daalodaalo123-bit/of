import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Patient from '@/models/Patient'

export async function GET() {
  try {
    await connectDB()
    const patients = await Patient.find().sort({ createdAt: -1 })
    return NextResponse.json(patients)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()
    
    const existingPatient = await Patient.findOne({ id: body.id })
    if (existingPatient) {
      return NextResponse.json({ error: 'Patient with this ID already exists' }, { status: 400 })
    }

    const patient = new Patient(body)
    await patient.save()
    
    return NextResponse.json(patient, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
