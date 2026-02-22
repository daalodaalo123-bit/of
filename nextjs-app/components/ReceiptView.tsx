'use client'

import { useRef, useEffect } from 'react'

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

interface ReceiptViewProps {
  payment: Payment
  onClose: () => void
}

export default function ReceiptView({ payment, onClose }: ReceiptViewProps) {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    window.print()
  }

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @media print {
        body * { visibility: hidden; }
        #receipt-print, #receipt-print * { visibility: visible; }
        #receipt-print { position: absolute; left: 0; top: 0; width: 100%; }
        .no-print { display: none !important; }
      }
    `
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  const date = payment.createdAt ? new Date(payment.createdAt).toLocaleString() : '—'

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[70] p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div ref={printRef} id="receipt-print" className="p-8">
          <div className="text-center border-b border-gray-200 pb-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">FOD Clinic</h1>
            <p className="text-gray-500 text-sm mt-1">Payment Receipt</p>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Date</span>
              <span className="font-medium">{date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Receipt #</span>
              <span className="font-mono">{payment.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Patient</span>
              <span className="font-medium">{payment.patientName}</span>
            </div>
            {payment.patientPhone && (
              <div className="flex justify-between">
                <span className="text-gray-500">Phone</span>
                <span>{payment.patientPhone}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Amount Paid</span>
              <span className="font-bold text-green-600">${payment.amountPaid.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Amount</span>
              <span>${payment.totalAmount.toFixed(2)}</span>
            </div>
            {payment.paymentMethod && (
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span>{PAYMENT_METHOD_LABELS[payment.paymentMethod] || payment.paymentMethod}</span>
              </div>
            )}
            {payment.notes && (
              <div className="pt-2 border-t border-gray-100">
                <span className="text-gray-500 block mb-1">Notes</span>
                <span>{payment.notes}</span>
              </div>
            )}
          </div>
          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-gray-400 text-xs">
            Thank you for your payment
          </div>
        </div>
        <div className="no-print p-6 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-medium">Close</button>
          <button onClick={handlePrint} className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium">Print / Save as PDF</button>
        </div>
      </div>
    </div>
  )
}
