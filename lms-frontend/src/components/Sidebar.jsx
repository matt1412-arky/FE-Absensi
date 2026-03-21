import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const DAYS = ['Min','Sen','Sel','Rab','Kam','Jum','Sab']

function Sidebar({ navItems, basePath }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => { logout(); navigate('/login') }

  const initials = (name = '') => name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img src="/logo.png" alt="Gonzaga" onError={e => e.target.style.display='none'} />
        <div className="sidebar-brand-text">
          <div className="brand-main">Kolese Gonzaga</div>
          <div className="brand-sub">Learning Management</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item, i) => (
          item.type === 'label'
            ? <div key={i} className="nav-section-label">{item.label}</div>
            : <div
                key={item.path}
                className={`nav-item ${location.pathname === `${basePath}${item.path}` ? 'active' : ''}`}
                onClick={() => navigate(`${basePath}${item.path}`)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials(user?.name)}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name || user?.username}</div>
            <div className="sidebar-user-role">{user?.role}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">⏻</button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
