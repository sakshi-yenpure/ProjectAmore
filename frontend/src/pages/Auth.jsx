import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi'
import useAuthStore from '../store/useAuthStore'
import useThemeStore from '../store/useThemeStore'
import { BlossomDrift } from '../components/Blossom'

/* ─── Animated orb that follows an elliptical path ─── */
const OrbitOrb = ({ isDark }) => {
  const [pos, setPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    let animId
    let angle = 0
    const animate = () => {
      angle += 0.007
      const x = 250 + 200 * Math.cos(angle)
      const y = 250 + 140 * Math.sin(angle)
      setPos({ x, y })
      animId = requestAnimationFrame(animate)
    }
    animId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <div style={{ position: 'absolute', inset: 0, borderRadius: '28px', overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
      <div style={{
        position: 'absolute',
        width: '140px', height: '140px', borderRadius: '50%',
        background: isDark
          ? 'radial-gradient(circle, rgba(255,107,122,0.5) 0%, rgba(255,143,163,0.2) 60%, transparent 100%)'
          : 'radial-gradient(circle, rgba(230,57,70,0.25) 0%, rgba(255,182,193,0.15) 60%, transparent 100%)',
        left: `${pos.x - 70}px`,
        top: `${pos.y - 70}px`,
        filter: 'blur(24px)',
        transition: 'left 0.05s linear, top 0.05s linear',
      }} />
      <div style={{
        position: 'absolute',
        width: '50px', height: '50px', borderRadius: '50%',
        background: isDark
          ? 'linear-gradient(135deg, rgba(255,107,122,0.7), rgba(255,143,163,0.4))'
          : 'linear-gradient(135deg, rgba(230,57,70,0.4), rgba(255,143,163,0.3))',
        left: `${pos.x - 25}px`,
        top: `${pos.y - 25}px`,
        border: isDark ? '2px solid rgba(255,255,255,0.15)' : '2px solid rgba(230,57,70,0.2)',
        transition: 'left 0.05s linear, top 0.05s linear',
      }} />
    </div>
  )
}

/* AuthFloaters removed for a more sophisticated look */

/* ─── Typewriter Effect ─── */
const TypewriterText = () => {
  const text1 = "Your safe space to feel and heal "
  const text2 = "together"
  const fullLength = text1.length + text2.length
  const [len, setLen] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setLen(prev => {
        if (prev >= fullLength) {
          clearInterval(interval)
          return prev
        }
        return prev + 1
      })
    }, 40)
    return () => clearInterval(interval)
  }, [])

  return (
    <span style={{ display: 'inline-block', minHeight: '1.2em' }}>
      {text1.slice(0, len)}
      <span style={{ color: 'var(--text-primary)', fontStyle: 'italic', fontFamily: "'Lora', serif" }}>
        {len > text1.length ? text2.slice(0, len - text1.length) : ""}
      </span>
    </span>
  )
}


