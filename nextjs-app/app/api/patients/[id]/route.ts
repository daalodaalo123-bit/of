import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Patient from '@/models/Patient'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const patient = await Patient.findOne({ id: params.id })
    
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }
    
    return NextResponse.json(patient)
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

    const patient = await Patient.findOneAndUpdate(
      { id: params.id },
      body,
      { new: true, runValidators: true }
    )

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    return NextResponse.json(patient)
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
    const patient = await Patient.findOneAndDelete({ id: params.id })

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Patient deleted successfully', patient })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
