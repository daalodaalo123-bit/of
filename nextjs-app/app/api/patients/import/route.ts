import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../lib/mongodb'
import Patient from '../../../../models/Patient'
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
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)

    let imported = 0
    let errors: string[] = []

    for (const row of data as any[]) {
      try {
        // Map Excel columns to patient fields
        // Expected columns: Name, Email, Phone, DateOfBirth, Gender, Address, MedicalHistory, Allergies
        const patientData = {
          id: `patient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: row.Name || row.name || '',
          email: row.Email || row.email || '',
          phone: String(row.Phone || row.phone || ''),
          dateOfBirth: row.DateOfBirth || row.dateOfBirth || row['Date of Birth'] || '',
          gender: row.Gender || row.gender || 'Other',
          address: row.Address || row.address || '',
          medicalHistory: row.MedicalHistory || row.medicalHistory || row['Medical History'] || null,
          allergies: row.Allergies || row.allergies || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        // Validate required fields
        if (!patientData.name || !patientData.email || !patientData.phone) {
          errors.push(`Row ${imported + errors.length + 1}: Missing required fields`)
          continue
        }

        // Convert date if it's a string
        if (typeof patientData.dateOfBirth === 'string') {
          patientData.dateOfBirth = new Date(patientData.dateOfBirth)
        }

        // Check if patient already exists
        const existing = await Patient.findOne({ 
          $or: [
            { email: patientData.email },
            { id: patientData.id }
          ]
        })

        if (existing) {
          errors.push(`Row ${imported + errors.length + 1}: Patient ${patientData.email} already exists`)
          continue
        }

        const patient = new Patient(patientData)
        await patient.save()
        imported++
      } catch (error: any) {
        errors.push(`Row ${imported + errors.length + 1}: ${error.message}`)
      }
    }

    return NextResponse.json({
      imported,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully imported ${imported} patients${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