/* ─── Input Field ─── */
const InputField = ({ icon, label, type, value, onChange, placeholder, id, isDark }) => {
  const [showPass, setShowPass] = useState(false)
  const [focused, setFocused] = useState(false)
  const isPassword = type === 'password'

  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{
        display: 'block',
        color: 'var(--text-secondary)',
        fontSize: '0.78rem',
        fontWeight: 700,
        marginBottom: '7px',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
          color: focused ? 'var(--accent)' : 'var(--text-muted)',
          zIndex: 2, transition: 'color 0.3s',
        }}>
          {React.cloneElement(icon, { size: 16 })}
        </div>
        <input
          id={id}
          type={isPassword && showPass ? 'text' : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            padding: '13px 44px 13px 42px',
            background: focused ? 'var(--accent-light)' : 'var(--bg-secondary)',
            border: `1.5px solid ${focused ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: '12px',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            fontFamily: "'Inter', sans-serif",
            outline: 'none',
            transition: 'all 0.3s ease',
            boxShadow: focused ? '0 0 0 3px var(--accent-light)' : 'none',
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            style={{
              position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none',
              color: 'var(--text-muted)', cursor: 'pointer', display: 'flex',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        )}
      </div>
    </div>
  )
}

/* ─── Main Auth Page ─── */
const Auth = () => {
  const navigate = useNavigate()
  const { login: storeLogin, signup: storeSignup, logout: storeLogout } = useAuthStore()
  const { isDark } = useThemeStore()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    username: '', email: '', password: '', first_name: '', last_name: '',
  })

  const update = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    // Clear any existing session
    storeLogout()
    
    let result
    if (isLogin) {
      result = await storeLogin(form.username, form.password)
    } else {
      result = await storeSignup(form)
    }

    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.message)
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <BlossomDrift />

      {/* Background blobs removed, now handled by global index.css body background */}

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: 'center', marginBottom: '32px' }}
        >
          {/* Logo animation removed for sophisticated look */}
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '2.8rem',
            fontWeight: 400,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            marginBottom: '8px',
          }}>
            Amore
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 400 }}>
            <TypewriterText />
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'relative',
            background: 'var(--bg-card)',
            border: '1.5px solid var(--border-hover)',
            borderRadius: '28px',
            padding: '36px 32px',
            overflow: 'hidden',
            backdropFilter: 'blur(20px)',
            boxShadow: isDark
              ? '0 24px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,107,122,0.08)'
              : '0 24px 60px rgba(230,57,70,0.1), 0 0 0 1px rgba(230,57,70,0.06)',
          }}
        >
          <OrbitOrb isDark={isDark} />

          <div style={{ position: 'relative', zIndex: 2 }}>
            {/* Tab switcher */}
            <div style={{
              display: 'flex',
              background: 'var(--bg-secondary)',
              borderRadius: '14px', padding: '4px',
              marginBottom: '28px',
              border: '1px solid var(--border)',
            }}>
              {['Sign In', 'Sign Up'].map((tab, i) => {
                const active = isLogin ? i === 0 : i === 1
                return (
                  <motion.button
                    key={tab}
                    onClick={() => { setIsLogin(i === 0); setError('') }}
                    whileHover={!active ? { scale: 1.02 } : {}}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      flex: 1, padding: '10px',
                      borderRadius: '10px', border: 'none',
                      background: active
                        ? 'var(--text-primary)'
                        : 'transparent',
                      color: active ? 'var(--bg-primary)' : 'var(--text-secondary)',
                      fontWeight: 700, fontSize: '0.87rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      boxShadow: active ? '0 4px 14px rgba(0,0,0,0.1)' : 'none',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {tab}
                  </motion.button>
                )
              })}
            </div>

            {/* Form */}
            <AnimatePresence mode="wait">
              <motion.form
                key={isLogin ? 'login' : 'signup'}
                initial={{ opacity: 0, x: isLogin ? -16 : 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLogin ? 16 : -16 }}
                transition={{ duration: 0.22 }}
                onSubmit={handleSubmit}
              >
                {!isLogin && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <InputField icon={<FiUser />} label="First Name" type="text" id="first-name"
                      value={form.first_name} onChange={update('first_name')} placeholder="Arjun" isDark={isDark} />
                    <InputField icon={<FiUser />} label="Last Name" type="text" id="last-name"
                      value={form.last_name} onChange={update('last_name')} placeholder="Sharma" isDark={isDark} />
                  </div>
                )}
                {!isLogin && (
                  <InputField icon={<FiMail />} label="Email" type="email" id="email"
                    value={form.email} onChange={update('email')} placeholder="you@email.com" isDark={isDark} />
                )}
                <InputField icon={<FiUser />} label="Username" type="text" id="username"
                  value={form.username} onChange={update('username')} placeholder="arjun_sharma" isDark={isDark} />
                <InputField icon={<FiLock />} label="Password" type="password" id="password"
                  value={form.password} onChange={update('password')} placeholder="••••••••" isDark={isDark} />

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: 'rgba(230,57,70,0.08)',
                      border: '1px solid rgba(230,57,70,0.25)',
                      borderRadius: '10px', padding: '10px 14px',
                      color: '#E63946', fontSize: '0.83rem',
                      marginBottom: '14px',
                    }}
                  >
                    ⚠️ {error}
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 12px 30px rgba(0,0,0,0.2)' }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%', padding: '14px',
                    background: loading ? 'var(--text-muted)' : 'var(--text-primary)',
                    border: 'none', borderRadius: '14px',
                    color: 'var(--bg-primary)', fontWeight: 700, fontSize: '1rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                    marginTop: '8px',
                    transition: 'all 0.3s',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{
                        width: '18px', height: '18px',
                        border: '2px solid white', borderTopColor: 'transparent',
                        borderRadius: '50%',
                      }}
                    />
                  ) : (
                    <>{isLogin ? 'Sign In' : 'Create Account'} <FiArrowRight /></>
                  )}
                </motion.button>
              </motion.form>
            </AnimatePresence>
          </div>
        </motion.div>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '20px' }}>
          By continuing, you agree to our{' '}
          <span style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}>Privacy Policy</span>
          {' '}and{' '}
          <span style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}>Terms of Service</span>
        </p>
      </div>
    </div>
  )
}

export default Auth
