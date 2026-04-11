'use client'

import { useEffect, useState } from 'react'

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
  createdAt?: string
  transactions?: { amount: number; createdAt: string | Date; paymentMethod?: string; notes?: string }[]
}

interface PaymentEntry {
  payment: Payment
  amount: number
  paymentMethod?: string
  createdAt: string
  receiptPayment: Payment
  transactionIndex?: number
}

interface PatientPaymentHistoryProps {
  patientId: string
  patientName: string
  patientPhone?: string
  onClose: () => void
  onDownloadReceipt: (p: Payment) => void
  onEditPayment?: (p: Payment) => void
  onDeletePayment?: (p: Payment) => void
  onDeleteTransaction?: (paymentId: string, transactionIndex: number) => Promise<void>
}

export default function PatientPaymentHistory({ patientId, patientName, patientPhone, onClose, onDownloadReceipt, onEditPayment, onDeletePayment, onDeleteTransaction }: PatientPaymentHistoryProps) {
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
      if (payRes.ok) setPayments(await payRes.json())
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

  useEffect(() => { load() }, [patientId])

  const totalPaid = payments.reduce((s, p) => s + p.amountPaid, 0)
  const totalFromRegistration = patientTotalDue != null ? patientTotalDue : (payments.length ? Math.max(...payments.map((p) => p.totalAmount || 0)) : 0)
  const remainingBalance = Math.max(0, totalFromRegistration - totalPaid)

  const entries: PaymentEntry[] = []
  for (const p of payments) {
    const tx = p.transactions && p.transactions.length > 0 ? p.transactions : null
    if (tx && tx.length > 0) {
      tx.forEach((t, i) => {
        const dt = t.createdAt ? new Date(t.createdAt) : new Date()
        entries.push({
          payment: p,
          amount: t.amount || 0,
          paymentMethod: t.paymentMethod || p.paymentMethod,
          createdAt: dt.toLocaleDateString(),
          receiptPayment: {
            ...p,
            amountPaid: t.amount || 0,
            paymentMethod: t.paymentMethod || p.paymentMethod,
            createdAt: typeof t.createdAt === 'string' ? t.createdAt : dt.toISOString(),
            notes: t.notes || p.notes,
          },
          transactionIndex: i,
        })
      })
    } else {
      const dt = p.createdAt ? new Date(p.createdAt) : new Date()
      entries.push({ payment: p, amount: p.amountPaid || 0, paymentMethod: p.paymentMethod, createdAt: dt.toLocaleDateString(), receiptPayment: p })
    }
  }
  entries.sort((a, b) => {
    const getDate = (e: PaymentEntry) => {
      if (e.transactionIndex != null && e.payment.transactions?.[e.transactionIndex]) {
        const t = e.payment.transactions[e.transactionIndex]
        return new Date(t.createdAt || 0).getTime()
      }
      return new Date(e.payment.createdAt || 0).getTime()
    }
    return getDate(b) - getDate(a)
  })

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-border" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-border flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Payment History</h2>
            <p className="text-muted mt-0.5">{patientName}{patientPhone ? ` · ${patientPhone}` : ''}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent/50 text-muted">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <p className="text-muted text-center py-8">Loading...</p>
          ) : payments.length === 0 && (patientTotalDue == null || patientTotalDue === 0) ? (
            <p className="text-muted text-center py-8">No payments or balance for this patient.</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 sm:p-4 rounded-xl bg-blue-900/20 border border-blue-800/30">
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Total (from registration)</p>
                  <p className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-300">${totalFromRegistration.toFixed(2)}</p>
                </div>
                <div className="p-3 sm:p-4 rounded-xl bg-green-900/20 border border-green-800/30">
                  <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">Total Paid</p>
                  <p className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-300">${totalPaid.toFixed(2)}</p>
                </div>
                <div className="p-3 sm:p-4 rounded-xl bg-red-900/20 border border-red-800/30">
                  <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">Remaining Balance</p>
                  <p className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-300">${remainingBalance.toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-3">
                {entries.map((e, idx) => (
                  <div key={`${e.payment.id}-${e.transactionIndex ?? 'main'}-${idx}`} className="border border-border rounded-xl p-4 flex items-center justify-between gap-2 flex-wrap">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">${e.amount.toFixed(2)}</p>
                      <p className="text-sm text-muted">
                        {e.paymentMethod ? PAYMENT_METHOD_LABELS[e.paymentMethod] || e.paymentMethod : '—'} · {e.createdAt}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button type="button" onClick={() => onDownloadReceipt(e.receiptPayment)} className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors">
                        Receipt
                      </button>
                      {onEditPayment && e.transactionIndex == null && (
                        <button type="button" onClick={() => onEditPayment(e.payment)} className="p-1.5 rounded-lg hover:bg-accent/50 text-muted" title="Edit">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                      )}
                      {(e.transactionIndex != null ? onDeleteTransaction : onDeletePayment) && (
                        <button
                          type="button"
                          onClick={async () => {
                            if (!confirm(e.transactionIndex != null ? 'Remove this payment from history?' : 'Delete this treatment record?')) return
                            try {
                              if (e.transactionIndex != null && onDeleteTransaction) {
                                await onDeleteTransaction(e.payment.id, e.transactionIndex)
                              } else if (onDeletePayment) {
                                await onDeletePayment(e.payment)
                              }
                            } finally { load() }
                          }}
                          className="p-1.5 rounded-lg hover:bg-red-900/30 text-red-600 dark:text-red-400"
                          title="Delete"
                        >
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
