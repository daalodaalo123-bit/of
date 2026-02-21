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

interface Analytics {
  revenueByMonth: { month: string; revenue: number }[]
  paymentMethods: Record<string, { count: number; amount: number }>
  appointmentsByStatus: Record<string, number>
  revenueInsights?: {
    thisMonthRevenue: number
    lastMonthRevenue: number
    changePct: number
  }
  outstandingBalances?: {
    total: number
    count: number
    topPatients: { patientName: string; remainingBalance: number; totalAmount: number }[]
  }
  upcomingAppointments?: {
    id: string
    patientName: string
    appointmentDate: string
    timeSlot: string
    treatmentType?: string
  }[]
}

export default function Dashboard({ stats, onRefresh }: DashboardProps) {
  const [todayAppointments, setTodayAppointments] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)

  useEffect(() => {
    loadTodayAppointments()
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      const res = await fetch('/api/dashboard/analytics')
      if (res.ok) setAnalytics(await res.json())
    } catch (e) {
      console.error('Failed to load analytics:', e)
    }
  }

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
      <div className="mb-3 sm:mb-4 lg:mb-10">
        <h1 className="text-lg sm:text-xl lg:text-4xl font-semibold text-gray-900 mb-1 tracking-tight">Dashboard</h1>
        <p className="text-gray-500 text-xs sm:text-sm lg:text-lg hidden sm:block">Welcome back. Here's what's happening today.</p>
      </div>

      {/* Revenue Insights - Prominent Card */}
      {analytics?.revenueInsights && (
        <div className="mb-4 sm:mb-6">
          <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📈</span>
                </div>
                <span className="text-white/90 text-sm font-medium">Revenue Insights</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <p className="text-white/80 text-sm mb-1">This Month</p>
                  <p className="text-3xl sm:text-4xl font-bold text-white">${analytics.revenueInsights.thisMonthRevenue.toLocaleString()}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      analytics.revenueInsights.changePct >= 0 ? 'bg-green-400/30 text-white' : 'bg-red-400/30 text-white'
                    }`}>
                      {analytics.revenueInsights.changePct >= 0 ? '↑' : '↓'} {Math.abs(analytics.revenueInsights.changePct)}%
                    </span>
                    <span className="text-white/70 text-xs">vs last month (${analytics.revenueInsights.lastMonthRevenue.toLocaleString()})</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/60 text-xs">Last Month</p>
                  <p className="text-xl font-semibold text-white/90">${analytics.revenueInsights.lastMonthRevenue.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4 lg:mb-8">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br ${card.color} rounded-lg sm:rounded-xl flex items-center justify-center text-base sm:text-lg lg:text-xl shadow-sm`}>
                {card.icon}
              </div>
            </div>
            <div className="text-lg sm:text-xl lg:text-3xl font-semibold text-gray-900 mb-0.5 sm:mb-1">{card.value}</div>
            <div className="text-[10px] sm:text-xs lg:text-sm text-gray-500 font-medium leading-tight">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Outstanding Balances & Upcoming Appointments - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* Outstanding Balances */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">💳</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Outstanding Balances</h2>
                  <p className="text-white/80 text-sm">Patients with pending payments</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">${(analytics?.outstandingBalances?.total || 0).toLocaleString()}</p>
                <p className="text-white/80 text-xs">{(analytics?.outstandingBalances?.count || 0)} patients</p>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-5 max-h-48 overflow-y-auto">
            {analytics?.outstandingBalances?.topPatients?.length ? (
              <div className="space-y-2">
                {analytics.outstandingBalances.topPatients.slice(0, 6).map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-200 rounded-lg flex items-center justify-center text-amber-700 font-semibold text-sm">
                        {p.patientName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm truncate max-w-[120px] sm:max-w-[180px]">{p.patientName}</p>
                        <p className="text-xs text-gray-500">Total: ${p.totalAmount.toFixed(0)}</p>
                      </div>
                    </div>
                    <span className="font-bold text-amber-600">${p.remainingBalance.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-4xl mb-2">✓</p>
                <p className="text-gray-500 text-sm">All payments collected</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📅</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Upcoming Appointments</h2>
                  <p className="text-white/80 text-sm">Next 7 days</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-white/20 rounded-full text-white font-semibold text-sm">
                {analytics?.upcomingAppointments?.length || 0}
              </span>
            </div>
          </div>
          <div className="p-4 sm:p-5 max-h-48 overflow-y-auto">
            {analytics?.upcomingAppointments?.length ? (
              <div className="space-y-2">
                {analytics.upcomingAppointments.slice(0, 6).map((apt) => (
                  <div key={apt.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-200 rounded-lg flex flex-col items-center justify-center">
                      <span className="text-[10px] font-semibold text-blue-700 leading-none">
                        {new Date(apt.appointmentDate).toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span className="text-xs font-bold text-blue-800">
                        {new Date(apt.appointmentDate).getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{apt.patientName}</p>
                      <p className="text-xs text-gray-600">{apt.timeSlot}{apt.treatmentType ? ` • ${apt.treatmentType}` : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-4xl mb-2">📆</p>
                <p className="text-gray-500 text-sm">No upcoming appointments</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      {analytics && analytics.revenueByMonth.length > 0 && (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4 sm:mb-6">
          <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-100">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Revenue (Last 6 Months)</h2>
          </div>
          <div className="p-4 lg:p-6">
            <div className="flex items-end gap-2 sm:gap-3 h-32 sm:h-40">
              {analytics.revenueByMonth.map((m, i) => {
                const max = Math.max(...analytics.revenueByMonth.map((x) => x.revenue), 1)
                const h = max > 0 ? (m.revenue / max) * 100 : 0
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] sm:text-xs font-medium text-gray-600">${m.revenue}</span>
                    <div className="w-full bg-gray-100 rounded-t-lg overflow-hidden" style={{ height: '80px' }}>
                      <div
                        className="w-full bg-gradient-to-t from-blue-500 to-blue-600 rounded-t-lg transition-all duration-500"
                        style={{ height: `${Math.max(h, 2)}%` }}
                      />
                    </div>
                    <span className="text-[10px] sm:text-xs text-gray-500">{m.month}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Payment Methods & Appointments Charts */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-gray-100">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Payments by Method</h2>
            </div>
            <div className="p-4 lg:p-6 space-y-3">
              {[
                { key: 'zaad', label: 'Zaad', color: 'bg-green-500' },
                { key: 'edahab', label: 'Edahab', color: 'bg-blue-500' },
                { key: 'premier_bank', label: 'Premier Bank', color: 'bg-purple-500' },
                { key: 'other', label: 'Other', color: 'bg-gray-400' },
              ].map(({ key, label, color }) => {
                const d = analytics.paymentMethods[key] || { count: 0, amount: 0 }
                return (
                  <div key={key}>
                    <div className="flex justify-between text-xs sm:text-sm mb-1">
                      <span className="text-gray-700">{label}</span>
                      <span className="font-medium text-gray-900">${d.amount.toFixed(0)} ({d.count})</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color} rounded-full transition-all duration-500`}
                        style={{
                          width: `${(() => {
                            const total = Object.values(analytics.paymentMethods).reduce((s, x) => s + x.amount, 0)
                            return total > 0 ? (d.amount / total) * 100 : 0
                          })()}%`,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-gray-100">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Appointments by Status</h2>
            </div>
            <div className="p-4 lg:p-6 space-y-3">
              {[
                { key: 'scheduled', label: 'Scheduled', color: 'bg-blue-500' },
                { key: 'completed', label: 'Completed', color: 'bg-green-500' },
                { key: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
                { key: 'no_show', label: 'No Show', color: 'bg-gray-400' },
              ].map(({ key, label, color }) => {
                const count = analytics.appointmentsByStatus[key] || 0
                const total = Object.values(analytics.appointmentsByStatus).reduce((s, x) => s + x, 0)
                const pct = total > 0 ? (count / total) * 100 : 0
                return (
                  <div key={key}>
                    <div className="flex justify-between text-xs sm:text-sm mb-1">
                      <span className="text-gray-700">{label}</span>
                      <span className="font-medium text-gray-900">{count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.max(pct, 1)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">Today's Appointments</h2>
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
        <div className="p-3 sm:p-4 lg:p-6">
          {todayAppointments.length === 0 ? (
            <div className="text-center py-8 sm:py-12 lg:py-16">
              <div className="text-3xl sm:text-4xl lg:text-5xl mb-3 sm:mb-4">📅</div>
              <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">No appointments today</h3>
              <p className="text-xs sm:text-sm lg:text-base text-gray-500">All clear for today.</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-2 lg:space-y-3">
              {todayAppointments.map((apt: any) => (
                <div
                  key={apt.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2.5 sm:p-3 lg:p-4 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-200 gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-xs sm:text-sm lg:text-base text-gray-900 mb-0.5 sm:mb-1 truncate">{apt.patientName}</h3>
                    <p className="text-[10px] sm:text-xs lg:text-sm text-gray-500 truncate">
                      {new Date(apt.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {apt.timeSlot}
                    </p>
                  </div>
                  <span className={`px-2 sm:px-2 lg:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium self-start sm:self-auto whitespace-nowrap ${
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
