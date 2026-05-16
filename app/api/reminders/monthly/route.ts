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

    // 1. Determine the date range to check
    // We want to check from (Last Sent Date + 1 month) until (Tomorrow)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(23, 59, 59, 999)

    const lastSentDoc = await Settings.findOne({ key: 'last_monthly_reminder_date' })
    let startDate: Date
    
    if (lastSentDoc && lastSentDoc.value) {
      // Start from the day after the last successful run
      const lastDate = new Date(lastSentDoc.value)
      lastDate.setDate(lastDate.getDate() + 1)
      startDate = lastDate
    } else {
      // If never run before, just do today's target (1 month ago from tomorrow)
      startDate = new Date()
    }
    
    // We are looking for patients who registered/paid exactly 1 month before our range
    const targetRangeStart = new Date(startDate)
    targetRangeStart.setMonth(targetRangeStart.getMonth() - 1)
    targetRangeStart.setHours(0, 0, 0, 0)

    const targetRangeEnd = new Date(tomorrow)
    targetRangeEnd.setMonth(targetRangeEnd.getMonth() - 1)
    targetRangeEnd.setHours(23, 59, 59, 999)

    if (force) {
      // If forced, just do tomorrow's anniversary
      targetRangeStart.setTime(targetRangeEnd.getTime())
      targetRangeStart.setHours(0, 0, 0, 0)
    }

    console.log(`Searching for follow-ups between ${targetRangeStart.toDateString()} and ${targetRangeEnd.toDateString()}`)

    // 2. Find patients registered in that range
    const patients = await Patient.find({
      createdAt: { $gte: targetRangeStart, $lte: targetRangeEnd }
    }).lean()

    // 3. Find payments made in that range
    const payments = await Payment.find({
      createdAt: { $gte: targetRangeStart, $lte: targetRangeEnd }
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
      let phone = patient.phone.trim().replace(/\D/g, '') // Keep only digits
      
      if (phone.startsWith('0')) {
        phone = '252' + phone.substring(1)
      } else if (phone.length === 7) {
        phone = '25263' + phone // Assume Telesom if 7 digits
      } else if (phone.length === 9 && (phone.startsWith('63') || phone.startsWith('65'))) {
        phone = '252' + phone
      } else if (!phone.startsWith('252') && phone.length >= 7) {
        phone = '252' + phone
      }

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
          
          // If we hit the free limit, stop the loop early
          if (errData.message?.toLowerCase().includes('limit') || errData.error?.toLowerCase().includes('limit')) {
            return NextResponse.json({
              success: false,
              message: `WAWP Free Limit Reached! Stopped after sending ${sentCount} messages. Please upgrade your WAWP plan or try again tomorrow.`,
              sentCount,
              errorCount
            })
          }
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
      message: `Checked follow-ups for patients from ${targetRangeStart.toLocaleDateString()} to ${targetRangeEnd.toLocaleDateString()}. Sent ${sentCount} WhatsApp reminders. Errors: ${errorCount}`,
      sentCount,
      errorCount
    })

  } catch (error: any) {
    console.error('Monthly Reminder API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
