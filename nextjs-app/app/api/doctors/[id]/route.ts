import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../lib/mongodb'
import Doctor from '../../../../models/Doctor'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const doctor = await Doctor.findOne({ id: params.id })
    
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }
    
    return NextResponse.json(doctor)
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

    const doctor = await Doctor.findOneAndUpdate(
      { id: params.id },
      body,
      { new: true, runValidators: true }
    )

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    return NextResponse.json(doctor)
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
    const doctor = await Doctor.findOneAndDelete({ id: params.id })

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Doctor deleted successfully', doctor })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
