import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../lib/mongodb'
import Patient from '../../../../models/Patient'
import Payment from '../../../../models/Payment'
import Doctor from '../../../../models/Doctor'
import Appointment from '../../../../models/Appointment'
import * as XLSX from 'xlsx'

export const dynamic = 'force-dynamic'

const PAYMENT_METHODS = ['zaad', 'edahab', 'cash']

function safeDate(val: unknown): Date | null {
  if (val == null || val === '' || String(val).toLowerCase() === 'null') return null
  const d = new Date(String(val))
  return isNaN(d.getTime()) ? null : d
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })

    let patientsCreated = 0
    let paymentsCreated = 0
    let doctorsCreated = 0
    let appointmentsCreated = 0
    const errors: string[] = []

    console.log('Workbook Sheet Names:', workbook.SheetNames)
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName]
      const data = XLSX.utils.sheet_to_json(worksheet)
      console.log(`Processing sheet: ${sheetName}, Rows: ${(data as any[]).length}`)

      switch (sheetName) {
        case 'Patients':
          const currentPatientCount = await Patient.countDocuments()
          if (currentPatientCount >= 950) {
            console.log('Skipping Patients sheet as patients are already imported.')
            break
          }
          for (const row of data as any[]) {
            try {
              const phone = String(row.Phone || row.phone || '').trim()
              if (!phone) continue
              let existing = await Patient.findOne({ phone })
              const totalDue = Number(row['Total Due'] || row.totalDue) || 0
              if (!existing) {
                await new Patient({
                  id: row.ID || `patient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  name: row.Name || row.name || 'Unknown',
                  email: row.Email || null,
                  phone,
                  dateOfBirth: safeDate(row.DateOfBirth || row['Date of Birth']),
                  gender: row.Gender || 'Other',
                  address: row.Address || '-',
                  medicalHistory: row.MedicalHistory || null,
                  allergies: row.Allergies || null,
                  totalDue,
                  createdAt: safeDate(row['Created At']) || new Date(),
                }).save()
                patientsCreated++
              } else {
                await Patient.updateOne({ _id: existing._id }, { $set: { totalDue } })
              }
            } catch (err: any) {
              errors.push(`Patients Sheet: ${err.message}`)
            }
          }
          break

        case 'Doctors':
          for (const row of data as any[]) {
            try {
              const id = row.ID
              if (!id) continue
              let existing = await Doctor.findOne({ id })
              if (!existing) {
                await new Doctor({
                  id,
                  name: row.Name || 'Unknown',
                  email: row.Email || null,
                  phone: row.Phone || '',
                  specialization: row.Specialization || null,
                  createdAt: safeDate(row['Created At']) || new Date(),
                }).save()
                doctorsCreated++
              }
            } catch (err: any) {
              errors.push(`Doctors Sheet: ${err.message}`)
            }
          }
          break

        case 'Appointments':
          for (const row of data as any[]) {
            try {
              const id = row.ID || row.id
              if (!id) continue
              let existing = await Appointment.findOne({ id })
              if (!existing) {
                console.log(`Creating appointment: ${id}`)
                await new Appointment({
                  id,
                  patientId: row['Patient ID'] || row.patientId,
                  patientName: row['Patient Name'] || row.patientName,
                  appointmentDate: safeDate(row['Appointment Date'] || row.appointmentDate) || new Date(),
                  timeSlot: row['Time Slot'] || row.timeSlot || '00:00',
                  status: row.Status || row.status || 'scheduled',
                  notes: row.Notes || row.notes || null,
                  treatmentType: row['Treatment Type'] || row.treatmentType || null,
                  createdAt: safeDate(row['Created At'] || row.createdAt) || new Date(),
                }).save()
                appointmentsCreated++
              }
            } catch (err: any) {
              errors.push(`Appointments Sheet: ${err.message}`)
            }
          }
          break

        case 'Payments':
          for (const row of data as any[]) {
            try {
              const id = row.ID || row.id
              if (!id) continue
              let existing = await Payment.findOne({ id })
              if (!existing) {
                console.log(`Creating payment: ${id}`)
                const totalAmount = Number(row['Total Amount'] || row.totalAmount) || 0
                const amountPaid = Number(row['Amount Paid'] || row.amountPaid) || 0
                await new Payment({
                  id,
                  patientId: row['Patient ID'] || row.patientId,
                  patientName: row['Patient Name'] || row.patientName,
                  totalAmount,
                  amountPaid,
                  remainingBalance: totalAmount - amountPaid,
                  paymentMethod: PAYMENT_METHODS.includes(String(row['Payment Method'] || row.paymentMethod || 'cash').toLowerCase()) ? String(row['Payment Method'] || row.paymentMethod || 'cash').toLowerCase() : 'cash',
                  notes: row.Notes || row.notes || null,
                  createdAt: safeDate(row['Created At'] || row.createdAt) || new Date(),
                }).save()
                paymentsCreated++
              }
            } catch (err: any) {
              errors.push(`Payments Sheet: ${err.message}`)
            }
          }
          break
      }
    }

    return NextResponse.json({
      patientsCreated,
      paymentsCreated,
      doctorsCreated,
      appointmentsCreated,
      errors: errors.length > 0 ? errors : undefined,
      message: `Imported: ${patientsCreated} patients, ${doctorsCreated} doctors, ${appointmentsCreated} appointments, ${paymentsCreated} payments`,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
