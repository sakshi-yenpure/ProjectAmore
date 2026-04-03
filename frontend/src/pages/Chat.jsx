import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiPlus, FiSend, FiHeart, FiSettings, FiCheck, FiImage, FiUser } from 'react-icons/fi'
import useAuthStore from '../store/useAuthStore'
import EmotionTag from '../components/EmotionTag'
import { getSessions, createSession, getMessages, sendMessage, deleteSession } from '../api/chat'
import { BlossomDrift } from '../components/Blossom'

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user'
  const EMOTION_COLORS = { happy: '#2D9E6B', anxious: '#D4851A', sad: '#3B82F6', angry: '#E63946', neutral: '#9999BB' }
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        gap: '10px',
        marginBottom: '8px',
      }}
    >
      {!isUser && (
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'var(--bg-secondary)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: '0.9rem', flexShrink: 0, border: '1px solid var(--border)'
        }}>🌸</div>
      )}
      <div style={{
        maxWidth: '70%',
        background: isUser ? 'var(--text-primary)' : 'var(--bg-card)',
        color: isUser ? 'var(--bg-primary)' : 'var(--text-primary)',
        borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
        padding: '12px 16px',
        fontSize: '0.92rem',
        lineHeight: 1.6,
        border: isUser ? 'none' : '1px solid var(--border)',
        boxShadow: 'var(--shadow-card)',
      }}>
        <p>{message.content}</p>
        {message.emotion && (
          <div style={{ marginTop: '6px' }}>
            <span style={{
              fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px',
              borderRadius: '20px', background: `${EMOTION_COLORS[message.emotion]}22`,
              color: EMOTION_COLORS[message.emotion],
            }}>
              {message.emotion}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: '20px 20px 20px 4px', padding: '14px 18px',
      display: 'flex', gap: '4px', alignItems: 'center',
    }}
  >
    {[0, 1, 2].map(i => (
      <motion.div key={i}
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)' }}
      />
    ))}
  </motion.div>
)

const CrisisBanner = ({ onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
    style={{
      background: 'linear-gradient(135deg, #E63946, #FF6B7A)',
      borderRadius: '16px', padding: '16px 20px', marginBottom: '16px',
      color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}
  >
    <div>
      <p style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '4px' }}>🆘 We care about you</p>
      <p style={{ fontSize: '0.82rem', opacity: 0.9 }}>
        If you're in crisis, please contact iCall: <strong>9152987821</strong> or Vandrevala Foundation: <strong>1860-2662-345</strong>
      </p>
    </div>
    <button onClick={onClose}
      style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontWeight: 600 }}>
      ✕
    </button>
  </motion.div>
)

const CRISIS_KEYWORDS = ['suicide', 'kill myself', 'end my life', 'want to die', 'harm myself', 'self harm', 'no reason to live']
const isCrisis = (text) => CRISIS_KEYWORDS.some(k => text.toLowerCase().includes(k))

