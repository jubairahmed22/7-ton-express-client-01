// app/DynamicLayout.tsx
'use client'

import { usePathname } from 'next/navigation'
import Navbar from './components/Navbar'

export default function DynamicLayout({ children }) {
  const pathname = usePathname()
  
  if (pathname?.startsWith('/admin')) {
    return <>{children}</>
  }

  if (pathname?.startsWith('/dashboard')) {
    return <>{children}</>
  }

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </>
  )
}