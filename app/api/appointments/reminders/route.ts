import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../lib/mongodb'
import Appointment from '../../../../models/Appointment'
import Patient from '../../../../models/Patient'

// Bypass local Mac SSL/TLS EPROTO bugs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    // 1. Get tomorrow's date range
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const startOfTomorrow = new Date(tomorrow)
    startOfTomorrow.setHours(0, 0, 0, 0)
    const endOfTomorrow = new Date(tomorrow)
    endOfTomorrow.setHours(23, 59, 59, 999)

    // 2. Find all scheduled appointments for tomorrow
    const appointments = await Appointment.find({
      appointmentDate: {
        $gte: startOfTomorrow,
        $lte: endOfTomorrow,
      },
      status: 'scheduled',
    }).lean()

    if (appointments.length === 0) {
      return NextResponse.json({ message: 'No appointments found for tomorrow' })
    }

    // 3. Get patient details (phone numbers)
    const patientIds = Array.from(new Set(appointments.map((a: any) => a.patientId)))
    const patients = await Patient.find({ id: { $in: patientIds } }).lean()
    const patientMap = new Map(patients.map((p: any) => [p.id, p]))

    // 4. Prepare Africa's Talking
    const credentials = {
      apiKey: process.env.AT_API_KEY || 'atsk_a64e33156f9acab7470deee3b6b1e7eb8d06e83311628b462708596ffa1970198cd374f4',
      username: process.env.AT_USERNAME || 'sandbox',
    }
    
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const AfricasTalking = require('africastalking')
    const africastalking = AfricasTalking(credentials)
    const sms = africastalking.SMS

    let sentCount = 0
    let errorCount = 0

    // 5. Send individual messages (for personalization)
    for (const apt of appointments) {
      const patient = patientMap.get(apt.patientId)
      if (!patient || !patient.phone) continue

      const message = `Asc ${patient.name}, tani waa xusuusin ka socota FOD Clinic. Waxaan kuu xasuusinaynaa ballantaada berri (${apt.timeSlot}). Waan ku sugeynaa! Mahadsanid.`
      
      // Format phone number
      let formattedPhone = patient.phone.trim().replace(/\D/g, '')
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '252' + formattedPhone.substring(1)
      } else if (formattedPhone.length === 7) {
        formattedPhone = '25263' + formattedPhone
      } else if (formattedPhone.length === 9 && (formattedPhone.startsWith('63') || formattedPhone.startsWith('65'))) {
        formattedPhone = '252' + formattedPhone
      } else if (!formattedPhone.startsWith('252') && formattedPhone.length >= 7) {
        formattedPhone = '252' + formattedPhone
      }
      formattedPhone = '+' + formattedPhone // Africa's Talking needs the +


      try {
        await sms.send({
          to: [formattedPhone],
          message: message,
        })
        sentCount++
      } catch (err) {
        console.error(`Failed to send reminder to ${patient.name}:`, err)
        errorCount++
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Sent ${sentCount} reminders. Errors: ${errorCount}`,
      sentCount,
      errorCount
    })
  } catch (error: any) {
    console.error('Reminder API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
