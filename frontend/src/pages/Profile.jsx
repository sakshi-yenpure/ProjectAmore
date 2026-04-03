import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiUser, FiMail, FiCalendar, FiAward, FiTarget, FiHash } from 'react-icons/fi'
import useAuthStore from '../store/useAuthStore'
import { getMe } from '../api/auth'
import { getDashboardStats } from '../api/dashboard'
import { BlossomDrift } from '../components/Blossom'
import StreakDots from '../components/StreakDots'
import EmotionBreakdown from '../components/EmotionBreakdown'

const ProfileStat = ({ icon: Icon, label, value, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-card"
    style={{
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      border: '1px solid var(--border)',
    }}
  >
    <div style={{
      width: '48px', height: '48px', borderRadius: '14px',
      background: 'var(--accent-light)', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      color: 'var(--accent)', fontSize: '1.2rem',
    }}>
      <Icon />
    </div>
    <div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      <p style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 700 }}>{value}</p>
    </div>
  </motion.div>
)

const Profile = () => {
  const { user, updateUser } = useAuthStore()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meRes, statsRes] = await Promise.all([
          getMe(),
          getDashboardStats('week')
        ])
        updateUser(meRes.data)
        setStats(statsRes.data)
      } catch (err) {
        console.error("Failed to fetch profile data:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', position: 'relative' }}>
        <BlossomDrift />
        <div style={{ padding: '100px 24px', maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <div className="skeleton" style={{ width: '120px', height: '120px', borderRadius: '50%', margin: '0 auto 24px' }} />
          <div className="skeleton" style={{ width: '240px', height: '32px', margin: '0 auto 12px' }} />
          <div className="skeleton" style={{ width: '180px', height: '20px', margin: '0 auto 40px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: '88px', borderRadius: '16px' }} />)}
          </div>
        </div>
      </div>
    )
  }

  const joinDate = user?.date_joined ? new Date(user.date_joined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <BlossomDrift />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ padding: '100px 24px 60px', maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}
      >
        {/* Profile Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 20 }}
            style={{
              width: '120px', height: '120px', borderRadius: '40px',
              background: 'linear-gradient(135deg, var(--accent), #FF6B7A)',
              margin: '0 auto 24px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '3.5rem', color: 'white',
              boxShadow: '0 12px 30px var(--accent-glow)',
              fontFamily: "'Playfair Display', serif", fontStyle: 'italic'
            }}
          >
            {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
          </motion.div>
          <motion.h1
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            style={{
              fontSize: '2.5rem', fontWeight: 400, color: 'var(--text-primary)',
              fontFamily: "'Playfair Display', serif", marginBottom: '8px'
            }}
          >
            {user?.first_name} {user?.last_name}
          </motion.h1>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}
          >
            @{user?.username} · Journeying since {joinDate}
          </motion.p>
        </div>

        {/* User Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '40px' }}>
          <ProfileStat icon={FiUser} label="Full Name" value={`${user?.first_name || 'Not'} ${user?.last_name || 'Set'}`} delay={0.2} />
          <ProfileStat icon={FiMail} label="Email Address" value={user?.email || 'No email provided'} delay={0.25} />
          <ProfileStat icon={FiHash} label="User ID" value={`#${user?.id || '0000'}`} delay={0.3} />
          <ProfileStat icon={FiCalendar} label="Date Joined" value={joinDate} delay={0.35} />
        </div>

        {/* Stats Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          {/* Streaks Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card"
            style={{ padding: '28px', border: '1px solid var(--border)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <FiAward style={{ color: 'var(--accent)', fontSize: '1.4rem' }} />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>Your Streaks</h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Current</p>
                <p style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent)' }}>{stats?.streak || 0}</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Days</p>
              </div>
              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Best</p>
                <p style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{stats?.personal_best || 0}</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Days</p>
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '16px' }}>Weekly Progress</p>
            <StreakDots checkedDays={stats?.checked_days || []} />
          </motion.div>

          {/* Mood Calendar / Emotion Breakdown */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45 }}
            className="glass-card"
            style={{ padding: '28px', border: '1px solid var(--border)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <FiTarget style={{ color: 'var(--accent)', fontSize: '1.4rem' }} />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>Emotional Balance</h2>
            </div>
            
            <EmotionBreakdown data={stats?.breakdown || { happy: 100 }} />
            
            <div style={{ marginTop: '24px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '1.5rem' }}>✨</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {stats?.streak > 0 
                  ? `You've been consistent for ${stats.streak} days. Keep it up!`
                  : "Start your first journey today to begin your emotional wellness streak."}
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default Profile
