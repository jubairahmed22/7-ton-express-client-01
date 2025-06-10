// /src/app/admin/layout.jsx
"use client";

import AdminNavbar from "../components/AdminNavbar";
import AdminSidebar from "../components/AdminSidebar";
import ProtectedRoute from "../components/ProtectedRoute";
import { useState } from "react";


export default function AdminLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <ProtectedRoute allowedRoles={["user"]}>
      <div className="flex h-screen bg-gray-100 relative">
        {/* Admin Sidebar - z-20 */}
        <AdminSidebar
          isCollapsed={sidebarCollapsed}
          toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <div
          className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
            sidebarCollapsed ? "md:ml-20" : "md:ml-72"
          }`}
        >
          {/* Admin Navbar - z-40 */}
          <AdminNavbar />

          {/* Main Content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
