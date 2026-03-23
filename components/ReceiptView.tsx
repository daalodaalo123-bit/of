'use client'

import { useRef, useEffect } from 'react'

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
}

interface ReceiptViewProps {
  payment: Payment
  onClose: () => void
}

export default function ReceiptView({ payment, onClose }: ReceiptViewProps) {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => { window.print() }

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @media print {
        body * { visibility: hidden; }
        #receipt-print, #receipt-print * { visibility: visible; }
        #receipt-print { position: absolute; left: 0; top: 0; width: 100%; background: white !important; color: black !important; }
        #receipt-print span, #receipt-print p, #receipt-print h1, #receipt-print div { color: black !important; }
        .no-print { display: none !important; }
      }
    `
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  const date = payment.createdAt ? new Date(payment.createdAt).toLocaleString() : '—'

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-auto border border-border" onClick={(e) => e.stopPropagation()}>
        <div ref={printRef} id="receipt-print" className="p-8">
          <div className="text-center border-b border-border pb-6 mb-6">
            <h1 className="text-2xl font-bold text-foreground">FOD Clinic</h1>
            <p className="text-muted text-sm mt-1">Payment Receipt</p>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Date</span>
              <span className="font-medium text-foreground">{date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Receipt #</span>
              <span className="font-mono text-foreground">{payment.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Patient</span>
              <span className="font-medium text-foreground">{payment.patientName}</span>
            </div>
            {payment.patientPhone && (
              <div className="flex justify-between">
                <span className="text-muted">Phone</span>
                <span className="text-foreground">{payment.patientPhone}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted">Amount Paid</span>
              <span className="font-bold text-green-600 dark:text-green-400">${payment.amountPaid.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Total Amount</span>
              <span className="text-foreground">${payment.totalAmount.toFixed(2)}</span>
            </div>
            {payment.paymentMethod && (
              <div className="flex justify-between">
                <span className="text-muted">Method</span>
                <span className="text-foreground">{PAYMENT_METHOD_LABELS[payment.paymentMethod] || payment.paymentMethod}</span>
              </div>
            )}
            {payment.notes && (
              <div className="pt-2 border-t border-border">
                <span className="text-muted block mb-1">Notes</span>
                <span className="text-foreground">{payment.notes}</span>
              </div>
            )}
          </div>
          <div className="mt-8 pt-6 border-t border-border text-center text-muted text-xs">
            Thank you for your payment
          </div>
        </div>
        <div className="no-print p-6 border-t border-border flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-3 border border-border rounded-xl text-foreground hover:bg-accent/50 font-medium">Close</button>
          <button onClick={handlePrint} className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium">Print / Save as PDF</button>
        </div>
      </div>
    </div>
  )
}
