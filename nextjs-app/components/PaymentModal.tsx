'use client'

import { useState, useEffect, useRef } from 'react'

interface Payment {
  id?: string
  patientId: string
  patientName: string
  totalAmount: number
  amountPaid: number
  remainingBalance?: number
  paymentMethod?: string
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
    paymentMethod: undefined,
    notes: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [patientDropdownOpen, setPatientDropdownOpen] = useState(false)
  const [patientSearch, setPatientSearch] = useState('')
  const patientDropdownRef = useRef<HTMLDivElement>(null)
  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(patientSearch.toLowerCase().trim())
  )

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (patientDropdownRef.current && !patientDropdownRef.current.contains(e.target as Node)) {
        setPatientDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

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

  const handlePatientSelect = (p: { id: string; name: string }) => {
    setFormData((prev) => ({ ...prev, patientId: p.id, patientName: p.name }))
    setPatientDropdownOpen(false)
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
        paymentMethod: formData.paymentMethod || null,
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
            <div ref={patientDropdownRef} className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Patient *</label>
              <div
                onClick={() => setPatientDropdownOpen((v: boolean) => !v)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent cursor-pointer flex items-center justify-between min-h-[44px] bg-white"
              >
                <span className={formData.patientName ? 'text-gray-900' : 'text-gray-400'}>
                  {formData.patientName || 'Search and select patient...'}
                </span>
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {patientDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-hidden">
                  <div className="p-2 border-b border-gray-100">
                    <input
                      type="text"
                      placeholder="Search by name..."
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      autoFocus
                    />
                  </div>
                  <div className="overflow-y-auto max-h-44">
                    {filteredPatients.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500">No patients found</div>
                    ) : (
                      filteredPatients.map((p: { id: string; name: string }) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handlePatientSelect(p)}
                          className={`w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 transition-colors ${
                            formData.patientId === p.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                          }`}
                        >
                          {p.name}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount ($)</label>
              <input type="number" step="0.01" min="0" value={formData.totalAmount || ''} onChange={(e) => setFormData({ ...formData, totalAmount: Number(e.target.value) || 0 })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount Paid ($)</label>
              <input type="number" step="0.01" min="0" value={formData.amountPaid || ''} onChange={(e) => setFormData({ ...formData, amountPaid: Number(e.target.value) || 0 })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <select
                value={formData.paymentMethod || ''}
                onChange={(e) => setFormData({ ...formData, paymentMethod: (e.target.value || undefined) as any })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select payment method</option>
                <option value="zaad">Zaad</option>
                <option value="edahab">Edahab</option>
                <option value="premier_bank">Premier Bank</option>
              </select>
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
