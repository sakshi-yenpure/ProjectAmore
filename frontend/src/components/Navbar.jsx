import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSun, FiMoon, FiLogOut, FiUser, FiSettings, FiChevronDown } from 'react-icons/fi'
import useAuthStore from '../store/useAuthStore'
import useThemeStore from '../store/useThemeStore'

/* ─── Day/Night Toggle — centered, minimal like Elomia ─── */
const ThemeToggle = ({ isDark, onToggle }) => (
  <motion.button
    onClick={onToggle}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.97 }}
    style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      background: 'transparent',
      border: '1px solid var(--border-hover)',
      borderRadius: '100px',
      padding: '7px 16px',
      cursor: 'pointer',
      transition: 'all 0.25s ease',
      color: 'var(--text-secondary)',
      fontSize: '0.78rem',
      fontWeight: 500,
      letterSpacing: '0.02em',
      fontFamily: "'Inter', sans-serif",
    }}
    title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
  >
    {/* Track */}
    <div style={{
      width: '36px', height: '18px', borderRadius: '100px',
      background: isDark ? 'var(--text-primary)' : 'var(--border-hover)',
      position: 'relative',
      transition: 'background 0.3s ease',
      flexShrink: 0,
    }}>
      <motion.div
        animate={{ x: isDark ? 18 : 2 }}
        transition={{ type: 'spring', stiffness: 600, damping: 35 }}
        style={{
          position: 'absolute', top: '2px',
          width: '14px', height: '14px', borderRadius: '50%',
          background: isDark ? 'var(--bg-primary)' : 'white',
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        }}
      />
    </div>
    <AnimatePresence mode="wait">
      <motion.span
        key={isDark ? 'night' : 'day'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}
      >
        {isDark ? <><FiMoon size={12} /> Night</> : <><FiSun size={12} /> Day</>}
      </motion.span>
    </AnimatePresence>
  </motion.button>
)

const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { isDark, toggleTheme } = useThemeStore()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const isAuth = location.pathname === '/auth'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setShowUserMenu(false)
  }, [location.pathname])

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Chat',      path: '/chat'      },
    { label: 'Journal',   path: '/journal'   },
  ]

  const handleLogout = () => { logout(); navigate('/') }

  if (isAuth) return null

  return (
    <motion.nav
      initial={{ y: -56, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        height: '60px',
        display: 'flex', alignItems: 'center',
        padding: '0 40px',
        background: scrolled ? 'var(--bg-nav)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--nav-border)' : '1px solid transparent',
        transition: 'all 0.35s ease',
      }}
    >
      {/* ─── LEFT: Wordmark + Toggle ─── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '24px' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ opacity: 0.5, fontSize: '0.85rem', filter: 'saturate(0.4)' }}>🌸</span>
          <motion.span
            whileHover={{ opacity: 0.8 }}
            style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: '1.4rem',
              color: 'var(--accent)',
              letterSpacing: '-0.02em',
              transition: 'opacity 0.2s',
            }}
          >
            Amore
          </motion.span>
        </Link>
      </div>

      {/* ─── CENTER: Empty spacer (Elomia style) ─── */}
      <div style={{ flex: 0 }} />

      {/* ─── RIGHT: Nav links + User ─── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>

        {/* Authenticated nav links */}
        {user && (
          <div style={{ display: 'flex', gap: '2px', marginRight: '16px' }}>
            {navLinks.map(({ label, path }) => {
              const active = location.pathname === path
              return (
                <Link key={path} to={path} style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileHover={{ color: 'var(--text-primary)' }}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontWeight: active ? 600 : 400,
                      fontSize: '0.875rem',
                      transition: 'all 0.2s',
                      letterSpacing: '0.01em',
                    }}
                  >
                    {label}
                  </motion.div>
                </Link>
              )
            })}
          </div>
        )}

        {/* User area OR Sign in CTA */}
        {user ? (
          <div style={{ position: 'relative' }}>
            <motion.button
              whileHover={{ opacity: 0.8 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '100px',
                padding: '6px 14px 6px 8px',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                background: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 700, color: 'white',
                fontFamily: "'Lora', serif",
                fontStyle: 'italic',
              }}>
                {(user.first_name?.[0] || user.username?.[0] || 'U').toUpperCase()}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                {user.first_name || user.username}
              </span>
              <FiChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
            </motion.button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    position: 'absolute', right: 0, top: '48px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '14px',
                    padding: '6px',
                    minWidth: '160px',
                    zIndex: 200,
                    boxShadow: 'var(--shadow-hover)',
                  }}
                >
                  {[
                    { icon: <FiUser size={13} />,    label: 'Profile',  action: () => navigate('/profile'),        danger: false },
                    { icon: <FiSettings size={13} />, label: 'Settings', action: () => {},        danger: false },
                    { icon: <FiLogOut size={13} />,   label: 'Sign out', action: handleLogout,    danger: true  },
                  ].map(({ icon, label, action, danger }) => (
                    <button
                      key={label}
                      onClick={() => { action(); setShowUserMenu(false) }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '8px 12px', borderRadius: '8px',
                        background: 'none', border: 'none',
                        color: danger ? 'var(--accent)' : 'var(--text-primary)',
                        fontSize: '0.84rem', fontWeight: 450,
                        cursor: 'pointer', transition: 'background 0.15s',
                        fontFamily: "'Inter', sans-serif",
                        textAlign: 'left',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      {icon} {label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          location.pathname !== '/' && (
            <Link to="/auth" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ opacity: 0.85, y: -1 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  background: 'var(--text-primary)',
                  color: 'var(--bg-primary)',
                  border: 'none', borderRadius: '100px',
                  padding: '9px 22px',
                  fontSize: '0.85rem', fontWeight: 500,
                  cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                  transition: 'all 0.25s ease', letterSpacing: '0.01em',
                }}
              >
                Sign in
              </motion.button>
            </Link>
          )
        )}
      </div>
    </motion.nav>
  )
}

export default Navbar
