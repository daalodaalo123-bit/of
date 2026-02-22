'use client'

import { useState, useEffect, useRef } from 'react'

interface Appointment {
  id?: string
  patientId: string
  patientName: string
  appointmentDate: string
  timeSlot: string
  status: string
  treatmentType?: string
  notes?: string
}

interface Patient {
  id: string
  name: string
  email?: string
  phone: string
}

interface AppointmentModalProps {
  appointment: Appointment | null
  onClose: () => void
  onSave: () => void
}

export default function AppointmentModal({ appointment, onClose, onSave }: AppointmentModalProps) {
  const [formData, setFormData] = useState<Appointment>({
    patientId: '',
    patientName: '',
    appointmentDate: '',
    timeSlot: '',
    status: 'scheduled',
    treatmentType: '',
    notes: '',
  })

  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [showPatientList, setShowPatientList] = useState(false)
  const [patientSearchTerm, setPatientSearchTerm] = useState('')
  const patientInputRef = useRef<HTMLInputElement>(null)
  const patientListRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadPatients()
    if (appointment) {
      setFormData({
        ...appointment,
        appointmentDate: appointment.appointmentDate 
          ? new Date(appointment.appointmentDate).toISOString().split('T')[0]
          : '',
      })
    } else {
      const today = new Date().toISOString().split('T')[0]
      setFormData(prev => ({ ...prev, appointmentDate: today }))
    }
  }, [appointment])

  useEffect(() => {
    if (patientSearchTerm.length > 0) {
      const filtered = patients.filter(p =>
        p.name.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
        (p.email || '').toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
        p.phone.includes(patientSearchTerm)
      )
      setFilteredPatients(filtered)
      setShowPatientList(filtered.length > 0)
    } else {
      setFilteredPatients([])
      setShowPatientList(false)
    }
  }, [patientSearchTerm, patients])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        patientListRef.current &&
        !patientListRef.current.contains(event.target as Node) &&
        patientInputRef.current &&
        !patientInputRef.current.contains(event.target as Node)
      ) {
        setShowPatientList(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadPatients = async () => {
    try {
      const res = await fetch('/api/patients')
      const data = await res.json()
      setPatients(data)
    } catch (error) {
      console.error('Failed to load patients:', error)
    }
  }

  const handlePatientSelect = (patient: Patient) => {
    setFormData({
      ...formData,
      patientName: patient.name,
      patientId: patient.id,
    })
    setPatientSearchTerm(patient.name)
    setShowPatientList(false)
  }

  const handlePatientNameChange = (value: string) => {
    setPatientSearchTerm(value)
    setFormData({ ...formData, patientName: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = appointment?.id ? `/api/appointments/${appointment.id}` : '/api/appointments'
      const method = appointment?.id ? 'PUT' : 'POST'

      // Parse time slot to get time (handle formats like "10:00 AM" or "10:00")
      let timeValue = formData.timeSlot
      const timeMatch = timeValue.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i)
      if (timeMatch) {
        let hours = parseInt(timeMatch[1])
        const minutes = timeMatch[2]
        const period = timeMatch[3]?.toUpperCase()
        if (period === 'PM' && hours !== 12) hours += 12
        if (period === 'AM' && hours === 12) hours = 0
        timeValue = `${hours.toString().padStart(2, '0')}:${minutes}`
      } else {
        timeValue = '10:00' // Default time
      }

      const dateTime = new Date(`${formData.appointmentDate}T${timeValue}`)

      const payload = {
        ...formData,
        id: appointment?.id || `apt-${Date.now()}`,
        appointmentDate: dateTime.toISOString(),
        createdAt: appointment?.id ? undefined : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        onSave()
        onClose()
      }
    } catch (error) {
      console.error('Failed to save appointment:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
            {appointment ? 'Edit Appointment' : 'Schedule New Appointment'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-4 sm:mb-6">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient Name *
              </label>
              <input
                ref={patientInputRef}
                type="text"
                required
                value={patientSearchTerm}
                onChange={(e) => handlePatientNameChange(e.target.value)}
                onFocus={() => {
                  if (patientSearchTerm.length > 0 && filteredPatients.length > 0) {
                    setShowPatientList(true)
                  }
                }}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base"
                placeholder="Enter patient name"
              />
              
              {/* Patient Autocomplete Dropdown */}
              {showPatientList && filteredPatients.length > 0 && (
                <div
                  ref={patientListRef}
                  className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto backdrop-blur-xl"
                >
                  {filteredPatients.map((patient) => (
                    <button
                      key={patient.id}
                      type="button"
                      onClick={() => handlePatientSelect(patient)}
                      className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 first:rounded-t-xl last:rounded-b-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-sm flex-shrink-0">
                          {patient.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 truncate mb-0.5">{patient.name}</div>
                          <div className="text-sm text-gray-500 truncate">{patient.email || '-'}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{patient.phone}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient ID *
              </label>
              <input
                type="text"
                required
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base"
                placeholder="Enter patient ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                required
                value={formData.appointmentDate}
                onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time *
              </label>
              <input
                type="time"
                required
                value={formData.timeSlot}
                onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Slot Display *
              </label>
              <input
                type="text"
                required
                value={formData.timeSlot}
                onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                placeholder="e.g., 10:00 AM"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Treatment Type
              </label>
              <input
                type="text"
                value={formData.treatmentType || ''}
                onChange={(e) => setFormData({ ...formData, treatmentType: e.target.value })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base"
                placeholder="e.g., General Checkup, Consultation"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                rows={3}
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50 focus:bg-white resize-none text-sm sm:text-base"
                placeholder="Additional notes or instructions..."
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm"
            >
              {appointment ? 'Update Appointment' : 'Schedule Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
