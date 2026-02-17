'use client'

import { useState, useEffect } from 'react'

interface DashboardProps {
  stats: {
    patientCount: number
    appointmentCount: number
    todayAppointments: number
    totalRevenue: number
    totalExpenses: number
    profit: number
  }
  onRefresh: () => void
}

export default function Dashboard({ stats, onRefresh }: DashboardProps) {
  const [todayAppointments, setTodayAppointments] = useState<any[]>([])

  useEffect(() => {
    loadTodayAppointments()
  }, [])

  const loadTodayAppointments = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const res = await fetch(`/api/appointments?date=${today}`)
      const data = await res.json()
      setTodayAppointments(data.filter((apt: any) => apt.status === 'scheduled'))
    } catch (error) {
      console.error('Failed to load today appointments:', error)
    }
  }

  const statCards = [
    {
      label: 'Total Patients',
      value: stats.patientCount,
      icon: '👥',
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Scheduled',
      value: stats.appointmentCount,
      icon: '📅',
      color: 'from-green-500 to-green-600',
    },
    {
      label: "Today's Appointments",
      value: stats.todayAppointments,
      icon: '⏰',
      color: 'from-orange-500 to-orange-600',
    },
    {
      label: 'Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: '💰',
      color: 'from-purple-500 to-purple-600',
    },
  ]

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-4 sm:mb-6 lg:mb-10">
        <h1 className="text-xl sm:text-2xl lg:text-4xl font-semibold text-gray-900 mb-1 sm:mb-2 tracking-tight">Dashboard</h1>
        <p className="text-gray-500 text-xs sm:text-sm lg:text-lg">Welcome back. Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center text-lg sm:text-xl shadow-sm`}>
                {card.icon}
              </div>
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 mb-1">{card.value}</div>
            <div className="text-xs sm:text-sm text-gray-500 font-medium">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 lg:p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Today's Appointments</h2>
          <button
            onClick={() => {
              onRefresh()
              loadTodayAppointments()
            }}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 transition-colors text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        <div className="p-4 lg:p-6">
          {todayAppointments.length === 0 ? (
            <div className="text-center py-12 lg:py-16">
              <div className="text-4xl lg:text-5xl mb-4">📅</div>
              <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-2">No appointments today</h3>
              <p className="text-sm lg:text-base text-gray-500">All clear for today.</p>
            </div>
          ) : (
            <div className="space-y-2 lg:space-y-3">
              {todayAppointments.map((apt: any) => (
                <div
                  key={apt.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 lg:p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-200 gap-2"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm lg:text-base text-gray-900 mb-1">{apt.patientName}</h3>
                    <p className="text-xs lg:text-sm text-gray-500">
                      {new Date(apt.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {apt.timeSlot}
                    </p>
                  </div>
                  <span className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium self-start sm:self-auto ${
                    apt.status === 'scheduled' ? 'bg-blue-50 text-blue-600' :
                    apt.status === 'completed' ? 'bg-green-50 text-green-600' :
                    'bg-red-50 text-red-600'
                  }`}>
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
