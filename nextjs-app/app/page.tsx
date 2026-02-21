'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Dashboard from '@/components/Dashboard'
import Patients from '@/components/Patients'
import Doctors from '@/components/Doctors'
import Appointments from '@/components/Appointments'
import Payments from '@/components/Payments'
import AuthGuard from '@/components/AuthGuard'

export default function Home() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false) // Start closed on mobile
  const [stats, setStats] = useState({
    patientCount: 0,
    appointmentCount: 0,
    todayAppointments: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    profit: 0,
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const res = await fetch('/api/dashboard/stats')
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const handleLogout = async () => {
    // Clear cookie
    document.cookie = 'isAuthenticated=; path=/; max-age=0'
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('username')
    router.push('/login')
    router.refresh()
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setSidebarOpen(false) // Close sidebar on mobile when tab changes
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={handleTabChange} 
          onLogout={handleLogout}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 w-full lg:ml-64 transition-all duration-300">
          {/* Mobile Header */}
          <div className="lg:hidden bg-white border-b border-gray-200 px-3 py-2.5 sm:p-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors touch-manipulation"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white text-xs sm:text-sm font-semibold">
                F
              </div>
              <span className="text-base sm:text-lg font-semibold text-gray-900">FOD Clinic</span>
            </div>
            <div className="w-9 sm:w-10"></div>
          </div>

          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-black/50 z-[60]"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Content - Full width on mobile, minimal padding */}
          <div className="w-full p-2 sm:p-4 lg:p-8 overflow-x-hidden">
            {activeTab === 'dashboard' && <Dashboard stats={stats} onRefresh={loadStats} />}
            {activeTab === 'patients' && <Patients />}
            {activeTab === 'doctors' && <Doctors />}
            {activeTab === 'appointments' && <Appointments />}
            {activeTab === 'payments' && <Payments />}
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
