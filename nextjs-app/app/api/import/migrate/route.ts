import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../lib/mongodb'
import Patient from '../../../../models/Patient'
import Payment from '../../../../models/Payment'
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
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)

    let patientsCreated = 0
    let paymentsCreated = 0
    const errors: string[] = []
    const patientCache: Record<string, { id: string; name: string }> = {}

    const norm = (s: string) => String(s || '').trim().toLowerCase()

    for (let i = 0; i < (data as any[]).length; i++) {
      const row = (data as any[])[i]
      const rowNum = i + 2
      try {
        const name = norm(row.Name || row.name || row.Patient || row.patient || '')
        const phone = String(row.Phone || row.phone || row.Tel || row.tel || '').trim()
        if (!name || !phone) {
          errors.push(`Row ${rowNum}: Name and Phone are required`)
          continue
        }
        const cacheKey = phone

        let patient = patientCache[cacheKey]
        if (!patient) {
          let existing = await Patient.findOne({ phone })
          if (!existing) {
            const patientId = `patient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            await new Patient({
              id: patientId,
              name: row.Name || row.name || row.Patient || row.patient || '',
              email: row.Email || row.email || null,
              phone,
              dateOfBirth: row.DateOfBirth || row.dateOfBirth || row['Date of Birth'] ? new Date(row.DateOfBirth || row.dateOfBirth || row['Date of Birth']) : null,
              gender: row.Gender || row.gender || 'Other',
              address: row.Address || row.address || '-',
              medicalHistory: row.MedicalHistory || row.medicalHistory || null,
              allergies: row.Allergies || row.allergies || null,
              totalDue: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            }).save()
            patientsCreated++
            existing = await Patient.findOne({ id: patientId })
          }
          patient = { id: existing!.id, name: existing!.name }
          patientCache[cacheKey] = patient
        }

        const amountPaid = Number(row.AmountPaid ?? row['Amount Paid'] ?? row.amountPaid ?? row.Paid ?? row.paid ?? 0) || 0
        const totalAmount = Number(row.TotalAmount ?? row['Total Amount'] ?? row.totalAmount ?? row.Total ?? row.total ?? 0) || amountPaid
        const hasPayment = amountPaid > 0 || totalAmount > 0

        if (hasPayment) {
          const methodRaw = (row.PaymentMethod ?? row['Payment Method'] ?? row.Method ?? row.method ?? '').toString().toLowerCase()
          const paymentMethod = PAYMENT_METHODS.includes(methodRaw) ? methodRaw : (methodRaw === 'zaad' ? 'zaad' : methodRaw === 'edahab' ? 'edahab' : methodRaw === 'cash' ? 'cash' : undefined)
          const paymentDate = row.PaymentDate ?? row['Payment Date'] ?? row.Date ?? row.date ?? new Date()
          const notes = row.Notes ?? row.notes ?? null

          await new Payment({
            id: `payment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            patientId: patient.id,
            patientName: patient.name,
            totalAmount,
            amountPaid,
            remainingBalance: totalAmount - amountPaid,
            paymentMethod: paymentMethod || undefined,
            notes: notes ? String(notes) : null,
            createdAt: safeDate(paymentDate) ?? new Date(),
            updatedAt: new Date(),
          }).save()
          paymentsCreated++
        }
      } catch (err: any) {
        errors.push(`Row ${rowNum}: ${err.message}`)
      }
    }

    return NextResponse.json({
      patientsCreated,
      paymentsCreated,
      errors: errors.length > 0 ? errors : undefined,
      message: `Imported ${patientsCreated} patients and ${paymentsCreated} payments${errors.length > 0 ? ` (${errors.length} rows skipped)` : ''}`,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
