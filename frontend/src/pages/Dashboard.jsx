import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useAuthStore from '../store/useAuthStore'
import { FiTrendingUp, FiSmile, FiAlertCircle, FiCalendar, FiArrowRight } from 'react-icons/fi'
import MoodChart from '../components/MoodChart'
import EmotionBreakdown from '../components/EmotionBreakdown'
import StreakDots from '../components/StreakDots'
import JournalCard from '../components/JournalCard'
import InsightPanel from '../components/InsightPanel'
import { getDashboardStats } from '../api/dashboard'
import { BlossomDrift } from '../components/Blossom'
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const StatCard = ({ label, value, sub, subColor, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ y: -4, boxShadow: 'var(--shadow-hover)', borderColor: 'var(--border-hover)' }}
    className="glass-card"
    style={{
      padding: '24px 22px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: '140px',
    }}
  >
    <div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 600, marginBottom: '14px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</p>
      <p style={{ color: 'var(--text-primary)', fontSize: '2.2rem', fontWeight: 700, lineHeight: 1, fontFamily: "'Playfair Display', serif", letterSpacing: '-0.02em' }}>{value}</p>
    </div>
    {sub && (
      <p style={{ color: subColor || 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '12px', fontWeight: 500 }}>
        {sub}
      </p>
    )}
  </motion.div>
)

const DOMINANT_EMOJIS = {
  happy: { emoji: '😊', color: '#2D9E6B' },
  anxious: { emoji: '😰', color: '#D4851A' },
  sad: { emoji: '😢', color: '#3B82F6' },
  angry: { emoji: '😡', color: '#E63946' },
  neutral: { emoji: '😐', color: '#9999BB' },
}

const Dashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [stats, setStats] = useState(null)
  const [period, setPeriod] = useState('week')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const res = await getDashboardStats(period)
      setStats(res.data)
    } catch (err) {
      console.error("Dashboard data load failed:", err)
    } finally {
      setLoading(false)
    }
  }

  const generateWellnessReport = async () => {
    if (!stats) return;
    
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // 1. Header
    doc.setFillColor(230, 57, 70); // Theme color #E63946
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Amore Wellness Report', 20, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 32);
    
    // 2. User Info & Summary
    doc.setTextColor(20, 20, 40);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Hello, ${firstName}`, 20, 55);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`This report summarizes your emotional wellbeing over the last ${period === '3mo' ? '3 months' : period}.`, 20, 62);
    
    // 3. Stats Grid
    doc.setDrawColor(230, 230, 240);
    doc.line(20, 70, pageWidth - 20, 70);
    
    const statsY = 80;
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 120);
    doc.text('MOOD SCORE', 20, statsY);
    doc.text('HAPPY MOMENTS', 70, statsY);
    doc.text('STREAK', 120, statsY);
    doc.text('DOMINANT', 160, statsY);
    
    doc.setFontSize(14);
    doc.setTextColor(20, 20, 40);
    doc.text(String(stats.mood_score), 20, statsY + 8);
    doc.text(String(stats.happy_moments), 70, statsY + 8);
    doc.text(`${stats.streak} days`, 120, statsY + 8);
    doc.text(stats.dominant_emotion.toUpperCase(), 160, statsY + 8);
    
    // 4. Capture Chart
    const chartElem = document.getElementById('mood-chart-capture');
    if (chartElem) {
      const canvas = await html2canvas(chartElem, { scale: 2, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', 20, 110, 170, 70);
    }
    
    // 5. AI Insight
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('AI Wellness Insight', 20, 200);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    const splitInsight = doc.splitTextToSize(stats.ai_insight || "Keep continuing your journaling journey for deeper insights.", pageWidth - 40);
    doc.text(splitInsight, 20, 208);
    
    // 6. Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 170);
    doc.text('Amore — Your Safe Space to Feel and Heal', pageWidth / 2, 285, { align: 'center' });
    
    doc.save(`Amore_Wellness_Report_${period}.pdf`);
  };

  useEffect(() => {
    setLoading(true)
    load()

    // Auto refresh every 5 minutes
    const interval = setInterval(load, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [period])

  const s = stats
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = user?.first_name || user?.username || 'there'

  if (loading && !stats) {
    return (
      <div style={{ minHeight: '100vh', position: 'relative' }}>
        <BlossomDrift />
        <div style={{ padding: '84px 24px 40px', maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: '40px' }}>
            <div className="skeleton" style={{ width: '300px', height: '40px', marginBottom: '10px' }} />
            <div className="skeleton" style={{ width: '200px', height: '20px' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: '140px', borderRadius: '20px' }} />)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '16px', marginBottom: '16px' }}>
            <div className="skeleton" style={{ height: '400px', borderRadius: '20px' }} />
            <div className="skeleton" style={{ height: '400px', borderRadius: '20px' }} />
          </div>
        </div>
      </div>
    )
  }

  const dom = s ? (DOMINANT_EMOJIS[s.dominant_emotion] || DOMINANT_EMOJIS.happy) : DOMINANT_EMOJIS.happy

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <BlossomDrift />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ padding: '84px 24px 40px', maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}
      >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
      >
        <div>
          <h1 style={{ 
            fontSize: 'clamp(2.2rem, 5vw, 3rem)', 
            fontWeight: 400, 
            color: 'var(--text-primary)', 
            fontFamily: "'Playfair Display', serif", 
            letterSpacing: '-0.025em',
            lineHeight: 1.15
          }}>
            {greeting}, <br />
            <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>{firstName}</span> 🌸
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '12px', fontSize: '1.05rem', fontWeight: 400 }}>Here's how you've been feeling this {period === '3mo' ? '3 months' : period} 💕</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-card)', padding: '6px', borderRadius: '14px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
            {['week', 'month', '3mo'].map((p) => (
              <motion.button
                whileHover={{ scale: period === p ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '10px',
                  border: 'none',
                  background: period === p ? 'var(--text-primary)' : 'transparent',
                  color: period === p ? 'var(--bg-primary)' : 'var(--text-muted)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              >
                {p === '3mo' ? '3 months' : p.charAt(0).toUpperCase() + p.slice(1)}
              </motion.button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(124,92,252,0.3)' }}
            whileTap={{ scale: 0.95 }}
            onClick={generateWellnessReport}
            style={{
              padding: '10px 24px',
              borderRadius: '12px',
              background: '#E63946', // Matched theme color
              color: 'white',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(230, 57, 70, 0.2)',
            }}
          >
            <FiTrendingUp size={16} />
            My Health Report
          </motion.button>
        </div>
      </motion.div>

      {/* Top stats row */}
      {s && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <StatCard label="Mood score" value={s.mood_score} sub={`${s.mood_change} vs last week`} delay={0} />
          <StatCard label="Happy moments" value={s.happy_moments} sub={`${s.happy_change} vs last week`} delay={0.05} />
          <StatCard label="Anxious triggers" value={s.anxious_triggers} sub={`${s.anxious_change} vs last week`} subColor="#F59E0B" delay={0.1} />
          <StatCard label="Journal streak" value={`${s.streak} days`} sub={`Best: ${s.personal_best}! 🎉`} delay={0.15} />
        </div>
      )}

      {/* Row 2: Chart + Dominant emotion */}
      {s && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '16px', marginBottom: '16px' }}>
          <motion.div
            id="mood-chart-capture"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{
              background: 'var(--bg-card)',
              border: '1.5px solid var(--border)',
              borderRadius: '20px', padding: '24px',
              backdropFilter: 'blur(16px)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <MoodChart data={s.mood_trend} period={period} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            style={{
              background: 'var(--bg-card)',
              border: '1.5px solid var(--border)',
              borderRadius: '20px', padding: '24px',
              backdropFilter: 'blur(16px)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              textAlign: 'center',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px', fontWeight: 600 }}>
              Dominant emotion
            </p>
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: `${dom.color}15`,
                border: `2px solid ${dom.color}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2.5rem', marginBottom: '16px',
              }}
            >
              {dom.emoji}
            </motion.div>
            <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.3rem', textTransform: 'capitalize' }}>
              {s.dominant_emotion}
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px' }}>
              Confidence: {s.confidence}%
            </p>
          </motion.div>
        </div>
      )}

      {/* Row 3: Emotion breakdown + Recent journals */}
      {s && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          {/* Emotion breakdown + streak */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{
              background: 'var(--bg-card)',
              border: '1.5px solid var(--border)',
              borderRadius: '20px', padding: '24px',
              backdropFilter: 'blur(16px)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <EmotionBreakdown data={s.breakdown} />
            <div style={{ marginTop: '24px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600, marginBottom: '12px' }}>
                Last 7 days check-in
              </p>
              <StreakDots checkedDays={s.checked_days} />
            </div>
          </motion.div>

          {/* Recent journals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            style={{
              background: 'var(--bg-card)',
              border: '1.5px solid var(--border)',
              borderRadius: '20px', padding: '24px',
              backdropFilter: 'blur(16px)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem' }}>Recent journeys 📖</p>
              <button
                onClick={() => navigate('/journal')}
                style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
              >
                View all <FiArrowRight size={12} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {s.recent_entries && s.recent_entries.length > 0 ? s.recent_entries.map((entry, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  onClick={() => navigate('/journal')}
                  whileHover={{ x: 4 }}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '10px',
                    padding: '10px 0', cursor: 'pointer',
                    borderBottom: i < s.recent_entries.length - 1 ? '1px solid var(--border)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, marginTop: '5px',
                    background: entry.emotion === 'happy' ? '#2D9E6B' : entry.emotion === 'anxious' ? '#D4851A' : '#3B82F6',
                  }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ color: 'var(--text-primary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                      {entry.content}
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '3px' }}>
                      {entry.date} · {entry.emotion?.charAt(0).toUpperCase() + entry.emotion?.slice(1)}
                    </p>
                  </div>
                </motion.div>
              )) : (
                <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No entries yet. Start your first journey today! 💭
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Insight panel */}
      {s && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <InsightPanel insight={s.ai_insight} remedy={s.ai_remedy} />
        </motion.div>
      )}
      </motion.div>
    </div>
  )
}

export default Dashboard
