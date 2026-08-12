import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../lib/auth.jsx'

export default function Layout({ children }) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { to: '/courses', label: 'Courses', icon: CoursesIcon },
    { to: '/assistant', label: 'AI Assistant', icon: AssistantIcon },
  ]

  return (
    <div className="app-layout">
      <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__header">
          <NavLink to="/dashboard" className="logo" onClick={() => setSidebarOpen(false)}>
            <span className="logo__mark">K</span>
            <span className="logo__text">Kisma AI</span>
          </NavLink>
          <button className="sidebar__close" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <CloseIcon />
          </button>
        </div>
        <nav className="sidebar__nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar__footer">
          <div className="sidebar__user">
            <div className="avatar">{(profile?.display_name || 'U').charAt(0).toUpperCase()}</div>
            <div className="sidebar__user-info">
              <span className="sidebar__user-name">{profile?.display_name || 'Learner'}</span>
              <button className="sidebar__signout" onClick={handleSignOut}>Sign out</button>
            </div>
          </div>
        </div>
      </aside>

      <div className={`sidebar-overlay ${sidebarOpen ? 'sidebar-overlay--show' : ''}`} onClick={() => setSidebarOpen(false)} />

      <div className="main-area">
        <header className="topbar">
          <button className="topbar__menu" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <MenuIcon />
          </button>
          <div className="topbar__title">Kisma AI</div>
          <div className="topbar__spacer" />
        </header>
        <main className="content">
          {children}
        </main>
      </div>
    </div>
  )
}

function DashboardIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
}
function CoursesIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
}
function AssistantIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
}
function MenuIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
}
function CloseIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
}
