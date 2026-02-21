'use client'

import { useState, useEffect } from 'react'
import PaymentModal from './PaymentModal'

interface Payment {
  id: string
  patientId: string
  patientName: string
  totalAmount: number
  amountPaid: number
  remainingBalance: number
  notes?: string
}

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [patients, setPatients] = useState<{ id: string; name: string }[]>([])

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
        setPatients(data.map((p: any) => ({ id: p.id, name: p.name })))
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
          onClick={() => { setSelectedPayment(null); setIsModalOpen(true) }}
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
              placeholder="Search payments by patient name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="hidden lg:table w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Patient Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Total Amount Paid</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Remaining Balance</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{p.patientName}</td>
                  <td className="px-6 py-4 text-green-600 font-medium">${p.amountPaid.toFixed(2)}</td>
                  <td className="px-6 py-4 text-gray-600">${p.remainingBalance.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setSelectedPayment(p); setIsModalOpen(true) }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-600" title="Edit">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button
                        onClick={async () => { if (confirm('Delete this payment?')) { await fetch(`/api/payments/${p.id}`, { method: 'DELETE' }); loadPayments() } }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-600"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="lg:hidden divide-y divide-gray-100">
            {payments.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-2">💰</div>
                <p className="text-sm">No payments yet. Add a payment.</p>
              </div>
            ) : (
              payments.map((p) => (
                <div key={p.id} className="p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{p.patientName}</div>
                    <div className="text-xs text-green-600 mt-0.5">Paid: ${p.amountPaid.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">Balance: ${p.remainingBalance.toFixed(2)}</div>
                  </div>
                  <div className="flex gap-2 ml-2">
                    <button onClick={() => { setSelectedPayment(p); setIsModalOpen(true) }} className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button
                      onClick={async () => { if (confirm('Delete?')) { await fetch(`/api/payments/${p.id}`, { method: 'DELETE' }); loadPayments() } }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
          onClose={() => { setIsModalOpen(false); setSelectedPayment(null) }}
          onSave={loadPayments}
        />
      )}
    </div>
  )
}
