'use client'

import { useState } from 'react'

interface ExcelImportProps {
  onClose: () => void
  onImport: () => void
}

export default function ExcelImport({ onClose, onImport }: ExcelImportProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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

      const res = await fetch('/api/patients/import', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: `Successfully imported ${data.imported} patients!` })
        setTimeout(() => {
          onImport()
          onClose()
        }, 1500)
      } else {
        setMessage({ type: 'error', text: data.error || 'Import failed' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to import file' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">Import Patients from Excel</h2>
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
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Excel File (.xlsx, .xls)
            </label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="w-full px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50 hover:bg-gray-100 cursor-pointer"
            />
            <p className="mt-3 text-sm text-gray-500">
              Excel file should have columns: Name, Email, Phone, DateOfBirth, Gender, Address, MedicalHistory, Allergies
            </p>
          </div>

          {message && (
            <div
              className={`p-4 rounded-xl mb-6 ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {message.text}
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
