'use client'

import { useState, useEffect } from 'react'

interface ReportData {
  financialOverview: { totalRevenue: number; totalExpenses: number; profit: number }
  revenueByMonth: { month: string; revenue: number }[]
  expensesByCategory: { category: string; label: string; amount: number }[]
  paymentMethods: { method: string; label: string; count: number; amount: number }[]
  appointmentsByStatus: Record<string, number>
  patientStats: { total: number }
}

export default function Reports() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/reports')
        if (res.ok) {
          setData(await res.json())
        } else {
          setError('Failed to load reports')
        }
      } catch {
        setError('Failed to load reports')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-500">Loading reports...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <p className="text-red-600">{error || 'No data'}</p>
        </div>
      </div>
    )
  }

  const maxRevenue = Math.max(1, ...data.revenueByMonth.map((m) => m.revenue))
  const maxExpense = Math.max(1, ...data.expensesByCategory.map((e) => e.amount))
  const totalExpenseCat = data.expensesByCategory.reduce((s, e) => s + e.amount, 0)

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-3 sm:mb-4 lg:mb-10">
        <h1 className="text-lg sm:text-xl lg:text-4xl font-semibold text-gray-900 mb-1 tracking-tight">Reports & Analytics</h1>
        <p className="text-gray-500 text-xs sm:text-sm lg:text-lg hidden sm:block">Financial overview, revenue, expenses, and statistics.</p>
      </div>

      <div className="space-y-6">
        {/* Financial Overview */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-xl border border-green-100">
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-green-700">${data.financialOverview.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
              <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
              <p className="text-2xl font-bold text-red-700">${data.financialOverview.totalExpenses.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-sm text-gray-600 mb-1">Profit</p>
              <p className={`text-2xl font-bold ${data.financialOverview.profit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                ${data.financialOverview.profit.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Revenue by Month */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Month (Last 6 Months)</h2>
          <div className="flex items-end gap-3 sm:gap-4 h-48">
            {data.revenueByMonth.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col justify-end h-36 bg-gray-100 rounded-t-lg overflow-hidden">
                  <div
                    className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 transition-all"
                    style={{ height: `${(m.revenue / maxRevenue) * 100}%`, minHeight: m.revenue > 0 ? '4px' : 0 }}
                  />
                </div>
                <p className="text-xs font-medium text-gray-600">{m.month}</p>
                <p className="text-xs text-gray-500">${m.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Category Breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h2>
          <div className="space-y-3">
            {data.expensesByCategory
              .filter((e) => e.amount > 0)
              .map((e) => (
                <div key={e.category} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 w-24">{e.label}</span>
                  <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-lg"
                      style={{ width: `${totalExpenseCat > 0 ? (e.amount / totalExpenseCat) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-20 text-right">${e.amount.toLocaleString()}</span>
                </div>
              ))}
            {data.expensesByCategory.every((e) => e.amount === 0) && (
              <p className="text-gray-500 text-sm py-4">No expense data</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Methods */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payments by Method</h2>
            <div className="space-y-3">
              {data.paymentMethods.map((pm) => (
                <div key={pm.method} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm font-medium text-gray-700">{pm.label}</span>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900">${pm.amount.toLocaleString()}</span>
                    <span className="text-xs text-gray-500 ml-2">({pm.count} payments)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Patient & Appointment Stats */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-blue-700">{data.patientStats.total}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Appointments by Status</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(data.appointmentsByStatus).map(([status, count]) => (
                    <span
                      key={status}
                      className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 capitalize"
                    >
                      {status.replace('_', ' ')}: {count}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
