import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Payment from '@/models/Payment'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    let query = {}
    if (search && search.trim()) {
      query = { patientName: { $regex: search.trim(), $options: 'i' } }
    }

    const payments = await Payment.find(query).sort({ createdAt: -1 })
    return NextResponse.json(payments)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()

    if (!body.patientId || !body.patientName) {
      return NextResponse.json({ error: 'Missing required fields (patientId, patientName)' }, { status: 400 })
    }

    const totalAmount = Number(body.totalAmount) || 0
    const amountPaid = Number(body.amountPaid) || 0
    const remainingBalance = totalAmount - amountPaid

    const paymentData = {
      ...body,
      id: body.id || `payment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      totalAmount,
      amountPaid,
      remainingBalance,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const payment = new Payment(paymentData)
    await payment.save()
    
    return NextResponse.json(payment, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
