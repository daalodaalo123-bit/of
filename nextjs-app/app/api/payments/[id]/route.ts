import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Payment from '@/models/Payment'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const payment = await Payment.findOne({ id: params.id })
    
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }
    
    return NextResponse.json(payment)
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
    
    const totalAmount = body.totalAmount !== undefined ? Number(body.totalAmount) : undefined
    const amountPaid = body.amountPaid !== undefined ? Number(body.amountPaid) : undefined
    
    if (totalAmount !== undefined && amountPaid !== undefined) {
      body.remainingBalance = totalAmount - amountPaid
    }
    
    body.updatedAt = new Date()

    const payment = await Payment.findOneAndUpdate(
      { id: params.id },
      body,
      { new: true, runValidators: true }
    )

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    return NextResponse.json(payment)
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
    const payment = await Payment.findOneAndDelete({ id: params.id })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Payment deleted successfully', payment })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
