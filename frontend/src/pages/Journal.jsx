import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiChevronLeft, FiChevronRight, FiPlus, FiCheck, FiTrash2 } from 'react-icons/fi'
import StreakDots from '../components/StreakDots'
import JournalCard from '../components/JournalCard'
import InsightPanel from '../components/InsightPanel'
import { saveEntry, getEntry, getEntries, analyzeEntry } from '../api/journal'
import { getDashboardStats } from '../api/dashboard'
import { BlossomDrift } from '../components/Blossom'
import DailyMoodCalendar from '../components/DailyMoodCalendar'
import DailyAffirmationPopup from '../components/DailyAffirmationPopup'
import useAuthStore from '../store/useAuthStore'

const MOODS = [
  { key: 'happy', label: 'Happy', emoji: '😊', color: '#10B981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.35)' },
  { key: 'sad', label: 'Sad', emoji: '😢', color: '#60A5FA', bg: 'rgba(96,165,250,0.15)', border: 'rgba(96,165,250,0.35)' },
  { key: 'anxious', label: 'Anxious', emoji: '😰', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.35)' },
  { key: 'angry', label: 'Angry', emoji: '😡', color: '#EF4444', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.35)' },
]

const PROMPTS = [
  "What made me smile today, even if it was small? 😊",
  "What's been weighing on my mind lately and why? 💭",
  "One thing I'm grateful for right now... 🙏",
  "What emotion did I feel most strongly today? ✨",
  "If I could change one thing about today, what would it be? 🌙",
]

const formatDate = (date) => {
  return date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })
}

const formatShort = (date) => {
  return date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })
}

const toDateStr = (date) => date.toISOString().split('T')[0]

const MOCK_PAST = []

/* Blossom component moved to shared components/Blossom.jsx */

