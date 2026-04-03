import React from 'react'
import { motion } from 'framer-motion'
import EmotionTag from './EmotionTag'

const JournalCard = ({ entry, onClick }) => {
  const formatDate = (dateStr) => {
    const opts = { weekday: 'long', day: 'numeric', month: 'short' }
    return new Date(dateStr).toLocaleDateString('en-US', opts)
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02, borderColor: 'var(--accent-glow)', background: 'var(--accent-light)' }}
      onClick={onClick}
      className="glass-card"
      style={{
        padding: '16px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '-0.01em' }}>
          {entry?.date ? formatDate(entry.date) : 'Today'}
        </span>
        {entry?.emotion && <EmotionTag emotion={entry.emotion} size="xs" />}
      </div>
      <p style={{
        color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.55,
        overflow: 'hidden', display: '-webkit-box',
        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
      }}>
        {entry?.content || 'No content yet...'}
      </p>
    </motion.div>
  )
}

export default JournalCard
