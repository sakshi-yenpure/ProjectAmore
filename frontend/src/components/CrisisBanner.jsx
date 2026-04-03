import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiAlertTriangle, FiX, FiPhone } from 'react-icons/fi'

const CrisisBanner = ({ onClose }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{
        background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.08))',
        border: '1px solid rgba(239,68,68,0.4)',
        borderRadius: '12px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '12px',
      }}
    >
      <div style={{
        width: '36px', height: '36px', borderRadius: '50%',
        background: 'rgba(239,68,68,0.2)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <FiAlertTriangle size={16} color="#EF4444" />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ color: '#EF4444', fontWeight: 600, fontSize: '0.85rem', marginBottom: '2px' }}>
          You seem to be going through a tough time
        </p>
        <p style={{ color: 'rgba(239,68,68,0.8)', fontSize: '0.78rem' }}>
          You're not alone. Reach out to a professional if needed.{' '}
          <a
            href="tel:988"
            style={{ color: '#EF4444', fontWeight: 700, textDecoration: 'underline' }}
          >
            <FiPhone size={11} style={{ display: 'inline', marginRight: '3px' }} />
            Call 988 (Crisis Lifeline)
          </a>
        </p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'rgba(239,68,68,0.6)', cursor: 'pointer' }}
        >
          <FiX size={16} />
        </button>
      )}
    </motion.div>
  </AnimatePresence>
)

export default CrisisBanner
