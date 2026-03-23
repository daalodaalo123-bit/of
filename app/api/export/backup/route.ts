import { NextResponse } from 'next/server'
import connectDB from '../../../../lib/mongodb'
import Patient from '../../../../models/Patient'
import Doctor from '../../../../models/Doctor'
import Appointment from '../../../../models/Appointment'
import Payment from '../../../../models/Payment'
import Expense from '../../../../models/Expense'
import * as XLSX from 'xlsx'

export const dynamic = 'force-dynamic'

const fmt = (v: unknown): string | number => {
  if (v == null) return ''
  if (v instanceof Date) return v.toISOString()
  return v as string | number
}

export async function GET() {
  try {
    await connectDB()

    const [patients, doctors, appointments, payments, expenses] = await Promise.all([
      Patient.find({}).sort({ createdAt: -1 }).lean(),
      Doctor.find({}).sort({ createdAt: -1 }).lean(),
      Appointment.find({}).sort({ appointmentDate: -1 }).lean(),
      Payment.find({}).sort({ createdAt: -1 }).lean(),
      Expense.find({}).sort({ expenseDate: -1 }).lean(),
    ])

    const wb = XLSX.utils.book_new()

    const patientsSheet = (patients as any[]).map((p) => ({
      ID: fmt(p.id),
      Name: fmt(p.name),
      Email: fmt(p.email),
      Phone: fmt(p.phone),
      'Date of Birth': p.dateOfBirth ? new Date(p.dateOfBirth).toISOString().split('T')[0] : '',
      Gender: fmt(p.gender),
      Address: fmt(p.address),
      'Medical History': fmt(p.medicalHistory),
      Allergies: fmt(p.allergies),
      'Doctor ID': fmt(p.doctorId),
      'Doctor Name': fmt(p.doctorName),
      'Total Due': fmt(p.totalDue),
      'Created At': p.createdAt ? new Date(p.createdAt).toISOString() : '',
    }))
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(patientsSheet), 'Patients')

    const doctorsSheet = (doctors as any[]).map((d) => ({
      ID: fmt(d.id),
      Name: fmt(d.name),
      Email: fmt(d.email),
      Phone: fmt(d.phone),
      Specialization: fmt(d.specialization),
      'Created At': d.createdAt ? new Date(d.createdAt).toISOString() : '',
    }))
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(doctorsSheet), 'Doctors')

    const appointmentsSheet = (appointments as any[]).map((a) => ({
      ID: fmt(a.id),
      'Patient ID': fmt(a.patientId),
      'Patient Name': fmt(a.patientName),
      'Appointment Date': a.appointmentDate ? new Date(a.appointmentDate).toISOString().split('T')[0] : '',
      'Time Slot': fmt(a.timeSlot),
      Status: fmt(a.status),
      'Treatment Type': fmt(a.treatmentType),
      Notes: fmt(a.notes),
      'Created At': a.createdAt ? new Date(a.createdAt).toISOString() : '',
    }))
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(appointmentsSheet), 'Appointments')

    const paymentsSheet = (payments as any[]).map((p) => ({
      ID: fmt(p.id),
      'Patient ID': fmt(p.patientId),
      'Patient Name': fmt(p.patientName),
      'Total Amount': fmt(p.totalAmount),
      'Amount Paid': fmt(p.amountPaid),
      'Remaining Balance': fmt(p.remainingBalance),
      'Payment Method': fmt(p.paymentMethod),
      Notes: fmt(p.notes),
      'Created At': p.createdAt ? new Date(p.createdAt).toISOString() : '',
    }))
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(paymentsSheet), 'Payments')

    const expensesSheet = (expenses as any[]).map((e) => ({
      ID: fmt(e.id),
      Amount: fmt(e.amount),
      Category: fmt(e.category),
      Description: fmt(e.description),
      'Expense Date': e.expenseDate ? new Date(e.expenseDate).toISOString().split('T')[0] : '',
      'Created At': e.createdAt ? new Date(e.createdAt).toISOString() : '',
    }))
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(expensesSheet), 'Expenses')

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
    const filename = `FOD-Clinic-Backup-${new Date().toISOString().slice(0, 10)}.xlsx`

    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
