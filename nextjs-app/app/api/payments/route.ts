import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../lib/mongodb'
import Payment from '../../../models/Payment'
import Patient from '../../../models/Patient'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const patientId = searchParams.get('patientId')

    let query: Record<string, unknown> = {}
    if (patientId && patientId.trim()) {
      query = { patientId: patientId.trim() }
    } else if (search && search.trim()) {
      const term = search.trim()
      const patientsByPhone = await Patient.find({ phone: { $regex: term, $options: 'i' } }).select('id').lean()
      const patientIdsByPhone = (patientsByPhone as { id?: string }[]).map((p) => p.id).filter(Boolean) as string[]
      const orConditions: Record<string, unknown>[] = [{ patientName: { $regex: term, $options: 'i' } }]
      if (patientIdsByPhone.length > 0) {
        orConditions.push({ patientId: { $in: patientIdsByPhone } })
      }
      query = { $or: orConditions }
    }

    const payments = await Payment.find(query).sort({ createdAt: -1 }).lean()
    const patientIds = Array.from(new Set(payments.map((p: any) => p.patientId)))
    const patients = await Patient.find({ id: { $in: patientIds } }).select('id phone').lean()
    const phoneMap = Object.fromEntries(patients.map((p: any) => [p.id, p.phone || '']))

    const paymentsWithPhone = payments.map((p: any) => ({
      ...p,
      patientPhone: phoneMap[p.patientId] || '-',
    }))

    return NextResponse.json(paymentsWithPhone)
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
