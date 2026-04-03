import React from 'react';
import { motion } from 'framer-motion';
import { EMOTION_CONFIG } from './EmotionTag';

const DailyMoodCalendar = ({ entries = [] }) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // Get first day of month (0 = Sunday, 1 = Monday...)
  const firstDay = new Date(year, month, 1).getDay();
  // Get total days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Create an object mapping date strings to moods
  const moodMap = {};
  entries.forEach(entry => {
    if (entry.date) {
      moodMap[entry.date] = entry.manual_mood || entry.detected_emotion || 'neutral';
    }
  });

  const days = [];
  // Padding for the first day of the week
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  // Actual days
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  const monthName = now.toLocaleString('default', { month: 'long' });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.18 }}
      className="glass-card"
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: 'var(--text-primary)', fontSize: '0.83rem', fontWeight: 600 }}>
          {monthName} Reflection
        </p>
        <span style={{ fontSize: '0.75rem', color: '#6B6B8A' }}>{year}</span>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: '6px',
        textAlign: 'center'
      }}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
          <span key={day} style={{ fontSize: '0.65rem', color: '#6B6B8A', fontWeight: 600, paddingBottom: '4px' }}>
            {day}
          </span>
        ))}
        
        {days.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;
          
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const mood = moodMap[dateStr];
          const isToday = day === now.getDate() && month === now.getMonth();

          return (
            <motion.div
              key={day}
              whileHover={{ scale: 1.1 }}
              style={{
                aspectRatio: '1/1',
                borderRadius: '8px',
                background: isToday ? 'rgba(124,92,252,0.15)' : 'rgba(255,255,255,0.03)',
                border: isToday ? '1px solid rgba(124,92,252,0.3)' : '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: mood ? '0.9rem' : '0.65rem',
                color: isToday ? 'var(--text-primary)' : '#6B6B8A',
                position: 'relative'
              }}
            >
              {mood ? EMOTION_CONFIG[mood.toLowerCase()]?.emoji || '✨' : day}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default DailyMoodCalendar;
