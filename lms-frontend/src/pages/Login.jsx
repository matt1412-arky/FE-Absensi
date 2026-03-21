import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(username, password)
      if (user.role === 'superadmin') navigate('/superadmin')
      else if (user.role === 'admin') navigate('/admin')
      else navigate('/student')
    } catch {
      setError('Username atau password salah')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo-wrap">
          <img src="/logo.png" alt="Logo Gonzaga" className="login-logo"
            onError={e => { e.target.style.display='none' }} />
          <div className="login-school-name">SMA Kolese Gonzaga</div>
          <div className="login-school-sub">Learning Management System</div>
        </div>

        <div className="login-divider" />

        {error && <div className="login-error">⚠ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-input" type="text" placeholder="Masukkan username"
              value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="Masukkan password"
              value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? 'Masuk…' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  )
}
