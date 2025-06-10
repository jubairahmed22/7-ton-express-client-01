'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/login')
    } else if (adminOnly && session.user.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [session, status, router, adminOnly])

  if (status === 'loading' || !session || (adminOnly && session.user.role !== 'admin')) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return children
}