import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../lib/mongodb'
import Patient from '../../../../models/Patient'
import Payment from '../../../../models/Payment'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await connectDB()

    // Target Date (1 month before tomorrow)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const targetDateStart = new Date(tomorrow)
    targetDateStart.setMonth(targetDateStart.getMonth() - 1)
    targetDateStart.setHours(0, 0, 0, 0)
    
    const targetDateEnd = new Date(targetDateStart)
    targetDateEnd.setHours(23, 59, 59, 999)

    // Find patients registered on that date
    const patients = await Patient.find({
      createdAt: { $gte: targetDateStart, $lte: targetDateEnd }
    }).lean()

    // Find payments made on that date
    const payments = await Payment.find({
      createdAt: { $gte: targetDateStart, $lte: targetDateEnd }
    }).lean()

    const patientIds = new Set([
      ...patients.map((p: any) => p.id),
      ...payments.map((p: any) => p.patientId)
    ])

    return NextResponse.json({
      count: patientIds.size,
      targetDate: targetDateStart.toLocaleDateString()
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
