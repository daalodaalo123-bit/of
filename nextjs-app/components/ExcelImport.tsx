'use client'

import { useState } from 'react'

interface ExcelImportProps {
  onClose: () => void
  onImport: () => void
}

export default function ExcelImport({ onClose, onImport }: ExcelImportProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'migrate' | 'patients' | 'supabase'>('supabase')
  const [forceImport, setForceImport] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string; errors?: string[] } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setMessage(null)
    }
  }

  const handleImport = async () => {
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a file' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const endpoint = mode === 'migrate' ? '/api/import/migrate' : mode === 'supabase' ? '/api/import/supabase-csv' : '/api/patients/import'
      const res = await fetch(endpoint, { method: 'POST', body: formData })
      const data = await res.json()

      if (res.ok) {
        const msg = mode === 'migrate' || mode === 'supabase'
          ? `Imported ${data.patientsCreated} patients and ${data.paymentsCreated} payments!`
          : `Successfully imported ${data.imported} patients!`
        const hasErrors = data.errors && data.errors.length > 0
        const fullMsg = hasErrors ? `${msg} (${data.errors.length} rows skipped)` : msg
        setMessage({ type: 'success', text: fullMsg, errors: hasErrors ? data.errors : undefined })
        setTimeout(() => {
          onImport()
          onClose()
        }, 1500)
      } else {
        setMessage({ type: 'error', text: data.error || 'Import failed', errors: data.errors })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to import file' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">Import Data</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Import mode</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setMode('supabase')}
                className={`px-4 py-2 rounded-xl text-sm font-medium ${mode === 'supabase' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                Supabase CSV (old data)
              </button>
              <button
                type="button"
                onClick={() => setMode('migrate')}
                className={`px-4 py-2 rounded-xl text-sm font-medium ${mode === 'migrate' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                Migration (Excel)
              </button>
              <button
                type="button"
                onClick={() => setMode('patients')}
                className={`px-4 py-2 rounded-xl text-sm font-medium ${mode === 'patients' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                Patients only (Excel)
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {mode === 'supabase' ? 'Select CSV or Excel file (.csv, .xlsx, .xls)' : 'Select Excel File (.xlsx, .xls)'}
            </label>
            <input
              type="file"
              accept={mode === 'supabase' ? '.csv,.xlsx,.xls' : '.xlsx,.xls'}
              onChange={handleFileChange}
              className="w-full px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50 hover:bg-gray-100 cursor-pointer"
            />
            {mode === 'supabase' ? (
              <div className="mt-3 p-4 bg-amber-50 rounded-xl text-sm text-gray-700 space-y-1">
                <p className="font-medium text-gray-900">Supabase export format (CSV or Excel):</p>
                <p className="text-gray-600">Columns: <strong>id</strong>, <strong>name</strong>, <strong>phone</strong>, birth_date, gender, condition, doctor_id, total_due, total_due_initial, email, created_at</p>
                <p className="text-xs text-gray-500 mt-2">Keeps your old IDs. Maps total_due_initial → registration total, creates payment history.</p>
              </div>
            ) : mode === 'migrate' ? (
              <div className="mt-3 p-4 bg-blue-50 rounded-xl text-sm text-gray-700 space-y-1">
                <p className="font-medium text-gray-900">Migration format (Name, Phone, Payment history):</p>
                <p className="text-gray-600">Required: <strong>Name</strong>, <strong>Phone</strong></p>
                <p className="text-gray-600">Optional: AmountPaid, TotalAmount, PaymentDate, PaymentMethod, Notes</p>
                <p className="text-gray-600">Optional: Email, Gender, Address, DateOfBirth</p>
                <p className="text-xs text-gray-500 mt-2">Multiple rows with same Name+Phone = multiple payments for that patient</p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-gray-500">
                Columns: Name, Phone, (optional: Email, DateOfBirth, Gender, Address, MedicalHistory, Allergies)
              </p>
            )}
          </div>

          {message && (
            <div className="mb-6 space-y-2">
              <div
                className={`p-4 rounded-xl ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {message.text}
              </div>
              {message.errors && message.errors.length > 0 && (
                <details className="p-3 bg-gray-50 rounded-xl text-sm max-h-40 overflow-y-auto">
                  <summary className="cursor-pointer font-medium text-gray-700">View {message.errors.length} skipped rows</summary>
                  <ul className="mt-2 text-gray-600 text-xs space-y-1">
                    {message.errors.slice(0, 10).map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                    {message.errors.length > 10 && <li>... and {message.errors.length - 10} more</li>}
                  </ul>
                </details>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={loading || !file}
              className="flex-1 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Importing...' : 'Import'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
