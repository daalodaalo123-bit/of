import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../lib/mongodb'
import Patient from '../../../../models/Patient'
import Payment from '../../../../models/Payment'
import * as XLSX from 'xlsx'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

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
    const uint8 = new Uint8Array(buffer)
    const workbook = XLSX.read(uint8, { type: 'array', raw: false })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: null })

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'No data rows found in file. Ensure the file has a header row and data.' }, { status: 400 })
    }

    const forceImport = formData.get('forceImport') === 'true'

    const existingIds = new Set<string>()
    const existingPhones = new Set<string>()
    if (!forceImport) {
      const existing = (await Patient.find({}).select('id phone').lean()) as unknown as { id: string; phone?: string }[]
      for (const p of existing) {
        existingIds.add(p.id)
        existingPhones.add(String(p.phone || '').trim())
      }
    }

    const patientsToInsert: Record<string, unknown>[] = []
    const paymentsToInsert: Record<string, unknown>[] = []
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
          if (existingIds.has(useId) || existingPhones.has(phone)) {
            errors.push(`Row ${rowNum}: Patient ${name} (${phone}) already exists`)
            continue
          }
        } else {
          while (seenIds.has(useId) || existingIds.has(useId)) {
            useId = `patient-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`
          }
        }
        seenIds.add(useId)
        existingIds.add(useId)
        existingPhones.add(phone)

        const genderRaw = String(row.gender ?? row.Gender ?? 'Other').trim().toLowerCase()
        const gender = ['male', 'female'].includes(genderRaw) ? (genderRaw === 'male' ? 'Male' : 'Female') : 'Other'

        const totalDueInitial = Number(row.total_due_initial ?? row.totalDueInitial ?? 0) || 0
        const totalDue = Number(row.total_due ?? row.totalDue ?? totalDueInitial) || totalDueInitial

        const patientDoc = {
          id: useId,
          name,
          email: row.email || row.Email ? String(row.email ?? row.Email).trim() : null,
          phone,
          dateOfBirth: safeDate(row.birth_date ?? row.birthDate) ?? null,
          gender,
          address: String(row.address ?? row.Address ?? '-').trim() || '-',
          medicalHistory: row.condition ? String(row.condition).trim() : null,
          allergies: null,
          doctorId: row.doctor_id ?? row.doctorId ? String(row.doctor_id ?? row.doctorId).trim() : null,
          doctorName: null,
          totalDue: totalDueInitial,
          createdAt: safeDate(row.created_at) ?? new Date(),
          updatedAt: new Date(),
        }
        patientsToInsert.push(patientDoc)

        const amountPaid = Math.max(0, totalDueInitial - totalDue)
        if (amountPaid > 0 || totalDueInitial > 0) {
          paymentsToInsert.push({
            id: `payment-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
            patientId: useId,
            patientName: name,
            totalAmount: totalDueInitial,
            amountPaid,
            remainingBalance: Math.max(0, totalDueInitial - amountPaid),
            transactions: amountPaid > 0 ? [{ amount: amountPaid, createdAt: new Date(), paymentMethod: undefined, notes: 'Imported from Supabase' }] : undefined,
            createdAt: safeDate(row.created_at) ?? new Date(),
            updatedAt: new Date(),
          })
        }
      } catch (err: unknown) {
        errors.push(`Row ${rowNum}: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    if (patientsToInsert.length > 0) {
      await Patient.insertMany(patientsToInsert)
    }
    if (paymentsToInsert.length > 0) {
      await Payment.insertMany(paymentsToInsert)
    }

    return NextResponse.json({
      patientsCreated: patientsToInsert.length,
      paymentsCreated: paymentsToInsert.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Imported ${patientsToInsert.length} patients and ${paymentsToInsert.length} payments${errors.length > 0 ? ` (${errors.length} rows skipped)` : ''}`,
    })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Import failed' }, { status: 500 })
  }
}
