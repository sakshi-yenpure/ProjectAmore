import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import EmotionTag from './EmotionTag'

const MessageBubble = ({ message, isUser }) => {
  const formatTime = (ts) => {
    const d = new Date(ts)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '4px',
        gap: '4px',
      }}
    >
      <div
        style={{
          maxWidth: '72%',
          padding: '12px 16px',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          background: isUser
            ? 'linear-gradient(135deg, #7C5CFC, #9B5CFF)'
            : 'rgba(42,42,66,0.95)',
          border: isUser ? 'none' : '1px solid rgba(255,255,255,0.06)',
          color: '#F0EFFF',
          fontSize: '0.9rem',
          lineHeight: 1.6,
          boxShadow: isUser
            ? '0 4px 15px rgba(124,92,252,0.3)'
            : '0 2px 8px rgba(0,0,0,0.2)',
        }}
      >
        {message.content}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: isUser ? 0 : '4px', paddingRight: isUser ? '4px' : 0 }}>
        {message.emotion && isUser && (
          <EmotionTag emotion={message.emotion} size="xs" />
        )}
        <span style={{ color: '#6B6B8A', fontSize: '0.7rem' }}>
          {message.timestamp ? formatTime(message.timestamp) : ''}
        </span>
      </div>
    </motion.div>
  )
}

export default MessageBubble
