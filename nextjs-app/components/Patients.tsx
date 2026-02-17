'use client'

import { useState, useEffect } from 'react'
import PatientModal from './PatientModal'
import ExcelImport from './ExcelImport'

interface Patient {
  id: string
  name: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  address: string
  medicalHistory?: string
  allergies?: string
}

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/patients')
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to load patients')
      }
      const data = await res.json()
      setPatients(data)
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
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-gray-900 mb-2 tracking-tight">Patients</h1>
          <p className="text-gray-500 text-lg">Manage patient records and information.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsImportOpen(true)}
            className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 shadow-sm text-sm"
          >
            Import Excel
          </button>
          <button
            onClick={() => {
              setSelectedPatient(null)
              setIsModalOpen(true)
            }}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm text-sm"
          >
            Add Patient
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
            />
          </div>
        </div>

        <div className="p-6">
          {filteredPatients.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">👥</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No patients found' : 'No patients yet'}
              </h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try a different search term' : 'Add your first patient to get started'}
              </p>
            </div>
          ) : !loading && !error ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="p-5 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-semibold text-lg shadow-sm">
                      {patient.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{patient.name}</h3>
                      <p className="text-sm text-gray-500 truncate">{patient.email}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-gray-400">📞</span>
                      <span>{patient.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-gray-400">⚧️</span>
                      <span>{patient.gender}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-gray-400">🎂</span>
                      <span>{new Date(patient.dateOfBirth).toLocaleDateString()}</span>
                    </div>
                    {patient.allergies && (
                      <div className="flex items-center gap-2 text-orange-600">
                        <span className="text-orange-400">⚠️</span>
                        <span className="text-xs">Allergies: {patient.allergies}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(patient)}
                      className="flex-1 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(patient.id)}
                      className="flex-1 px-3 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-all duration-200 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
    </div>
  )
}
