'use client'

import { useState, useEffect } from 'react'
import PatientModal from './PatientModal'
import ExcelImport from './ExcelImport'

interface Patient {
  id: string
  name: string
  email?: string
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
  remainingBalance?: number
}

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // SMS State
  const [smsPatient, setSmsPatient] = useState<Patient | null>(null)
  const [smsMessage, setSmsMessage] = useState('')
  const [sendingSms, setSendingSms] = useState(false)

  const handleSendSms = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!smsPatient || !smsMessage.trim()) return
    setSendingSms(true)
    try {
      const res = await fetch('/api/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: smsPatient.phone, message: smsMessage }),
      })
      const data = await res.json()
      if (res.ok) {
        alert('SMS sent successfully!')
        setSmsPatient(null)
        setSmsMessage('')
      } else {
        alert('Failed to send SMS: ' + data.error)
      }
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setSendingSms(false)
    }
  }

  const handleWhatsApp = (patient: Patient) => {
    let phone = patient.phone.trim().replace(/\s+/g, '')
    // Remove leading + if present
    if (phone.startsWith('+')) phone = phone.substring(1)
    // If it starts with 0, assume it's Somalia (252)
    if (phone.startsWith('0')) phone = '252' + phone.substring(1)
    // If it doesn't start with 252, add it
    if (!phone.startsWith('252')) phone = '252' + phone

    const url = `https://wa.me/${phone}`
    window.open(url, '_blank')
  }

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    setLoading(true)
    setError(null)
    try {
      const [patientsRes, paymentsRes] = await Promise.all([
        fetch('/api/patients'),
        fetch('/api/payments')
      ])
      if (!patientsRes.ok) {
        const data = await patientsRes.json()
        throw new Error(data.error || 'Failed to load patients')
      }
      const data = await patientsRes.json()
      const payments = paymentsRes.ok ? await paymentsRes.json() : []
      const balanceByPatient: Record<string, number> = {}
      for (const p of payments) {
        const bal = p.remainingBalance ?? 0
        balanceByPatient[p.patientId] = (balanceByPatient[p.patientId] ?? 0) + bal
      }
      setPatients(data.map((pt: Patient) => ({ ...pt, remainingBalance: balanceByPatient[pt.id] ?? 0 })))
    } catch (error: any) {
      console.error('Failed to load patients:', error)
      setError(error.message || 'Failed to load patients. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm)
  )

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this patient?')) return

    try {
      const res = await fetch(`/api/patients/${id}`, { method: 'DELETE' })
      if (res.ok) {
        loadPatients()
      }
    } catch (error) {
      console.error('Failed to delete patient:', error)
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
          <div className="mb-3 sm:mb-4 lg:mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-4xl font-semibold text-foreground mb-1 sm:mb-2 tracking-tight">Patients Management</h1>
          <p className="text-muted text-xs sm:text-sm lg:text-lg hidden sm:block">Manage patient records and information.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={() => setIsImportOpen(true)}
            className="px-4 lg:px-5 py-2 lg:py-2.5 bg-card border border-border rounded-xl text-foreground font-medium hover:bg-accent transition-all duration-200 shadow-sm text-xs lg:text-sm"
          >
            Import Excel
          </button>
          <button
            onClick={() => {
              setSelectedPatient(null)
              setIsModalOpen(true)
            }}
            className="px-4 lg:px-5 py-2 lg:py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm text-xs lg:text-sm"
          >
            Add Patient
          </button>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-4 lg:p-6 border-b border-border">
          <div className="relative">
            <div className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 text-muted">
              <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search patients by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 lg:pl-12 pr-4 py-2.5 lg:py-3 border border-border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-accent text-foreground placeholder-gray-500 text-sm lg:text-base"
            />
          </div>
        </div>

        <div className="p-4 lg:p-6">
          {filteredPatients.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">👥</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchTerm ? 'No patients found' : 'No patients yet'}
              </h3>
              <p className="text-muted">
                {searchTerm ? 'Try a different search term' : 'Add your first patient to get started'}
              </p>
            </div>
          ) : !loading && !error ? (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-accent">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase">Phone</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase">Doctor</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-muted uppercase">Remaining Balance</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted uppercase">Total Due</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-muted uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {filteredPatients.map((patient) => (
                      <tr key={patient.id} className="hover:bg-accent/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-foreground">{patient.name}</div>
                          <div className="text-sm text-muted">{patient.email || '-'}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">{patient.phone}</td>
                        <td className="px-6 py-4 text-sm text-foreground">{patient.doctorName || '-'}</td>
                        <td className="px-6 py-4 text-right text-sm font-medium tabular-nums text-foreground">${(patient.remainingBalance ?? 0).toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm font-medium text-foreground">${(patient.totalDue || 0).toFixed(2)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => setSmsPatient(patient)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-green-900/40 text-green-600 dark:text-green-400" title="Send SMS">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                            </button>
                            <button onClick={() => handleWhatsApp(patient)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400" title="WhatsApp">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.438 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                            </button>
                            <button onClick={() => handleEdit(patient)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-900/40 text-blue-600 dark:text-blue-400" title="Edit">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => handleDelete(patient.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-900/40 text-red-600 dark:text-red-400" title="Delete">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredPatients.map((patient) => (
                  <div key={patient.id} className="p-4 bg-accent rounded-xl border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {patient.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{patient.name}</h3>
                        <p className="text-xs text-muted truncate">{patient.phone}</p>
                        {patient.doctorName && <p className="text-xs text-muted mt-0.5">Dr: {patient.doctorName}</p>}
                        {((patient.remainingBalance ?? 0) > 0 || (patient.totalDue ?? 0) > 0) && (
                          <p className="text-xs font-medium text-foreground mt-0.5">
                            Balance: ${(patient.remainingBalance ?? 0).toFixed(2)}
                            {(patient.totalDue ?? 0) > 0 && ` · Due: $${patient.totalDue!.toFixed(2)}`}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => setSmsPatient(patient)} className="flex-1 px-2 py-1.5 bg-card border border-green-900/50 text-green-600 dark:text-green-400 rounded-lg text-xs font-medium">SMS</button>
                      <button onClick={() => handleWhatsApp(patient)} className="flex-1 px-2 py-1.5 bg-card border border-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-medium">WhatsApp</button>
                      <button onClick={() => handleEdit(patient)} className="flex-1 px-2 py-1.5 bg-card border border-border text-foreground rounded-lg text-xs font-medium">Edit</button>
                      <button onClick={() => handleDelete(patient.id)} className="flex-1 px-2 py-1.5 bg-card border border-red-900/50 text-red-600 dark:text-red-400 rounded-lg text-xs font-medium">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>

      {isModalOpen && (
        <PatientModal
          patient={selectedPatient}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedPatient(null)
          }}
          onSave={loadPatients}
        />
      )}

      {isImportOpen && (
        <ExcelImport
          onClose={() => setIsImportOpen(false)}
          onImport={loadPatients}
        />
      )}

      {/* SMS Modal */}
      {smsPatient && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h2 className="font-semibold text-foreground">Send SMS via Africa&apos;s Talking</h2>
                <p className="text-xs text-muted mt-0.5">To: {smsPatient.name} ({smsPatient.phone})</p>
              </div>
              <button disabled={sendingSms} onClick={() => setSmsPatient(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent/50 text-muted transition-colors">✕</button>
            </div>
            <form onSubmit={handleSendSms} className="p-5">
              <textarea
                autoFocus
                required
                value={smsMessage}
                onChange={e => setSmsMessage(e.target.value)}
                placeholder="Type your message here..."
                rows={4}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-2"
              />
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs text-muted">{smsMessage.length} / 160 chars</span>
                {smsMessage.length > 160 && (
                  <span className="text-xs text-amber-500">Will be split into 2 messages</span>
                )}
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setSmsPatient(null)} disabled={sendingSms} className="flex-1 px-4 py-2 border border-border rounded-xl text-sm font-medium text-muted hover:bg-accent/40 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={sendingSms || !smsMessage.trim()} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors flex justify-center items-center gap-2">
                  {sendingSms ? 'Sending...' : 'Send SMS'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
