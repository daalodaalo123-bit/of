import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../lib/mongodb'
import Payment from '../../../../models/Payment'

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const body = await request.json()
    const transactionIndex = body.removeTransactionIndex

    if (typeof transactionIndex !== 'number' || transactionIndex < 0) {
      return NextResponse.json({ error: 'removeTransactionIndex required' }, { status: 400 })
    }

    const payment = await Payment.findOne({ id: params.id })
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    const doc = payment as any
    const transactions = Array.isArray(doc.transactions) ? [...doc.transactions] : []
    if (transactionIndex >= transactions.length) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    transactions.splice(transactionIndex, 1)
    if (transactions.length === 0) {
      await Payment.findOneAndDelete({ id: params.id })
      return NextResponse.json({ message: 'Payment deleted (no transactions remaining)' })
    }
    const newAmountPaid = transactions.reduce((s: number, t: any) => s + (t.amount || 0), 0)
    doc.transactions = transactions
    doc.amountPaid = newAmountPaid
    doc.remainingBalance = Math.max(0, (doc.totalAmount || 0) - newAmountPaid)
    doc.updatedAt = new Date()
    await doc.save()

    return NextResponse.json(doc)
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
