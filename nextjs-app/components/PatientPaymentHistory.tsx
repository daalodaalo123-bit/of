'use client'

import { useEffect, useState } from 'react'

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  zaad: 'Zaad',
  edahab: 'Edahab',
  premier_bank: 'Premier Bank',
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
  createdAt?: string
}

interface PatientPaymentHistoryProps {
  patientId: string
  patientName: string
  patientPhone?: string
  onClose: () => void
  onDownloadReceipt: (p: Payment) => void
  onEditPayment?: (p: Payment) => void
  onDeletePayment?: (p: Payment) => void
}

export default function PatientPaymentHistory({ patientId, patientName, patientPhone, onClose, onDownloadReceipt, onEditPayment, onDeletePayment }: PatientPaymentHistoryProps) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [patientTotalDue, setPatientTotalDue] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [payRes, patientRes] = await Promise.all([
        fetch(`/api/payments?patientId=${encodeURIComponent(patientId)}`),
        fetch(`/api/patients/${encodeURIComponent(patientId)}`),
      ])
      if (payRes.ok) {
        const data = await payRes.json()
        setPayments(data)
      }
      if (patientRes.ok) {
        const patient = await patientRes.json()
        setPatientTotalDue(patient.totalDue != null ? Number(patient.totalDue) : 0)
      } else {
        setPatientTotalDue(0)
      }
    } catch (e) {
      console.error('Failed to load payment history:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [patientId])

  const totalPaid = payments.reduce((s, p) => s + p.amountPaid, 0)
  const totalFromRegistration = patientTotalDue != null ? patientTotalDue : (payments.length ? Math.max(...payments.map((p) => p.totalAmount || 0)) : 0)
  const remainingBalance = Math.max(0, totalFromRegistration - totalPaid)

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Payment History</h2>
            <p className="text-gray-600 mt-0.5">{patientName}{patientPhone ? ` · ${patientPhone}` : ''}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <p className="text-gray-500 text-center py-8">Loading...</p>
          ) : payments.length === 0 && (patientTotalDue == null || patientTotalDue === 0) ? (
            <p className="text-gray-500 text-center py-8">No payments or balance for this patient.</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 sm:p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="text-xs font-medium text-blue-700 mb-1">Total (from registration)</p>
                  <p className="text-lg sm:text-xl font-bold text-blue-800">${totalFromRegistration.toFixed(2)}</p>
                </div>
                <div className="p-3 sm:p-4 rounded-xl bg-green-50 border border-green-100">
                  <p className="text-xs font-medium text-green-700 mb-1">Total Paid</p>
                  <p className="text-lg sm:text-xl font-bold text-green-800">${totalPaid.toFixed(2)}</p>
                </div>
                <div className="p-3 sm:p-4 rounded-xl bg-red-50 border border-red-100">
                  <p className="text-xs font-medium text-red-700 mb-1">Remaining Balance</p>
                  <p className="text-lg sm:text-xl font-bold text-red-800">${remainingBalance.toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-3">
                {payments.map((p) => (
                  <div key={p.id} className="border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-2 flex-wrap">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900">${p.amountPaid.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">
                        {p.paymentMethod ? PAYMENT_METHOD_LABELS[p.paymentMethod] || p.paymentMethod : '—'} · {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button type="button" onClick={() => onDownloadReceipt(p)} className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        Receipt
                      </button>
                      {onEditPayment && (
                        <button type="button" onClick={() => onEditPayment(p)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600" title="Edit">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                      )}
                      {onDeletePayment && (
                        <button type="button" onClick={async () => { if (confirm('Delete this treatment record?')) { await onDeletePayment(p); load() } }} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600" title="Delete">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