const BACKGROUNDS = [
  { id: 'none', label: 'Default Solid', url: '' },
  { id: 'clouds', label: 'Sky Blue', url: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?q=80&w=2000&auto=format&fit=crop' },
  { id: 'forest', label: 'Zen Forest', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2000&auto=format&fit=crop' },
  { id: 'sunset', label: 'Warm Sunset', url: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?q=80&w=2000&auto=format&fit=crop' },
  { id: 'waves', label: 'Fluid Waves', url: 'https://images.unsplash.com/photo-1505118380757-91f5f45d8de4?q=80&w=2000&auto=format&fit=crop' },
  { id: 'beige', label: 'Minimalist', url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2000&auto=format&fit=crop' }
]

const Chat = () => {
  const { user } = useAuthStore()
  const [sessions, setSessions] = useState([])
  const [activeSession, setActiveSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [showCrisis, setShowCrisis] = useState(false)
  const [search, setSearch] = useState('')
  const [sessionEmotion, setSessionEmotion] = useState(null)
  const [chatBg, setChatBg] = useState(() => localStorage.getItem('chatBg') || 'none')
  const [showSettings, setShowSettings] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const handleBgChange = (id) => {
    setChatBg(id)
    localStorage.setItem('chatBg', id)
    setShowSettings(false)
  }

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, typing])

  const loadSessions = async (shouldSetActive = false) => {
    try {
      const res = await getSessions()
      if (res.data) {
        setSessions(res.data)
        if (shouldSetActive && res.data.length > 0) {
          // If we just created a session, it will be the first one (ordered by updated_at)
          loadMessages(res.data[0])
        }
      }
    } catch (err) {
      console.error("Failed to load sessions:", err)
    }
  }

  useEffect(() => {
    loadSessions()
  }, [])

  const loadMessages = async (session) => {
    setActiveSession(session)
    setMessages([])
    setTyping(true)
    try {
      const res = await getMessages(session.id)
      setMessages(res.data || [])
      // Find the latest user message with an emotion
      const lastUserMsg = [...(res.data || [])].reverse().find(m => m.role === 'user' && m.emotion)
      if (lastUserMsg) setSessionEmotion(lastUserMsg.emotion)
      else setSessionEmotion(null)
    } catch (err) {
      console.error("Failed to load messages:", err)
    } finally {
      setTyping(false)
    }
  }

  const handleNewSession = async () => {
    try {
      const res = await createSession()
      const newSession = res.data
      setSessions(prev => [newSession, ...prev])
      loadMessages(newSession)
    } catch (err) {
      console.error("Failed to create session:", err)
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return
    
    let currentSession = activeSession
    
    // Auto-create session if none active
    if (!currentSession) {
      try {
        const res = await createSession()
        currentSession = res.data
        setSessions(prev => [currentSession, ...prev])
        setActiveSession(currentSession)
      } catch (err) {
        console.error("Failed to auto-create session:", err)
        return
      }
    }

    const text = input.trim()
    setInput('')
    
    // Optimistic user message with temporary robust ID
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const tempUserMsg = {
      id: tempId,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      emotion: null
    }
    setMessages(prev => [...prev, tempUserMsg])
    setTyping(true)

    try {
      const res = await sendMessage(text, currentSession.id)
      const { ai_reply, emotion, is_crisis, session_title, user_message_id, ai_message_id } = res.data
      
      // Update with persistent IDs from backend
      const aiMsg = {
        id: ai_message_id || (Date.now() + 1),
        role: 'ai',
        content: ai_reply,
        timestamp: new Date().toISOString()
      }
      
      setMessages(prev => {
        // Find the index of our optimistic message
        const lastIdx = prev.findIndex(m => m.id === tempId)
        if (lastIdx === -1) return [...prev, aiMsg] // Fallback

        const newMsgs = [...prev]
        newMsgs[lastIdx] = { ...newMsgs[lastIdx], id: user_message_id || tempId, emotion: emotion }
        newMsgs.push(aiMsg)
        return newMsgs
      })

      if (emotion) setSessionEmotion(emotion)
      if (is_crisis) setShowCrisis(true)
      
      // If the session title was updated (auto-titling), update the sidebar
      if (session_title && session_title !== currentSession.title) {
        setActiveSession(prev => ({ ...prev, title: session_title }))
        loadSessions() // Refresh sidebar titles and previews
      } else {
          loadSessions()
      }

    } catch (err) {
      console.error("Failed to send message:", err)
    } finally {
      setTyping(false)
    }
  }

  const getEmpathyResponse = (text, emotion) => {
    const responses = {
      anxious: ["I can sense there's a lot on your mind. Take a deep breath — you don't have to face everything at once. What feels most pressing right now?",
        "Feeling overwhelmed is completely valid. Let's slow down together. Can you tell me more about what's making you anxious?"],
      sad: ["I'm sorry you're going through this. Your feelings are completely valid, and I'm here to listen. What's been weighing on your heart?",
        "It sounds like things have been really hard lately. You don't have to carry this alone. Want to talk more about it?"],
      happy: ["That's wonderful to hear! 😊 It's so important to celebrate the good moments. What made today special?",
        "I love hearing that! Positive moments matter a lot. What brought that smile to your face?"],
      neutral: ["Thank you for sharing that with me. How long have you been feeling this way?",
        "I'm here and listening. Sometimes it helps to just express what's in your mind — keep going if you'd like."],
    }
    const arr = responses[emotion] || responses.neutral
    return arr[Math.floor(Math.random() * arr.length)]
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const filteredSessions = sessions.filter(s =>
    s.title?.toLowerCase().includes(search.toLowerCase()) ||
    s.preview?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        height: '100vh', paddingTop: '64px',
        display: 'flex', overflow: 'hidden',
        background: 'var(--bg-primary)',
        position: 'relative'
      }}
    >
      <BlossomDrift />

      {/* Global background now handled by index.css body */}

      {/* Sidebar */}
      <div className="glass-card" style={{
        width: '300px', flexShrink: 0,
        display: 'flex', flexDirection: 'column',
        padding: '24px 16px',
        margin: '12px',
        borderRadius: '24px',
        zIndex: 1,
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-card)',
      }}>
        <p style={{ 
          color: 'var(--text-muted)', 
          fontWeight: 600, 
          fontSize: '0.75rem', 
          marginBottom: '20px', 
          paddingLeft: '8px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase'
        }}>
          Journal Sessions
        </p>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <FiSearch size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="input-dark"
            style={{
              padding: '11px 12px 11px 38px',
              fontSize: '0.85rem',
            }}
          />
        </div>

        {/* Sessions list */}
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {filteredSessions.length > 0 ? filteredSessions.map((session) => (
            <motion.div
              key={session.id}
              whileHover={{ background: 'var(--accent-light)', borderColor: 'var(--accent-glow)' }}
              onClick={() => loadMessages(session)}
              style={{
                padding: '14px',
                borderRadius: '16px',
                cursor: 'pointer',
                background: activeSession?.id === session.id
                  ? 'var(--accent-light)'
                  : 'transparent',
                border: '1px solid',
                borderColor: activeSession?.id === session.id
                  ? 'var(--accent-glow)'
                  : 'transparent',
                transition: 'all 0.25s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <p style={{
                  color: activeSession?.id === session.id ? 'var(--accent)' : 'var(--text-primary)',
                  fontWeight: activeSession?.id === session.id ? 700 : 600, 
                  fontSize: '0.88rem', marginBottom: '4px',
                }}>
                  {session.title}
                </p>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{session.time || new Date(session.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <p style={{
                color: 'var(--text-secondary)', fontSize: '0.78rem',
                overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                opacity: 0.8
              }}>
                {session.last_message || 'No messages yet'}
              </p>
            </motion.div>
          )) : (
            <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.6 }}>
               <p style={{ fontSize: '1.5rem', marginBottom: '10px' }}>💬</p>
               <p style={{ fontSize: '0.8rem' }}>No conversations found.</p>
            </div>
          )}
        </div>

        {/* New conversation */}
        <motion.button
          whileHover={{ scale: 1.02, background: 'var(--text-primary)', color: 'var(--bg-primary)' }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNewSession}
          className="btn-outline"
          style={{
            width: '100%',
            justifyContent: 'center',
            marginTop: '16px',
            fontSize: '0.85rem'
          }}
        >
          <FiPlus size={16} /> New Session
        </motion.button>
      </div>

      {/* Chat area */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        margin: '12px 12px 12px 0',
        borderRadius: '24px',
        overflow: 'hidden',
        background: chatBg === 'none' ? 'var(--bg-card)' : `url(${BACKGROUNDS.find(b => b.id === chatBg)?.url}) center/cover no-repeat`,
        border: '1px solid var(--border)',
        zIndex: 1,
        boxShadow: 'var(--shadow-card)',
        position: 'relative'
      }}>
        {/* Chat header */}
        {activeSession && (
          <div style={{
            padding: '20px 28px',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--glass-bg)',
            backdropFilter: 'var(--glass-blur)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '14px',
                background: 'linear-gradient(135deg, var(--accent), #FF6B7A)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.4rem',
                boxShadow: '0 4px 12px var(--accent-glow)'
              }}>
                🌸
              </div>
              <div>
                <p style={{ 
                  color: 'var(--text-primary)', 
                  fontWeight: 400, 
                  fontSize: '1.1rem',
                  fontFamily: "'Playfair Display', serif"
                }}>
                  Amore <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>AI</span>
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 500 }}>Always here for you</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative' }}>
              {sessionEmotion && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500 }}>Feeling:</span>
                  <EmotionTag emotion={sessionEmotion} size="md" />
                </div>
              )}
              
              <button 
                onClick={() => setShowSettings(!showSettings)}
                style={{
                  background: showSettings ? 'var(--accent-light)' : 'transparent',
                  border: 'none',
                  color: showSettings ? 'var(--accent)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                <FiSettings size={18} />
              </button>

              {/* Settings Dropdown */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    style={{
                      position: 'absolute',
                      top: '100%', right: '0',
                      marginTop: '12px',
                      width: '240px',
                      background: '#ffffff',
                      border: '1px solid var(--border)',
                      borderRadius: '20px',
                      padding: '20px',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                      zIndex: 100
                    }}
                  >
                    <Link to="/profile" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#333', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                      <FiUser style={{color: 'var(--accent)'}} /> My Profile
                    </Link>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#333', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FiImage style={{color: 'var(--accent)'}} /> Change Wallpaper
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      {BACKGROUNDS.map(bg => (
                        <div
                          key={bg.id}
                          onClick={() => handleBgChange(bg.id)}
                          style={{
                            height: '64px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            background: bg.id === 'none' ? '#f0f0f5' : `url(${bg.url}) center/cover`,
                            border: chatBg === bg.id ? '2px solid var(--accent)' : '1px solid rgba(0,0,0,0.08)',
                            position: 'relative',
                            overflow: 'hidden',
                            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                            paddingBottom: '6px',
                            transition: 'all 0.2s ease',
                            boxShadow: chatBg === bg.id ? '0 4px 12px var(--accent-glow)' : 'none'
                          }}
                        >
                          <span style={{ 
                            fontSize: '0.65rem', 
                            fontWeight: 700,
                            color: bg.id === 'none' ? '#666' : '#fff',
                            textShadow: bg.id === 'none' ? 'none' : '0 1px 4px rgba(0,0,0,0.4)',
                            zIndex: 1
                          }}>
                            {bg.label.split(' ')[0]}
                          </span>
                          {chatBg === bg.id && (
                            <div style={{
                              position: 'absolute', top: 4, right: 4,
                              background: 'var(--accent)', color: '#fff',
                              borderRadius: '50%', width: 16, height: 16,
                              display: 'flex', alignItems: 'center', justifyItems: 'center',
                              fontSize: '10px'
                            }}>
                              <FiCheck style={{margin: 'auto'}} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Messages */}
        <div style={{
          flex: 1, overflow: 'auto',
          padding: '32px 28px',
          display: 'flex', flexDirection: 'column',
          gap: '12px',
          background: chatBg === 'none' ? 'var(--bg-primary)' : 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'none',
          opacity: 1
        }}>
          <AnimatePresence>
            {showCrisis && (
              <CrisisBanner onClose={() => setShowCrisis(false)} />
            )}
          </AnimatePresence>

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          <AnimatePresence>
            {typing && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'var(--bg-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', flexShrink: 0,
                  border: '1px solid var(--border)'
                }}>
                  🌸
                </div>
                <TypingIndicator />
              </div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: '24px 28px',
          borderTop: '1px solid var(--border)',
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-blur)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'flex-end', gap: '14px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '14px 18px',
            transition: 'all 0.3s ease',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
          }}
            onFocusCapture={e => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.background = 'var(--bg-card)';
              e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-light)';
            }}
            onBlurCapture={e => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.background = 'var(--bg-secondary)';
              e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)';
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="How are you feeling right now?..."
              rows={1}
              style={{
                flex: 1, background: 'none', border: 'none',
                color: 'var(--text-primary)', fontSize: '0.95rem',
                fontFamily: 'Inter, sans-serif', outline: 'none',
                resize: 'none', lineHeight: 1.6,
                maxHeight: '120px', overflowY: 'auto',
              }}
            />
            <motion.button
              whileHover={{ scale: 1.05, y: -1 }} whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!input.trim()}
              style={{
                width: '42px', height: '42px', borderRadius: '14px', flexShrink: 0,
                background: input.trim()
                  ? 'var(--text-primary)'
                  : 'var(--border)',
                border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--bg-primary)',
                boxShadow: input.trim() ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.3s ease',
              }}
            >
              <FiSend size={18} />
            </motion.button>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textAlign: 'center', marginTop: '12px', fontWeight: 500 }}>
            Press <span style={{ fontWeight: 700 }}>Enter</span> to send · <span style={{ fontWeight: 700 }}>Shift+Enter</span> for new line
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default Chat
