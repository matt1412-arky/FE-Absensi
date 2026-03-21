import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import SuperAdminDashboard from './pages/superadmin/Dashboard'
import AdminDashboard from './pages/admin/Dashboard'
import StudentDashboard from './pages/student/Dashboard'

function RoleRouter() {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontFamily:'Plus Jakarta Sans,sans-serif',color:'#9099b3' }}>Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'superadmin') return <Navigate to="/superadmin" replace />
  if (user.role === 'admin')      return <Navigate to="/admin" replace />
  if (user.role === 'student')    return <Navigate to="/student" replace />
  return <Navigate to="/login" replace />
}

function RequireRole({ roles, children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (!roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RoleRouter />} />

          <Route path="/superadmin/*" element={
            <RequireRole roles={['superadmin']}>
              <SuperAdminDashboard />
            </RequireRole>
          } />

          <Route path="/admin/*" element={
            <RequireRole roles={['superadmin','admin']}>
              <AdminDashboard />
            </RequireRole>
          } />

          <Route path="/student/*" element={
            <RequireRole roles={['student']}>
              <StudentDashboard />
            </RequireRole>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
