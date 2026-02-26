'use client'

import { useState, useEffect, useMemo } from 'react'
import PaymentModal from './PaymentModal'
import PatientPaymentHistory from './PatientPaymentHistory'
import ReceiptView from './ReceiptView'

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  zaad: 'Zaad',
  edahab: 'Edahab',
  cash: 'Cash',
}

interface Payment {
  id: string
  patientId: string
  patientName: string
  patientPhone?: string
  totalAmount: number
  amountPaid: number
  remainingBalance: number
  paymentMethod?: string
  notes?: string
}

interface GroupedPatient {
  patientId: string
  patientName: string
  patientPhone?: string
  totalFromRegistration: number
  totalPaid: number
  totalBalance: number
  payments: Payment[]
}

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [addPaymentForPatient, setAddPaymentForPatient] = useState<{ id: string; name: string; phone?: string } | null>(null)
  const [patients, setPatients] = useState<{ id: string; name: string; phone?: string; totalDue?: number }[]>([])
  const [historyPatient, setHistoryPatient] = useState<{ id: string; name: string; phone?: string } | null>(null)
  const [receiptPayment, setReceiptPayment] = useState<Payment | null>(null)

  const patientById = useMemo(() => {
    const m = new Map<string, { id: string; name: string; phone?: string; totalDue?: number }>()
    for (const p of patients) m.set(p.id, p)
    return m
  }, [patients])

  const groupedByPatient = useMemo((): GroupedPatient[] => {
    const map = new Map<string, GroupedPatient>()
    for (const p of payments) {
      const key = p.patientId
      if (!map.has(key)) {
        const patient = patientById.get(key)
        const totalDue = patient?.totalDue != null ? Number(patient.totalDue) : undefined
        map.set(key, {
          patientId: p.patientId,
          patientName: p.patientName,
          patientPhone: p.patientPhone,
          totalFromRegistration: totalDue ?? 0,
          totalPaid: 0,
          totalBalance: 0,
          payments: [],
        })
      }
      const g = map.get(key)!
      g.totalPaid += p.amountPaid ?? 0
      g.payments.push(p)
    }
    const list = Array.from(map.values())
    list.forEach((g) => {
      g.totalBalance = g.totalFromRegistration >= 0
        ? Math.max(0, g.totalFromRegistration - g.totalPaid)
        : g.payments.reduce((s: number, p: Payment) => s + (p.remainingBalance ?? 0), 0)
    })
    return list
  }, [payments, patientById])

  useEffect(() => {
    loadPayments()
    loadPatients()
  }, [])

  const loadPayments = async () => {
    try {
      const url = searchTerm.trim() ? `/api/payments?search=${encodeURIComponent(searchTerm)}` : '/api/payments'
      const res = await fetch(url)
      if (res.ok) setPayments(await res.json())
    } catch (error) {
      console.error('Failed to load payments:', error)
    }
  }

  const loadPatients = async () => {
    try {
      const res = await fetch('/api/patients')
      if (res.ok) {
        const data = await res.json()
        setPatients(data.map((p: any) => ({ id: p.id, name: p.name, phone: p.phone, totalDue: p.totalDue })))
      }
    } catch (error) {
      console.error('Failed to load patients:', error)
    }
  }

  useEffect(() => {
    const t = setTimeout(loadPayments, 300)
    return () => clearTimeout(t)
  }, [searchTerm])

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-3 sm:mb-4 lg:mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-4xl font-semibold text-gray-900 mb-1 sm:mb-2 tracking-tight">Payments Management</h1>
          <p className="text-gray-500 text-xs sm:text-sm lg:text-lg hidden sm:block">Track patient payments and balances.</p>
        </div>
        <button
          onClick={() => { setSelectedPayment(null); setAddPaymentForPatient(null); setIsModalOpen(true) }}
          className="px-4 lg:px-5 py-2 lg:py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm text-xs lg:text-sm self-start sm:self-auto"
        >
          + Add Payment
        </button>
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-100">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by patient name or phone number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="hidden lg:table w-full min-w-[640px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total (from registration)</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount Paid</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Balance</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {groupedByPatient.map((g, i) => (
                <tr
                  key={g.patientId}
                  className="hover:bg-gray-50/80 transition-colors cursor-pointer"
                  onClick={() => setHistoryPatient({ id: g.patientId, name: g.patientName, phone: g.patientPhone })}
                >
                  <td className="px-4 py-3 text-sm text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-blue-600 hover:text-blue-700 hover:underline">
                      {g.patientName}
                    </span>
                    <span className="block text-xs text-gray-400 mt-0.5">Click to view payment history</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 tabular-nums">{g.patientPhone || '-'}</td>
                  <td className="px-4 py-3 text-right text-gray-700 tabular-nums whitespace-nowrap">${g.totalFromRegistration.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-medium text-green-600 tabular-nums whitespace-nowrap">${g.totalPaid.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums whitespace-nowrap">{g.totalBalance > 0 ? <span className="text-amber-600">${g.totalBalance.toFixed(2)}</span> : <span className="text-gray-500">$0.00</span>}</td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => { setSelectedPayment(null); setAddPaymentForPatient({ id: g.patientId, name: g.patientName, phone: g.patientPhone }); setIsModalOpen(true) }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-600"
                        title="Add payment"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                      </button>
                      <button
                        onClick={() => setHistoryPatient({ id: g.patientId, name: g.patientName, phone: g.patientPhone })}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-600"
                        title="View history"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="lg:hidden divide-y divide-gray-100">
            {groupedByPatient.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-2">💰</div>
                <p className="text-sm">No payments yet. Add a payment.</p>
              </div>
            ) : (
              groupedByPatient.map((g, i) => (
                <div
                  key={g.patientId}
                  role="button"
                  tabIndex={0}
                  onClick={() => setHistoryPatient({ id: g.patientId, name: g.patientName, phone: g.patientPhone })}
                  onKeyDown={(e) => e.key === 'Enter' && setHistoryPatient({ id: g.patientId, name: g.patientName, phone: g.patientPhone })}
                  className="p-4 flex items-center justify-between border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 active:bg-gray-100"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-5">{i + 1}.</span>
                      <span className="font-medium text-blue-600 truncate">{g.patientName}</span>
                    </div>
                    <div className="text-xs text-gray-500 pl-7">Tap to view payment history</div>
                    <div className="text-xs text-gray-600 pl-7">{g.patientPhone || 'No phone'}</div>
                    <div className="flex gap-4 pl-7 text-xs">
                      <span className="text-gray-700">Total: ${g.totalFromRegistration.toFixed(2)}</span>
                      <span className="text-green-600 font-medium">Paid: ${g.totalPaid.toFixed(2)}</span>
                      <span className="text-gray-500">Balance: ${g.totalBalance.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-2" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => { setSelectedPayment(null); setAddPaymentForPatient({ id: g.patientId, name: g.patientName, phone: g.patientPhone }); setIsModalOpen(true) }} className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600" title="Add payment">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    </button>
                    <button onClick={() => setHistoryPatient({ id: g.patientId, name: g.patientName, phone: g.patientPhone })} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600" title="View history">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <PaymentModal
          payment={selectedPayment}
          patients={patients}
          initialPatient={addPaymentForPatient}
          onClose={() => { setIsModalOpen(false); setSelectedPayment(null); setAddPaymentForPatient(null) }}
          onSave={loadPayments}
        />
      )}

      {historyPatient && (
        <PatientPaymentHistory
          patientId={historyPatient.id}
          patientName={historyPatient.name}
          patientPhone={historyPatient.phone}
          onClose={() => setHistoryPatient(null)}
          onDownloadReceipt={(p) => { setHistoryPatient(null); setReceiptPayment(p as Payment) }}
          onEditPayment={(p) => { setHistoryPatient(null); setSelectedPayment(p as Payment); setAddPaymentForPatient(null); setIsModalOpen(true) }}
          onDeletePayment={async (p) => {
            await fetch(`/api/payments/${p.id}`, { method: 'DELETE' })
            loadPayments()
          }}
        />
      )}

      {receiptPayment && (
        <ReceiptView
          payment={receiptPayment}
          onClose={() => setReceiptPayment(null)}
        />
      )}
    </div>
  )
}
