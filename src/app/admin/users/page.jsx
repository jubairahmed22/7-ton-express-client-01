'use client'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
// import axios from '@/lib/axios'
import axios from '../../../lib/axios'
// import ProtectedRoute from '@/app/components/ProtectedRoute'
import ProtectedRoute from '../../components/ProtectedRoute'
import { toast } from 'react-toastify'

export default function UserList() {
  const { data: session } = useSession()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users')
        setUsers(response.data)
      } catch (error) {
        toast.error('Failed to fetch users')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`/api/users/${userId}/role`, { role: newRole })
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ))
      toast.success('Role updated successfully')
    } catch (error) {
      toast.error('Failed to update role')
    }
  }

  return (
    <ProtectedRoute adminOnly>
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">All Users</h2>
          {loading ? (
            <p>Loading users...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border">Name</th>
                    <th className="py-2 px-4 border">Email</th>
                    <th className="py-2 px-4 border">Role</th>
                    <th className="py-2 px-4 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id} className="border-t">
                      <td className="py-2 px-4 border">{user.name}</td>
                      <td className="py-2 px-4 border">{user.email}</td>
                      <td className="py-2 px-4 border">{user.role}</td>
                      <td className="py-2 px-4 border">
                        {user._id !== session?.user?._id && (
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                            className="border rounded px-2 py-1"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}