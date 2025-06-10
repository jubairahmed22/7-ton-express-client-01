'use client'
import { useSession } from 'next-auth/react'
import ProtectedRoute from '../../app/components/ProtectedRoute'

export default function Dashboard() {
  const { data: session } = useSession()

  return (
    <ProtectedRoute adminOnly>
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Welcome, {session?.user?.name}!</h2>
            <p className="text-gray-600">You are logged in as {session?.user?.role}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-medium">Your Information</h3>
            <ul className="mt-2 space-y-1">
              <li>Email: {session?.user?.email}</li>
              <li>Role: {session?.user?.role}</li>
            </ul>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}