import React from 'react'
import { motion } from 'framer-motion'

const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '12px 16px',
      background: 'rgba(42,42,66,0.9)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '18px 18px 18px 4px',
      width: 'fit-content',
      maxWidth: '80px',
    }}
  >
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="typing-dot"
        style={{ animationDelay: `${i * 0.2}s` }}
      />
    ))}
  </motion.div>
)

export default TypingIndicator
