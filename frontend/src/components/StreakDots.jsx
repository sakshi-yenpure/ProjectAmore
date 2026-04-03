import React from 'react'
import { motion } from 'framer-motion'

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const StreakDots = ({ checkedDays = [0, 1, 2, 3, 4, 5] }) => {
  return (
    <div>
      <div style={{ display: 'flex', gap: '8px' }}>
        {DAYS.map((day, idx) => {
          const isChecked = checkedDays.includes(idx)
          return (
            <motion.div
              key={idx}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: idx * 0.06, type: 'spring', stiffness: 300 }}
              style={{
                width: '34px', height: '34px',
                borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: isChecked ? '1.1rem' : '0.78rem',
                background: isChecked
                  ? '#111111'
                  : 'var(--bg-secondary)',
                color: isChecked ? 'white' : 'var(--text-muted)',
                border: isChecked ? 'none' : '1px solid var(--border)',
                boxShadow: isChecked ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
              }}
            >
              {isChecked ? '❤️' : day}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default StreakDots
