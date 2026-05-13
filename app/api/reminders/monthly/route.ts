import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../lib/mongodb'
import Patient from '../../../../models/Patient'
import Payment from '../../../../models/Payment'
import Settings from '../../../../models/Settings'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    // Check if already sent today (unless forced)
    const { searchParams } = new URL(request.url)
    const force = searchParams.get('force') === 'true'
    const todayStr = new Date().toISOString().split('T')[0]

    if (!force) {
      const lastSent = await Settings.findOne({ key: 'last_monthly_reminder_date' })
      if (lastSent && lastSent.value === todayStr) {
        return NextResponse.json({ message: 'Reminders already sent today', alreadySent: true })
      }
    }

    const instanceId = process.env.WAWP_INSTANCE_ID
    const accessToken = process.env.WAWP_ACCESS_TOKEN

    if (!instanceId || !accessToken) {
      return NextResponse.json({ error: 'WAWP credentials not configured in .env.local' }, { status: 400 })
    }

    // 1. Calculate the "Target Date" (1 month before tomorrow)
    // If today is June 12, tomorrow is June 13.
    // We want patients who registered/paid on May 13.
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const targetDateStart = new Date(tomorrow)
    targetDateStart.setMonth(targetDateStart.getMonth() - 1)
    targetDateStart.setHours(0, 0, 0, 0)
    
    const targetDateEnd = new Date(targetDateStart)
    targetDateEnd.setHours(23, 59, 59, 999)

    console.log(`Searching for follow-ups from registration/payment date: ${targetDateStart.toDateString()}`)

    // 2. Find patients registered on that date
    const patients = await Patient.find({
      createdAt: { $gte: targetDateStart, $lte: targetDateEnd }
    }).lean()

    // 3. Find payments made on that date
    const payments = await Payment.find({
      createdAt: { $gte: targetDateStart, $lte: targetDateEnd }
    }).lean()

    // 4. Combine unique patient IDs
    const patientIds = new Set([
      ...patients.map((p: any) => p.id),
      ...payments.map((p: any) => p.patientId)
    ])

    // 5. Fetch all unique patients to get their phones
    const targetPatients = await Patient.find({ id: { $in: Array.from(patientIds) } }).lean()

    let sentCount = 0
    let errorCount = 0

    // 6. Send WhatsApp via WAWP
    for (const patient of targetPatients) {
      if (!patient.phone) continue

      const message = `Asc ${patient.name}, tani waa xusuusin ka socota FOD Clinic. Waxaan kuu xasuusinaynaa ballantaada berri maadaama ay hal bil ka soo wareegtay booqashadii kuugu dambeysay. Mahadsanid!`
      
      // Format phone for WAWP (number@c.us)
      let phone = patient.phone.trim().replace(/\s+/g, '')
      if (phone.startsWith('+')) phone = phone.substring(1)
      if (phone.startsWith('0')) phone = '252' + phone.substring(1)
      if (!phone.startsWith('252')) phone = '252' + phone

      try {
        const res = await fetch('https://api.wawp.net/v2/send/text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instance_id: instanceId,
            access_token: accessToken,
            chatId: `${phone}@c.us`,
            message: message
          })
        })

        if (res.ok) {
          sentCount++
        } else {
          const errData = await res.json()
          console.error(`WAWP Error for ${patient.name}:`, errData)
          errorCount++
        }
      } catch (err) {
        console.error(`Fetch Error for ${patient.name}:`, err)
        errorCount++
      }
    }

    // 7. Save today as the last sent date
    await Settings.findOneAndUpdate(
      { key: 'last_monthly_reminder_date' },
      { value: todayStr, updatedAt: new Date() },
      { upsert: true }
    )

    return NextResponse.json({
      success: true,
      message: `Checked for follow-ups from ${targetDateStart.toDateString()}. Sent ${sentCount} WhatsApp reminders. Errors: ${errorCount}`,
      sentCount,
      errorCount
    })

  } catch (error: any) {
    console.error('Monthly Reminder API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
