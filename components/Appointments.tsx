'use client'

import { useState, useEffect } from 'react'
import AppointmentModal from './AppointmentModal'

export default function Appointments() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null)

  useEffect(() => {
    loadAppointments()
  }, [])

  const loadAppointments = async () => {
    try {
      const res = await fetch('/api/appointments')
      const data = await res.json()
      setAppointments(data)
    } catch (error) {
      console.error('Failed to load appointments:', error)
    }
  }

  const handleEdit = (appointment: any) => {
    setSelectedAppointment(appointment)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return

    try {
      const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' })
      if (res.ok) {
        loadAppointments()
      }
    } catch (error) {
      console.error('Failed to delete appointment:', error)
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-3 sm:mb-4 lg:mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-4xl font-semibold text-foreground mb-1 sm:mb-2 tracking-tight">Appointments</h1>
          <p className="text-muted text-xs sm:text-sm lg:text-lg hidden sm:block">Schedule and manage appointments.</p>
        </div>
        <button
          onClick={() => {
            setSelectedAppointment(null)
            setIsModalOpen(true)
          }}
          className="px-4 lg:px-5 py-2 lg:py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm text-xs lg:text-sm self-start sm:self-auto"
        >
          Schedule Appointment
        </button>
      </div>

      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-4 lg:p-6 border-b border-border">
          <h2 className="text-lg lg:text-xl font-semibold text-foreground">All Appointments</h2>
        </div>
        <div className="p-4 lg:p-6">
          {appointments.length === 0 ? (
            <div className="text-center py-12 lg:py-20">
              <div className="text-4xl lg:text-5xl mb-4">📅</div>
              <h3 className="text-base lg:text-lg font-semibold text-foreground mb-2">No appointments yet</h3>
              <p className="text-sm lg:text-base text-muted mb-6">Schedule your first appointment to get started</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 lg:px-5 py-2 lg:py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm text-sm lg:text-base"
              >
                Schedule Appointment
              </button>
            </div>
          ) : (
            <div className="space-y-2 lg:space-y-3">
              {appointments
                .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
                .map((apt) => (
                <div
                  key={apt.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 lg:p-4 bg-accent rounded-xl border border-border hover:border-gray-600/50 transition-all duration-200 gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm lg:text-base text-foreground mb-1">{apt.patientName}</h3>
                    <p className="text-xs lg:text-sm text-muted mb-1">
                      {new Date(apt.appointmentDate).toLocaleDateString('en-US', { 
                        weekday: 'short',
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })} at {apt.timeSlot}
                    </p>
                    {apt.treatmentType && (
                      <p className="text-xs lg:text-sm text-muted">Treatment: {apt.treatmentType}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                    <span className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                      apt.status === 'scheduled' ? 'bg-blue-900/40 text-blue-300' :
                      apt.status === 'completed' ? 'bg-green-900/40 text-green-300' :
                      apt.status === 'cancelled' ? 'bg-red-900/40 text-red-300' :
                      'bg-gray-700/50 text-foreground'
                    }`}>
                      {apt.status}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(apt)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent/50 transition-colors text-muted"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(apt.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-900/40 transition-colors text-red-400"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <AppointmentModal
          appointment={selectedAppointment}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedAppointment(null)
          }}
          onSave={loadAppointments}
        />
      )}
    </div>
  )
}