const Journal = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isAffirmationOpen, setIsAffirmationOpen] = useState(true)
  const [selectedMood, setSelectedMood] = useState(null)
  const [content, setContent] = useState('')
  const [insight, setInsight] = useState(null)
  const [remedy, setRemedy] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pastEntries, setPastEntries] = useState(MOCK_PAST)
  const [saved, setSaved] = useState(false)
  const [stats, setStats] = useState(null)
  
  const { user } = useAuthStore()
  const userTodoKey = user ? `amore_todos_${user.id || user.username}` : 'amore_todos_guest'

  const [todos, setTodos] = useState([])
  const [todoInput, setTodoInput] = useState('')
  const [showCongrats, setShowCongrats] = useState(false)

  const blossoms = [
    { left: '5%',  duration: 18, delay: 0  },
    { left: '25%', duration: 22, delay: 8  },
    { left: '70%', duration: 19, delay: 15 },
    { left: '90%', duration: 24, delay: 4  },
  ]

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0

  const prevDay = () => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() - 1)
    setCurrentDate(d)
    setContent('')
    setSelectedMood(null)
    setInsight(null)
    setRemedy(null)
    setSaved(false)
  }

  const nextDay = () => {
    const now = new Date()
    const d = new Date(currentDate)
    d.setDate(d.getDate() + 1)
    if (d <= now) {
      setCurrentDate(d)
      setContent('')
      setSelectedMood(null)
      setInsight(null)
      setRemedy(null)
      setSaved(false)
    }
  }

  useEffect(() => {
    const load = async () => {
      // 0. RESET STATE IMMEDIATELY to prevent persistence
      setContent('')
      setSelectedMood(null)
      setInsight(null)
      setRemedy(null)
      setSaved(false)

      // 1. Get the specific entry for this date if it exists
      // ONLY auto-load for past dates to keep "Today" clean as requested
      const todayStr = toDateStr(new Date())
      const isToday = toDateStr(currentDate) === todayStr

      if (!isToday) {
        try {
          const res = await getEntry(toDateStr(currentDate))
          if (res.data) {
            setContent(res.data.content || '')
            setSelectedMood(res.data.manual_mood || res.data.detected_emotion || null)
            setInsight(res.data.insight_text || null)
            setRemedy(res.data.remedy_text || null)
          }
        } catch (err) {
          // Already cleared above
        }
      }

      // 2. Get all past entries for the sidebar
      try {
        const res = await getEntries()
        if (res.data) setPastEntries(res.data)
      } catch (err) {
        console.error("Failed to load past entries:", err)
      }

      // 3. Get streak stats
      try {
        const s = await getDashboardStats()
        setStats(s.data)
      } catch (err) {}
    }
    load()
  }, [currentDate])

  useEffect(() => {
    if (userTodoKey) {
      const savedTodos = localStorage.getItem(userTodoKey)
      setTodos(savedTodos ? JSON.parse(savedTodos) : [])
    }
  }, [userTodoKey])

  useEffect(() => {
    if (userTodoKey) {
      localStorage.setItem(userTodoKey, JSON.stringify(todos))
    }
  }, [todos, userTodoKey])

  const addTodo = (e) => {
    if (e) e.preventDefault()
    if (!todoInput.trim()) return
    const newTodo = {
      id: Date.now(),
      text: todoInput.trim(),
      completed: false
    }
    setTodos([newTodo, ...todos])
    setTodoInput('')
  }

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => {
      if (todo.id === id) {
        const newStatus = !todo.completed
        if (newStatus) {
          setShowCongrats(true)
          setTimeout(() => setShowCongrats(false), 3000)
        }
        return { ...todo, completed: newStatus }
      }
      return todo
    }))
  }

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  const handleAnalyze = async () => {
    if (!content.trim()) return
    setAnalyzing(true)
    setInsight(null) // Reset before new analysis
    
    try {
      const res = await analyzeEntry(content, selectedMood, toDateStr(currentDate))
      
      // Update state with AI analysis results
      setInsight(res.data?.insight_text || res.data?.insight || "Analysis complete.")
      setRemedy(res.data?.remedy_text || res.data?.remedy || null)
      
      if (res.data?.detected_emotion) {
        // We don't necessarily override selectedMood if user picked one manually,
        // but often we want to show the 'detected' one in the UI tags.
        // For now, let's keep selectedMood as the 'manual' one.
      }
    } catch (err) {
      console.error("Analysis failed:", err)
      setInsight("I'm having trouble analyzing this right now, but I'm still listening. Your thoughts are valid.")
    } finally {
      setAnalyzing(false)
    }
  }

  const handleSave = async () => {
    if (!content.trim()) return
    setSaving(true)
    setSaved(false)
    
    try {
      await saveEntry({ 
        date: toDateStr(currentDate), 
        content, 
        manual_mood: selectedMood 
      })
      
      setSaved(true)
      
      // Refresh sidebar list instantly
      const entriesRes = await getEntries()
      if (entriesRes.data) setPastEntries(entriesRes.data)
      
      // Refresh streak
      const statsRes = await getDashboardStats()
      if (statsRes.data) setStats(statsRes.data)

      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error("Save failed:", err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <BlossomDrift />
      <DailyAffirmationPopup 
        isOpen={isAffirmationOpen} 
        onClose={() => setIsAffirmationOpen(false)} 
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ padding: '80px 24px 40px', maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}
      >

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px', position: 'relative', zIndex: 1 }}>
        {/* Left: Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Date card */}
          <motion.div
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
            className="glass-card"
            style={{
              padding: '28px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ 
                fontSize: 'clamp(1.5rem, 3vw, 2rem)', 
                fontWeight: 400, 
                color: 'var(--text-primary)',
                fontFamily: "'Playfair Display', serif",
                letterSpacing: '-0.02em'
              }}>
                {formatDate(currentDate)}
              </h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[{ icon: <FiChevronLeft />, action: prevDay }, { icon: <FiChevronRight />, action: nextDay }].map(({ icon, action }, i) => (
                  <motion.button key={i} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={action}
                    style={{
                      width: '36px', height: '36px', borderRadius: '10px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#9B9BC0', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {icon}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Mood picker */}
            <p style={{ color: '#9B9BC0', fontSize: '0.83rem', marginBottom: '12px' }}>How are you feeling today?</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              {MOODS.map(({ key, label, emoji, color, bg, border }) => (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={() => setSelectedMood(selectedMood === key ? null : key)}
                  style={{
                    flex: 1, padding: '12px 8px',
                    borderRadius: '14px',
                    background: selectedMood === key ? bg : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${selectedMood === key ? border : 'rgba(255,255,255,0.06)'}`,
                    color: selectedMood === key ? color : '#9B9BC0',
                    cursor: 'pointer', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: '6px',
                    transition: 'all 0.2s',
                    boxShadow: selectedMood === key ? `0 0 15px ${color}22` : 'none',
                  }}
                >
                  <span style={{ fontSize: '1.4rem' }}>{emoji}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Text editor */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-card"
            style={{
              padding: '28px',
            }}
          >
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your thoughts..."
              className="input-dark"
              style={{
                width: '100%', minHeight: '240px',
                fontSize: '1rem', lineHeight: 1.8,
                padding: '20px', resize: 'vertical',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
              <span style={{ color: '#6B6B8A', fontSize: '0.8rem' }}>{wordCount} words</span>
              <div style={{ display: 'flex', gap: '10px' }}>
                {content.trim() && (
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={handleSave}
                    style={{
                      padding: '10px 20px', borderRadius: '12px',
                      background: saved ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)',
                      border: saved ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.08)',
                      color: saved ? '#10B981' : '#9B9BC0',
                      cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                    }}
                  >
                    {saving ? '...' : saved ? '✓ Saved' : 'Save'}
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={handleAnalyze}
                  disabled={analyzing || !content.trim()}
                  style={{
                    padding: '10px 22px', borderRadius: '12px',
                    background: !content.trim() ? 'rgba(124,92,252,0.3)' : 'linear-gradient(135deg, #7C5CFC, #9B5CFF)',
                    border: 'none', color: 'white',
                    cursor: !content.trim() ? 'not-allowed' : 'pointer',
                    fontWeight: 700, fontSize: '0.88rem',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    boxShadow: content.trim() ? '0 4px 15px rgba(124,92,252,0.3)' : 'none',
                  }}
                >
                  {analyzing ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{ width: '14px', height: '14px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }}
                    />
                  ) : null}
                  {analyzing ? 'Analyzing...' : 'Analyze with AI'}
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Insight panel */}
          <AnimatePresence>
            {insight && (
              <InsightPanel 
                insight={insight} 
                remedy={remedy} 
                onClose={() => { setInsight(null); setRemedy(null) }} 
              />
            )}
          </AnimatePresence>

          {/* Writing prompts */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass-card"
            style={{
              padding: '28px',
            }}
          >
            <p style={{ color: 'var(--text-primary)', fontSize: '0.83rem', fontWeight: 600, marginBottom: '14px' }}>
              Writing prompts — need inspiration?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {PROMPTS.map((prompt, i) => (
                <motion.button
                  key={i}
                  whileHover={{ background: 'rgba(124,92,252,0.08)', borderColor: 'rgba(124,92,252,0.2)' }}
                  onClick={() => setContent(prev => prev ? `${prev}\n\n${prompt}\n` : `${prompt}\n`)}
                  style={{
                    textAlign: 'left', padding: '12px 16px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px', color: 'var(--text-primary)',
                    fontSize: '0.85rem', cursor: 'pointer',
                    transition: 'all 0.2s', lineHeight: 1.4,
                  }}
                >
                  {prompt}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* To-do List */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="glass-card"
            style={{
              padding: '28px',
            }}
          >
            <p style={{ color: 'var(--text-primary)', fontSize: '0.83rem', fontWeight: 600, marginBottom: '14px' }}>
              To-do List — track your progress
            </p>
            
            <form onSubmit={addTodo} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input
                type="text"
                value={todoInput}
                onChange={(e) => setTodoInput(e.target.value)}
                placeholder="What needs to be done?"
                className="input-dark"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontSize: '0.85rem'
                }}
              />
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                type="submit"
                style={{
                  padding: '0 16px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #7C5CFC, #9B5CFF)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FiPlus size={20} />
              </motion.button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {todos.length > 0 ? todos.map((todo) => (
                <motion.div
                  key={todo.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: todo.completed ? 'none' : '2px solid rgba(124,92,252,0.4)',
                      background: todo.completed ? 'linear-gradient(135deg, #7C5CFC, #9B5CFF)' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                      transition: 'all 0.2s'
                    }}
                  >
                    {todo.completed && <FiCheck size={14} color="white" />}
                  </button>
                  <span style={{ 
                    flex: 1,
                    fontSize: '0.9rem',
                    color: todo.completed ? '#6B6B8A' : 'var(--text-primary)',
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    transition: 'all 0.2s'
                  }}>
                    {todo.text}
                  </span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#4A4A6A',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <FiTrash2 size={16} />
                  </button>
                </motion.div>
              )) : (
                <p style={{ textAlign: 'center', color: '#6B6B8A', fontSize: '0.85rem', padding: '10px 0' }}>
                  No tasks for today. Stay peaceful. 🌿
                </p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Streak */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
            className="glass-card"
            style={{
              padding: '24px',
            }}
          >
            <p style={{ color: 'var(--text-primary)', fontSize: '0.83rem', fontWeight: 600, marginBottom: '14px' }}>
              This week's streak
            </p>
            <StreakDots checkedDays={stats?.checked_days || []} />
            <p style={{ color: 'var(--text-primary)', fontSize: '0.82rem', fontWeight: 600, marginTop: '12px' }}>
              {stats?.streak || 0}-day streak — keep it going!
            </p>
          </motion.div>

          {/* Daily Mood Calendar */}
          <DailyMoodCalendar entries={pastEntries} />

          {/* Past entries */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="glass-card"
            style={{
              padding: '24px',
              flex: 1,
            }}
          >
            <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem', marginBottom: '16px' }}>
              Past entries
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pastEntries.length > 0 ? pastEntries.map((entry) => (
                <motion.div
                  key={entry.id || entry.date}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <JournalCard
                    entry={entry}
                    onClick={() => {
                      setCurrentDate(new Date(entry.date))
                      setContent(entry.content)
                      setSelectedMood(entry.manual_mood || entry.detected_emotion)
                    }}
                  />
                </motion.div>
              )) : (
                <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.6 }}>
                   <p style={{ fontSize: '1.5rem', marginBottom: '10px' }}>📖</p>
                   <p style={{ fontSize: '0.8rem' }}>Your journal is empty. Tell us about your journey.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      </motion.div>

      {/* Congratulations Popup */}
      <AnimatePresence>
        {showCongrats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(10, 10, 31, 0.4)',
              backdropFilter: 'blur(8px)',
              pointerEvents: 'none'
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.1, opacity: 0, y: -20 }}
              className="glass-card"
              style={{
                padding: '40px 60px',
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid white',
                boxShadow: '0 20px 40px rgba(124,92,252,0.3)',
                pointerEvents: 'auto'
              }}
            >
              <h2 style={{ 
                fontFamily: "'Playfair Display', serif", 
                fontSize: '2rem', 
                color: '#7C5CFC',
                marginBottom: '10px'
              }}>
                Congratulations! 🎉
              </h2>
              <p style={{ color: '#1a1a3d', fontSize: '1.1rem', fontWeight: 500 }}>
                You've completed a milestone today. Keep up the great work!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCongrats(false)}
                style={{
                  marginTop: '24px',
                  background: 'linear-gradient(135deg, #7C5CFC, #9B5CFF)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 30px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Wonderful!
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Journal
