'use client'

import { useState, useEffect } from 'react'
import ExpenseModal from './ExpenseModal'

const CATEGORY_LABELS: Record<string, string> = {
  supplies: 'Supplies',
  rent: 'Rent',
  salaries: 'Salaries',
  utilities: 'Utilities',
  equipment: 'Equipment',
  other: 'Other',
}

interface Expense {
  id: string
  amount: number
  category: string
  description?: string
  expenseDate: string
  createdAt?: string
}

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categoryFilter, setCategoryFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)

  useEffect(() => {
    loadExpenses()
  }, [categoryFilter])

  const loadExpenses = async () => {
    try {
      const url = categoryFilter ? `/api/expenses?category=${encodeURIComponent(categoryFilter)}` : '/api/expenses'
      const res = await fetch(url)
      if (res.ok) setExpenses(await res.json())
    } catch (error) {
      console.error('Failed to load expenses:', error)
    }
  }

  const totalAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-3 sm:mb-4 lg:mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-4xl font-semibold text-gray-900 mb-1 sm:mb-2 tracking-tight">Expenses</h1>
          <p className="text-gray-500 text-xs sm:text-sm lg:text-lg hidden sm:block">Track clinic expenses and costs.</p>
        </div>
        <button
          onClick={() => { setSelectedExpense(null); setIsModalOpen(true) }}
          className="px-4 lg:px-5 py-2 lg:py-2.5 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-all duration-200 shadow-sm text-xs lg:text-sm self-start sm:self-auto"
        >
          + Add Expense
        </button>
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full sm:max-w-xs px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            >
              <option value="">All categories</option>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <span>Total:</span>
            <span className="text-rose-600 text-lg">${totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="hidden lg:table w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {expenses.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-900">{new Date(e.expenseDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700">
                      {CATEGORY_LABELS[e.category] || e.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 max-w-[200px] truncate">{e.description || '-'}</td>
                  <td className="px-6 py-4 font-semibold text-rose-600">${e.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setSelectedExpense(e); setIsModalOpen(true) }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-600" title="Edit">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button
                        onClick={async () => { if (confirm('Delete this expense?')) { await fetch(`/api/expenses/${e.id}`, { method: 'DELETE' }); loadExpenses() } }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-600"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="lg:hidden divide-y divide-gray-100">
            {expenses.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-2">📋</div>
                <p className="text-sm">No expenses yet. Add an expense.</p>
              </div>
            ) : (
              expenses.map((e) => (
                <div key={e.id} className="p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">{CATEGORY_LABELS[e.category] || e.category}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{new Date(e.expenseDate).toLocaleDateString()}</div>
                    {e.description && <div className="text-xs text-gray-600 truncate mt-0.5">{e.description}</div>}
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="font-semibold text-rose-600">${e.amount.toFixed(2)}</span>
                    <button onClick={() => { setSelectedExpense(e); setIsModalOpen(true) }} className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button
                      onClick={async () => { if (confirm('Delete?')) { await fetch(`/api/expenses/${e.id}`, { method: 'DELETE' }); loadExpenses() } }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <ExpenseModal
          expense={selectedExpense}
          onClose={() => { setIsModalOpen(false); setSelectedExpense(null) }}
          onSave={loadExpenses}
        />
      )}
    </div>
  )
}
