import React from 'react'
import { motion } from 'framer-motion'

const EMOTIONS = [
  { key: 'happy', label: 'Happy', color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
  { key: 'anxious', label: 'Anxious', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
  { key: 'sad', label: 'Sad', color: '#60A5FA', bg: 'rgba(96,165,250,0.15)' },
  { key: 'angry', label: 'Angry', color: '#EF4444', bg: 'rgba(239,68,68,0.15)' },
]

const EmotionBreakdown = ({ data }) => {
  const mockData = { happy: 62, anxious: 20, sad: 11, angry: 7 }
  const breakdown = data || mockData

  return (
    <div>
      <h3 style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem', marginBottom: '18px' }}>
        Emotion breakdown
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {EMOTIONS.map(({ key, label, color, bg }, idx) => {
          const pct = breakdown[key] || 0
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 500 }}>{label}</span>
                <span style={{ color, fontSize: '0.85rem', fontWeight: 700 }}>{pct}%</span>
              </div>
              <div style={{
                height: '8px', borderRadius: '4px',
                background: 'var(--bg-secondary)', overflow: 'hidden',
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, delay: idx * 0.1, ease: 'easeOut' }}
                  style={{
                    height: '100%',
                    background: `linear-gradient(90deg, ${color}, ${color}aa)`,
                    borderRadius: '4px',
                  }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default EmotionBreakdown
