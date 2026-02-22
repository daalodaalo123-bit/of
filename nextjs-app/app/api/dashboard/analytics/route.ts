import { NextResponse } from 'next/server'
import connectDB from '../../../../lib/mongodb'
import Patient from '../../../../models/Patient'
import Appointment from '../../../../models/Appointment'
import Payment from '../../../../models/Payment'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await connectDB()

    const now = new Date()
    const sixMonthsAgo = new Date(now)
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    sixMonthsAgo.setDate(1)
    sixMonthsAgo.setHours(0, 0, 0, 0)

    // Revenue by month (last 6 months)
    const payments = await Payment.find({ createdAt: { $gte: sixMonthsAgo } }).lean()
    const revenueByMonth: { month: string; revenue: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now)
      d.setMonth(d.getMonth() - i)
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1)
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
      const monthPayments = payments.filter(
        (p: any) => new Date(p.createdAt) >= monthStart && new Date(p.createdAt) <= monthEnd
      )
      const revenue = monthPayments.reduce((sum: number, p: any) => sum + (p.amountPaid || 0), 0)
      revenueByMonth.push({
        month: monthStart.toLocaleString('default', { month: 'short', year: '2-digit' }),
        revenue,
      })
    }

    // Payment methods breakdown
    const allPayments = await Payment.find({}).lean()
    const paymentMethods = {
      zaad: { count: 0, amount: 0 },
      edahab: { count: 0, amount: 0 },
      premier_bank: { count: 0, amount: 0 },
      other: { count: 0, amount: 0 },
    }
    for (const p of allPayments) {
      const pm = (p as any).paymentMethod
      const amt = (p as any).amountPaid || 0
      if (pm === 'zaad') {
        paymentMethods.zaad.count++
        paymentMethods.zaad.amount += amt
      } else if (pm === 'edahab') {
        paymentMethods.edahab.count++
        paymentMethods.edahab.amount += amt
      } else if (pm === 'premier_bank') {
        paymentMethods.premier_bank.count++
        paymentMethods.premier_bank.amount += amt
      } else {
        paymentMethods.other.count++
        paymentMethods.other.amount += amt
      }
    }

    // Appointments by status
    const appointments = await Appointment.find({}).lean()
    const appointmentsByStatus = {
      scheduled: 0,
      completed: 0,
      cancelled: 0,
      no_show: 0,
    }
    for (const a of appointments) {
      const s = (a as any).status || 'scheduled'
      if (s in appointmentsByStatus) (appointmentsByStatus as any)[s]++
    }

    // Total revenue
    const totalRevenue = allPayments.reduce((sum: number, p: any) => sum + (p.amountPaid || 0), 0)

    // Revenue insights: this month vs last month
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const thisMonthRevenue = allPayments
      .filter((p: any) => new Date(p.createdAt) >= thisMonthStart)
      .reduce((s: number, p: any) => s + (p.amountPaid || 0), 0)
    const lastMonthRevenue = allPayments
      .filter((p: any) => {
        const d = new Date(p.createdAt)
        return d >= lastMonthStart && d < thisMonthStart
      })
      .reduce((s: number, p: any) => s + (p.amountPaid || 0), 0)
    const revenueChangePct = lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : thisMonthRevenue > 0 ? 100 : 0

    // Outstanding balances (payments with remainingBalance > 0)
    const outstandingPayments = allPayments
      .filter((p: any) => (p.remainingBalance || 0) > 0)
      .sort((a: any, b: any) => (b.remainingBalance || 0) - (a.remainingBalance || 0))
      .slice(0, 10)
      .map((p: any) => ({
        patientName: p.patientName,
        remainingBalance: p.remainingBalance || 0,
        totalAmount: p.totalAmount || 0,
      }))
    const totalOutstanding = outstandingPayments.reduce((s: number, p: any) => s + p.remainingBalance, 0)

    // Upcoming appointments (next 7 days, including today)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekEnd = new Date(now)
    weekEnd.setDate(weekEnd.getDate() + 7)
    weekEnd.setHours(23, 59, 59, 999)
    const upcomingAppointments = await Appointment.find({
      appointmentDate: { $gte: todayStart, $lte: weekEnd },
      status: 'scheduled',
    })
      .sort({ appointmentDate: 1 })
      .limit(15)
      .lean()

    return NextResponse.json({
      revenueByMonth,
      paymentMethods,
      appointmentsByStatus,
      totalRevenue,
      revenueInsights: {
        thisMonthRevenue,
        lastMonthRevenue,
        changePct: Math.round(revenueChangePct * 10) / 10,
      },
      outstandingBalances: {
        total: totalOutstanding,
        count: outstandingPayments.length,
        topPatients: outstandingPayments,
      },
      upcomingAppointments: upcomingAppointments.map((a: any) => ({
        id: a.id,
        patientName: a.patientName,
        appointmentDate: a.appointmentDate,
        timeSlot: a.timeSlot,
        treatmentType: a.treatmentType,
      })),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
