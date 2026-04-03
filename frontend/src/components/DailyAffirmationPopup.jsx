import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

const AFFIRMATIONS = [
  "I am worthy of peace, joy, and all the good things today brings.",
  "I trust my journey and the strength I carry within me.",
  "I am resilient, capable, and exactly where I need to be.",
  "Every breath I take is a fresh start and a moment of peace.",
  "My feelings are valid, my voice is important, and my presence is a gift.",
  "I choose kindness for myself and grace for my imperfections.",
  "I have the power to create a beautiful day, one moment at a time.",
  "I am proud of how far I have come and excited for where I am going.",
  "Today, I release what I cannot control and focus on my own inner light."
];

const DailyAffirmationPopup = ({ isOpen, onClose }) => {
  // Pick one based on the day of the year to keep it "Daily"
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const affirmation = AFFIRMATIONS[dayOfYear % AFFIRMATIONS.length];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(10, 10, 31, 0.4)', // Dark overlay
            backdropFilter: 'blur(12px)', // High blur as requested
            padding: '24px'
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.05, opacity: 0, y: -20 }}
            className="glass-card"
            style={{
              maxWidth: '500px',
              width: '100%',
              padding: '48px 32px',
              textAlign: 'center',
              position: 'relative',
              background: 'rgba(255, 255, 255, 0.9)', // Clean white glass
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
            }}
          >
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: '#6B6B8A', // Darker close button
                cursor: 'pointer',
                fontSize: '1.2rem'
              }}
            >
              <FiX />
            </button>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h3 style={{ 
                fontFamily: "'Playfair Display', serif", 
                fontSize: '0.9rem', 
                color: '#7C5CFC', 
                textTransform: 'uppercase', 
                letterSpacing: '0.2em',
                marginBottom: '24px',
                fontWeight: 700
              }}>
                Today's Affirmation
              </h3>
              
              <p style={{ 
                fontFamily: "'Playfair Display', serif", 
                fontSize: '1.65rem', 
                lineHeight: 1.5,
                color: '#1a1a3d', // Deep dark text for positivity & legibility
                marginBottom: '40px',
                fontStyle: 'italic',
                fontWeight: 500
              }}>
                "{affirmation}"
              </p>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                style={{
                  background: 'linear-gradient(135deg, #7C5CFC, #9B5CFF)',
                  border: 'none',
                  color: 'white',
                  padding: '14px 32px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 10px 20px rgba(124,92,252,0.3)'
                }}
              >
                Begin Journaling
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DailyAffirmationPopup;
