import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiClock, FiStar, FiX, FiHeart } from 'react-icons/fi'

const InsightPanel = ({ insight, remedy, onClose }) => (
  <AnimatePresence>
    {insight && (
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        className="glass-card"
        style={{
          background: 'var(--accent-light)',
          border: '1px solid var(--accent-glow)',
          padding: '24px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            boxShadow: '0 4px 12px var(--accent-glow)'
          }}>
            <FiStar size={18} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ 
              color: 'var(--accent)', 
              fontWeight: 700, 
              fontSize: '0.75rem', 
              marginBottom: '6px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase'
            }}>
              Amore AI Insight
            </p>
            <p style={{
              color: 'var(--text-primary)',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              fontWeight: 450,
            }}>
              "{insight}"
            </p>
          </div>
          {onClose && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
            >
              <FiX size={18} />
            </motion.button>
          )}
        </div>

        {remedy && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              paddingTop: '20px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: '16px',
              alignItems: 'flex-start'
            }}
          >
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              boxShadow: '0 4px 12px rgba(255,107,122,0.15)',
              border: '1px solid rgba(255,107,122,0.1)'
            }}>
              <FiHeart size={18} color="#FF6B7A" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ 
                color: '#FF6B7A', 
                fontWeight: 700, 
                fontSize: '0.75rem', 
                marginBottom: '6px',
                letterSpacing: '0.06em',
                textTransform: 'uppercase'
              }}>
                Amore Remedy 🌸
              </p>
              <p style={{
                color: 'var(--text-primary)',
                fontSize: '0.92rem',
                lineHeight: 1.6,
                fontWeight: 450,
                background: 'rgba(255,255,255,0.4)',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.5)'
              }}>
                {remedy}
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    )}
  </AnimatePresence>
)

export default InsightPanel
