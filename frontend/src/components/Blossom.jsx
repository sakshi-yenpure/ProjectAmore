import React from 'react'
import { motion } from 'framer-motion'

const Blossom = ({ left, duration, delay }) => (
  <motion.div
    initial={{ y: '-5vh', x: 0, rotate: 0, opacity: 0 }}
    animate={{ y: '105vh', x: [0, 18, -12, 24, 0], rotate: [0, 90, 180, 360, 480], opacity: [0, 0.3, 0.3, 0.3, 0] }}
    transition={{ duration, delay, repeat: Infinity, ease: 'linear', times: [0, 0.05, 0.5, 0.95, 1] }}
    style={{
      position: 'fixed', top: 0, left,
      fontSize: '0.9rem',
      pointerEvents: 'none', zIndex: 0, userSelect: 'none',
      filter: 'saturate(0.5) brightness(0.85)',
    }}
  >
    🌸
  </motion.div>
)

export const BlossomDrift = () => {
  const blossoms = [
    { left: '5%',  duration: 18, delay: 0  },
    { left: '22%', duration: 22, delay: 7  },
    { left: '68%', duration: 19, delay: 12 },
    { left: '88%', duration: 24, delay: 3  },
  ]
  return blossoms.map((b, i) => <Blossom key={i} {...b} />)
}

export default Blossom
