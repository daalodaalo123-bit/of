import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Patient from '@/models/Patient'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('🔍 Connecting to MongoDB...')
    const conn = await connectDB()
    console.log('✅ MongoDB connected, database:', conn.connection.db?.databaseName)
    
    console.log('🔍 Fetching patients...')
    const patients = await Patient.find().sort({ createdAt: -1 })
    console.log(`✅ Found ${patients.length} patients`)
    
    return NextResponse.json(patients)
  } catch (error: any) {
    console.error('❌ Error in GET /api/patients:', error)
    return NextResponse.json({ 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST /api/patients - Connecting to MongoDB...')
    const conn = await connectDB()
    console.log('✅ MongoDB connected, database:', conn.connection.db?.databaseName)
    
    const body = await request.json()
    console.log('📝 Received patient data:', { name: body.name, email: body.email })
    
    // Validate required fields
    if (!body.name || !body.email || !body.phone || !body.dateOfBirth || !body.gender || !body.address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check for existing patient by email or id
    const existingPatient = await Patient.findOne({ 
      $or: [
        { id: body.id },
        { email: body.email }
      ]
    })
    
    if (existingPatient) {
      return NextResponse.json({ 
        error: existingPatient.id === body.id 
          ? 'Patient with this ID already exists' 
          : 'Patient with this email already exists' 
      }, { status: 400 })
    }

    // Ensure dateOfBirth is a Date object
    const patientData = {
      ...body,
      dateOfBirth: new Date(body.dateOfBirth),
      createdAt: body.createdAt ? new Date(body.createdAt) : new Date(),
      updatedAt: new Date(),
    }

    const patient = new Patient(patientData)
    await patient.save()
    
    return NextResponse.json(patient, { status: 201 })
  } catch (error: any) {
    console.error('Error creating patient:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to create patient',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}
