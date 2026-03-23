'use client'

import { useState, useEffect } from 'react'

const TREATMENT_OPTIONS = ['Upper', 'Ortho upper and lower', 'Upper and lower', 'Lower'] as const

interface Patient {
  id?: string
  name: string
  phone: string
  dateOfBirth?: string
  gender: string
  treatmentType?: string
  address: string
  medicalHistory?: string
  allergies?: string
  doctorId?: string
  doctorName?: string
  totalDue?: number
}

interface PatientModalProps {
  patient: Patient | null
  onClose: () => void
  onSave: () => void
}

export default function PatientModal({ patient, onClose, onSave }: PatientModalProps) {
  const [formData, setFormData] = useState<Patient>({
    name: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    treatmentType: '',
    address: '',
    medicalHistory: '',
    allergies: '',
    doctorId: '',
    doctorName: '',
    totalDue: 0,
  })
  const [doctors, setDoctors] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    fetch('/api/doctors').then(async (r) => {
      if (r.ok) {
        const d = await r.json()
        setDoctors(d.map((x: any) => ({ id: x.id, name: x.name })))
      }
    })
  }, [])

  useEffect(() => {
    if (patient) {
      setFormData({
        ...patient,
        treatmentType: patient.treatmentType ?? '',
        dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : '',
        doctorId: patient.doctorId || '',
        doctorName: patient.doctorName || '',
        totalDue: patient.totalDue ?? 0,
      })
    }
  }, [patient])

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!formData.treatmentType || !TREATMENT_OPTIONS.includes(formData.treatmentType as typeof TREATMENT_OPTIONS[number])) {
        setError('Treatment type is required')
        setLoading(false)
        return
      }

      if (!formData.dateOfBirth) {
        setError('Date of Birth is required')
        setLoading(false)
        return
      }

      const url = patient?.id ? `/api/patients/${patient.id}` : '/api/patients'
      const method = patient?.id ? 'PUT' : 'POST'

      const selectedDoctor = doctors.find((d) => d.id === formData.doctorId)
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
        gender: formData.gender,
        treatmentType: formData.treatmentType,
        address: formData.address.trim(),
        medicalHistory: formData.medicalHistory?.trim() || null,
        allergies: formData.allergies?.trim() || null,
        doctorId: formData.doctorId || null,
        doctorName: selectedDoctor?.name || null,
        totalDue: Number(formData.totalDue) || 0,
        id: patient?.id || `patient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: patient?.id ? undefined : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to save patient')
        setLoading(false)
        return
      }

      onSave()
      onClose()
    } catch (error: any) {
      console.error('Failed to save patient:', error)
      setError(error.message || 'An unexpected error occurred')
      setLoading(false)
    }
  }

  const inputClass = "w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-accent text-foreground placeholder-gray-500"
  const labelClass = "block text-sm font-medium text-foreground mb-2"

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-border" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 sm:p-6 lg:p-8 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
            {patient ? 'Edit Patient' : 'Add New Patient'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent/50 transition-colors text-muted">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {error && <div className="mb-4 p-3 bg-red-900/30 border border-red-800/50 text-red-600 dark:text-red-300 rounded-xl text-sm">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div>
              <label className={labelClass}>Full Name *</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone *</label>
              <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Date of Birth</label>
              <input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Gender *</label>
              <select required value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className={inputClass}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Treatment Type *</label>
              <select required value={formData.treatmentType} onChange={(e) => setFormData({ ...formData, treatmentType: e.target.value })} className={inputClass}>
                <option value="">Select treatment type</option>
                {TREATMENT_OPTIONS.map((opt: string) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Doctor</label>
              <select value={formData.doctorId || ''} onChange={(e) => { const d = doctors.find((x) => x.id === e.target.value); setFormData({ ...formData, doctorId: e.target.value, doctorName: d?.name || '' }) }} className={inputClass}>
                <option value="">No doctor assigned</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Total Due ($)</label>
              <input type="number" step="0.01" min="0" value={formData.totalDue ?? ''} onChange={(e) => setFormData({ ...formData, totalDue: Number(e.target.value) || 0 })} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Address *</label>
              <textarea required rows={2} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className={inputClass + " resize-none"} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Medical History</label>
              <textarea rows={3} value={formData.medicalHistory || ''} onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })} className={inputClass + " resize-none"} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Allergies</label>
              <textarea rows={2} value={formData.allergies || ''} onChange={(e) => setFormData({ ...formData, allergies: e.target.value })} className={inputClass + " resize-none"} />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-6 border-t border-border">
            <button type="button" onClick={onClose} className="flex-1 px-5 py-3 bg-accent border border-border text-foreground rounded-xl hover:bg-accent/50 transition-all duration-200 font-medium">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Saving...' : 'Save Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
