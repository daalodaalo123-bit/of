'use client'

import { useState, useEffect } from 'react'

interface Payment {
  id?: string
  patientId: string
  patientName: string
  totalAmount: number
  amountPaid: number
  remainingBalance?: number
  notes?: string
}

interface PaymentModalProps {
  payment: Payment | null
  patients: { id: string; name: string }[]
  onClose: () => void
  onSave: () => void
}

export default function PaymentModal({ payment, patients, onClose, onSave }: PaymentModalProps) {
  const [formData, setFormData] = useState<Payment>({
    patientId: '',
    patientName: '',
    totalAmount: 0,
    amountPaid: 0,
    notes: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (payment) {
      setFormData({
        patientId: payment.patientId,
        patientName: payment.patientName,
        totalAmount: payment.totalAmount,
        amountPaid: payment.amountPaid,
        notes: payment.notes || '',
      })
    } else {
      setFormData({
        patientId: patients[0]?.id || '',
        patientName: patients[0]?.name || '',
        totalAmount: 0,
        amountPaid: 0,
        notes: '',
      })
    }
  }, [payment, patients])

  const handlePatientChange = (patientId: string) => {
    const p = patients.find((x) => x.id === patientId)
    if (p) setFormData({ ...formData, patientId: p.id, patientName: p.name })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const url = payment?.id ? `/api/payments/${payment.id}` : '/api/payments'
      const method = payment?.id ? 'PUT' : 'POST'
      const totalAmount = Number(formData.totalAmount) || 0
      const amountPaid = Number(formData.amountPaid) || 0
      const payload = {
        ...formData,
        id: payment?.id || `payment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        totalAmount,
        amountPaid,
        remainingBalance: totalAmount - amountPaid,
      }
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to save'); setLoading(false); return }
      onSave()
      onClose()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const remaining = (Number(formData.totalAmount) || 0) - (Number(formData.amountPaid) || 0)

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">{payment ? 'Edit Payment' : 'Add Payment'}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm">{error}</div>}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Patient *</label>
              <select
                required
                value={formData.patientId}
                onChange={(e) => handlePatientChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select patient</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount ($)</label>
              <input type="number" step="0.01" min="0" value={formData.totalAmount || ''} onChange={(e) => setFormData({ ...formData, totalAmount: Number(e.target.value) || 0 })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount Paid ($)</label>
              <input type="number" step="0.01" min="0" value={formData.amountPaid || ''} onChange={(e) => setFormData({ ...formData, amountPaid: Number(e.target.value) || 0 })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <span className="text-sm text-gray-600">Remaining Balance: </span>
              <span className="font-semibold text-gray-900">${remaining.toFixed(2)}</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea rows={2} value={formData.notes || ''} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose} className="flex-1 px-5 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-medium">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium disabled:opacity-50">{loading ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
