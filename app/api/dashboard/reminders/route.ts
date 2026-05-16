import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../lib/mongodb'
import Patient from '../../../../models/Patient'
import Payment from '../../../../models/Payment'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await connectDB()

    // Target Range (From Last Sent Date + 1 month until Tomorrow)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(23, 59, 59, 999)

    const Settings = (await import('../../../../models/Settings')).default
    const lastSentDoc = await Settings.findOne({ key: 'last_monthly_reminder_date' })
    let startDate: Date
    
    if (lastSentDoc && lastSentDoc.value) {
      const lastDate = new Date(lastSentDoc.value)
      lastDate.setDate(lastDate.getDate() + 1)
      startDate = lastDate
    } else {
      startDate = new Date()
    }
    
    const targetRangeStart = new Date(startDate)
    targetRangeStart.setMonth(targetRangeStart.getMonth() - 1)
    targetRangeStart.setHours(0, 0, 0, 0)

    const targetRangeEnd = new Date(tomorrow)
    targetRangeEnd.setMonth(targetRangeEnd.getMonth() - 1)
    targetRangeEnd.setHours(23, 59, 59, 999)

    // Find patients registered in that range
    const patients = await Patient.find({
      createdAt: { $gte: targetRangeStart, $lte: targetRangeEnd }
    }).lean()

    // Find payments made in that range
    const payments = await Payment.find({
      createdAt: { $gte: targetRangeStart, $lte: targetRangeEnd }
    }).lean()

    const patientIds = new Set([
      ...patients.map((p: any) => p.id),
      ...payments.map((p: any) => p.patientId)
    ])

    return NextResponse.json({
      count: patientIds.size,
      targetRange: `${targetRangeStart.toLocaleDateString()} - ${targetRangeEnd.toLocaleDateString()}`
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
