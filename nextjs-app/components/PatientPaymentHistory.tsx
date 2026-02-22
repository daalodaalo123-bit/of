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
}

export default function PatientPaymentHistory({ patientId, patientName, patientPhone, onClose, onDownloadReceipt }: PatientPaymentHistoryProps) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/payments?patientId=${encodeURIComponent(patientId)}`)
        if (res.ok) {
          const data = await res.json()
          setPayments(data)
        }
      } catch (e) {
        console.error('Failed to load payment history:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [patientId])

  const totalPaid = payments.reduce((s, p) => s + p.amountPaid, 0)

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
          ) : payments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No payments found for this patient.</p>
          ) : (
            <div className="space-y-3">
              {payments.map((p) => (
                <div key={p.id} className="border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900">${p.amountPaid.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">
                      {p.paymentMethod ? PAYMENT_METHOD_LABELS[p.paymentMethod] || p.paymentMethod : '—'} · {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}
                    </p>
                  </div>
                  <button
                    onClick={() => onDownloadReceipt(p)}
                    className="flex-shrink-0 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Download Receipt
                  </button>
                </div>
              ))}
              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between font-semibold text-gray-900">
                <span>Total Paid</span>
                <span>${totalPaid.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
