import React from 'react'
import { motion } from 'framer-motion'

const EMOTION_CONFIG = {
  happy: { color: '#10B981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', emoji: '😊' },
  sad: { color: '#60A5FA', bg: 'rgba(96,165,250,0.15)', border: 'rgba(96,165,250,0.3)', emoji: '😢' },
  anxious: { color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', emoji: '😰' },
  angry: { color: '#EF4444', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', emoji: '😡' },
  neutral: { color: '#9B9BC0', bg: 'rgba(155,155,192,0.15)', border: 'rgba(155,155,192,0.3)', emoji: '😐' },
  surprise: { color: '#FBB724', bg: 'rgba(251,183,36,0.15)', border: 'rgba(251,183,36,0.3)', emoji: '😲' },
  disgust: { color: '#22C55E', bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.3)', emoji: '🤢' },
  fear: { color: '#A855F7', bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.3)', emoji: '😨' },
}

const EmotionTag = ({ emotion, showEmoji = true, size = 'sm' }) => {
  const key = emotion?.toLowerCase() || 'neutral'
  const config = EMOTION_CONFIG[key] || EMOTION_CONFIG.neutral

  const sizeStyles = {
    xs: { padding: '2px 8px', fontSize: '0.65rem' },
    sm: { padding: '3px 10px', fontSize: '0.72rem' },
    md: { padding: '5px 14px', fontSize: '0.82rem' },
  }

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        borderRadius: '20px',
        fontWeight: 600,
        textTransform: 'capitalize',
        ...sizeStyles[size],
      }}
    >
      {showEmoji && <span>{config.emoji}</span>}
      {key}
    </motion.span>
  )
}

export default EmotionTag
export { EMOTION_CONFIG }
