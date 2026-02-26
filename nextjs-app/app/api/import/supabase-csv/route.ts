import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../lib/mongodb'
import Patient from '../../../../models/Patient'
import Payment from '../../../../models/Payment'
import * as XLSX from 'xlsx'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const uint8 = new Uint8Array(buffer)
    const workbook = XLSX.read(uint8, { type: 'array', raw: false })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: null })

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'No data rows found in file. Ensure the file has a header row and data.' }, { status: 400 })
    }

    const forceImport = formData.get('forceImport') === 'true'

    let patientsCreated = 0
    let paymentsCreated = 0
    const errors: string[] = []
    const seenIds = new Set<string>()

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNum = i + 2
      try {
        const name = String(row.name ?? row.Name ?? '').trim()
        const phone = String(row.phone ?? row.Phone ?? '').trim()
        if (!name || !phone) {
          errors.push(`Row ${rowNum}: Name and Phone are required`)
          continue
        }

        const id = String(row.id ?? '').trim()
        let useId = id && !seenIds.has(id) ? id : `patient-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`

        if (!forceImport) {
          const existing = await Patient.findOne({ $or: [{ id: useId }, { phone }] })
          if (existing) {
            errors.push(`Row ${rowNum}: Patient ${name} (${phone}) already exists`)
            continue
          }
        } else {
          while (seenIds.has(useId) || await Patient.findOne({ id: useId })) {
            useId = `patient-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`
          }
        }
        seenIds.add(useId)

        const genderRaw = String(row.gender ?? row.Gender ?? 'Other').trim().toLowerCase()
        const gender = ['male', 'female'].includes(genderRaw) ? (genderRaw === 'male' ? 'Male' : 'Female') : 'Other'

        const totalDueInitial = Number(row.total_due_initial ?? row.totalDueInitial ?? 0) || 0
        const totalDue = Number(row.total_due ?? row.totalDue ?? totalDueInitial) || totalDueInitial

        const patient = new Patient({
          id: useId,
          name,
          email: row.email || row.Email ? String(row.email ?? row.Email).trim() : null,
          phone,
          dateOfBirth: row.birth_date ?? row.birthDate ? new Date(String(row.birth_date ?? row.birthDate)) : null,
          gender,
          address: String(row.address ?? row.Address ?? '-').trim() || '-',
          medicalHistory: row.condition ? String(row.condition).trim() : null,
          allergies: null,
          doctorId: row.doctor_id ?? row.doctorId ? String(row.doctor_id ?? row.doctorId).trim() : null,
          doctorName: null,
          totalDue: totalDueInitial,
          createdAt: row.created_at ? new Date(String(row.created_at)) : new Date(),
          updatedAt: new Date(),
        })
        await patient.save()
        patientsCreated++

        const amountPaid = Math.max(0, totalDueInitial - totalDue)
        if (amountPaid > 0 || totalDueInitial > 0) {
          await new Payment({
            id: `payment-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
            patientId: useId,
            patientName: name,
            totalAmount: totalDueInitial,
            amountPaid,
            remainingBalance: Math.max(0, totalDueInitial - amountPaid),
            transactions: amountPaid > 0 ? [{ amount: amountPaid, createdAt: new Date(), paymentMethod: undefined, notes: 'Imported from Supabase' }] : undefined,
            createdAt: row.created_at ? new Date(String(row.created_at)) : new Date(),
            updatedAt: new Date(),
          }).save()
          paymentsCreated++
        }
      } catch (err: unknown) {
        errors.push(`Row ${rowNum}: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      patientsCreated,
      paymentsCreated,
      errors: errors.length > 0 ? errors : undefined,
      message: `Imported ${patientsCreated} patients and ${paymentsCreated} payments${errors.length > 0 ? ` (${errors.length} rows skipped)` : ''}`,
    })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Import failed' }, { status: 500 })
  }
}
