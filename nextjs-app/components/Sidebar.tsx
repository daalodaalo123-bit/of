'use client'

import { useState } from 'react'

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  onLogout?: () => void
}

export default function Sidebar({ activeTab, setActiveTab, onLogout }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'patients', label: 'Patients', icon: '👥' },
    { id: 'appointments', label: 'Appointments', icon: '📅' },
  ]

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 flex flex-col z-50">
      <div className="p-8 border-b border-gray-200/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-lg font-semibold shadow-sm">
            F
          </div>
          <span className="text-xl font-semibold text-gray-900 tracking-tight">FOD Clinic</span>
        </div>
      </div>

      <nav className="flex-1 p-6 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === item.id
                ? 'bg-blue-50 text-blue-600 shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-gray-200/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm">
            F
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-900">FOD</div>
            <div className="text-xs text-gray-500">Administrator</div>
          </div>
        </div>
        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        )}
      </div>
    </aside>
  )
}
