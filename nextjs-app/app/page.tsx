'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Dashboard from '@/components/Dashboard'
import Patients from '@/components/Patients'
import Appointments from '@/components/Appointments'
import AuthGuard from '@/components/AuthGuard'

export default function Home() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('dashboard')
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

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
        <main className="flex-1 ml-64">
          {activeTab === 'dashboard' && <Dashboard stats={stats} onRefresh={loadStats} />}
          {activeTab === 'patients' && <Patients />}
          {activeTab === 'appointments' && <Appointments />}
        </main>
      </div>
    </AuthGuard>
  )
}
