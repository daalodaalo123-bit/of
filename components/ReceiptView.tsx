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

  const handleWhatsAppReceipt = () => {
    const message = `Asc ${payment.patientName}, tani waa xaqiijin lacag-bixintaada oo dhan $${payment.amountPaid.toFixed(2)} oo aad u bixisay FOD Clinic maanta (${date}). Receipt #: ${payment.id}. Mahadsanid!`
    let phone = payment.patientPhone?.trim().replace(/\s+/g, '') || ''
    if (!phone) {
      alert('Patient does not have a phone number saved.')
      return
    }
    if (phone.startsWith('+')) phone = phone.substring(1)
    if (phone.startsWith('0')) phone = '252' + phone.substring(1)
    if (!phone.startsWith('252')) phone = '252' + phone
    
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

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
        <div className="no-print p-6 border-t border-border flex flex-col gap-3">
          <div className="flex gap-3">
            <button onClick={handlePrint} className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Print / PDF
            </button>
            <button onClick={handleWhatsAppReceipt} className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.438 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
              Send to WhatsApp
            </button>
          </div>
          <button onClick={onClose} className="w-full px-4 py-3 border border-border rounded-xl text-foreground hover:bg-accent/50 font-medium">Close</button>
        </div>
      </div>
    </div>
  )
}
