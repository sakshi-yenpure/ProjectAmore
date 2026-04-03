import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiArrowUpRight, FiPlus, FiMinus } from 'react-icons/fi'
import useAuthStore from '../store/useAuthStore'
import useThemeStore from '../store/useThemeStore'
import { BlossomDrift } from '../components/Blossom'

/* Blossom component moved to shared components/Blossom.jsx */

/* ─── Typewriter Quote ─── */
const TypewriterQuote = () => {
  const quote = "Amore helps you understand the emotional patterns that shape your daily life — with nuance, with empathy, and with the kind of clarity that leads to real growth."
  const promise = "The Amore Promise ❤️"
  const pause = 15;
  const totalLength = quote.length + pause + promise.length
  const [count, setCount] = useState(0)

  useEffect(() => {
    let i = 0
    setCount(0)
    const timer = setInterval(() => {
      setCount(i)
      i++
      if (i > totalLength) clearInterval(timer)
    }, 45) // Adjust speed
    return () => clearInterval(timer)
  }, [])

  return (
    <>
      <p style={{
        fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
        fontFamily: "'Playfair Display', serif",
        color: 'var(--text-primary)',
        lineHeight: 1.55,
        fontWeight: 400,
        letterSpacing: '-0.015em',
        minHeight: '120px'
      }}>
        "{quote.slice(0, count)}"
      </p>
      
      <div style={{
        width: '32px', height: '2px',
        background: 'var(--accent)',
        margin: '32px auto 20px',
        borderRadius: '2px',
        opacity: count >= quote.length + pause ? 1 : 0,
        transition: 'opacity 0.4s ease'
      }} />
      
      <p style={{ 
        fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '0.06em', 
        textTransform: 'uppercase', minHeight: '1.5rem'
      }}>
        {count >= quote.length + pause ? promise.slice(0, count - (quote.length + pause)) : ""}
      </p>
    </>
  )
}

/* ─── Animated chat bubble mockup ─── */
const ChatPreview = ({ isDark }) => {
  const [typing, setTyping] = useState(false)
  const [reply, setReply] = useState('')
  const fullReply = "That sounds really overwhelming. Let's take it one step at a time — what feels most urgent right now?"

  useEffect(() => {
    const t1 = setTimeout(() => setTyping(true), 1400)
    const t2 = setTimeout(() => { setTyping(false); setReply(fullReply) }, 3200)
    const t3 = setTimeout(() => { setReply(''); setTyping(false) }, 9000)
    const t4 = setTimeout(() => setTyping(true), 10400)
    const t5 = setTimeout(() => { setTyping(false); setReply(fullReply) }, 12200)
    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.35, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: isDark ? 'rgba(26,26,32,0.9)' : 'rgba(255,255,255,0.92)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        borderRadius: '20px',
        padding: '28px',
        boxShadow: isDark
          ? '0 32px 80px rgba(0,0,0,0.5)'
          : '0 32px 80px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(20px)',
        width: '100%',
        maxWidth: '420px',
      }}
    >
      {/* User message */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <div style={{
          background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(180,190,230,0.25)',
          borderRadius: '16px 16px 4px 16px',
          padding: '12px 16px',
          maxWidth: '85%',
          fontSize: '0.9rem',
          color: 'var(--text-primary)',
          lineHeight: 1.55,
        }}>
          I feel exhausted and I can't stop worrying about everything. I don't know where to start.
        </div>
      </div>

      {/* Amore response */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
        {/* Avatar */}
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #E63946, #C1121F)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.75rem',
          color: 'white',
          fontFamily: "'Lora', serif",
          fontStyle: 'italic',
          fontWeight: 700,
        }}>
          A
        </div>

        <div style={{ flex: 1 }}>
          {typing && !reply && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                display: 'flex', gap: '5px', alignItems: 'center',
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                borderRadius: '16px 16px 16px 4px',
                padding: '14px 18px',
                width: 'fit-content',
              }}
            >
              {[0, 0.2, 0.4].map((d, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.9, delay: d, repeat: Infinity }}
                  style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-muted)' }}
                />
              ))}
            </motion.div>
          )}

          {reply && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                borderRadius: '16px 16px 16px 4px',
                padding: '14px 18px',
                fontSize: '0.875rem',
                color: 'var(--text-primary)',
                lineHeight: 1.6,
              }}
            >
              {reply}
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom label */}
      <div style={{
        marginTop: '24px', paddingTop: '16px',
        borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        <div style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: '#22C55E',
          boxShadow: '0 0 6px rgba(34,197,94,0.6)',
        }} />
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          Available 24 / 7 · Fully private
        </span>
      </div>
    </motion.div>
  )
}

/* ─── Features list ─── */
const features = [
  { n: '01', title: 'Emotion Detection', desc: 'AI reads the emotional subtext of your words — every response is calibrated to how you actually feel.' },
  { n: '02', title: 'Empathetic Chat', desc: 'A companion that listens without judgment and adapts its tone to meet you exactly where you are.' },
  { n: '03', title: 'Mood Analytics', desc: 'Elegant, data-driven charts surface your emotional patterns over time with clinical precision.' },
  { n: '04', title: 'Reflective Journal', desc: 'Write freely. Every entry is analyzed to surface insights about your emotional rhythms and growth.' },
  { n: '05', title: 'Complete Privacy', desc: 'End-to-end encryption, zero data sharing. Your innermost thoughts remain entirely yours.' },
  { n: '06', title: 'Crisis Detection', desc: 'Quietly monitors for distress and connects you to professional support when you need it most.' },
]

const FeatureCard = ({ n, title, desc, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-40px' }}
    transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '28px 24px',
      transition: 'all 0.25s ease',
      cursor: 'default',
    }}
    whileHover={{ y: -4, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', borderColor: 'var(--border-hover)' }}
  >
    <div style={{
      fontSize: '0.72rem',
      fontWeight: 600,
      color: 'var(--text-muted)',
      letterSpacing: '0.08em',
      marginBottom: '14px',
    }}>
      {n}
    </div>
    <h3 style={{
      fontSize: '1rem',
      fontWeight: 600,
      color: 'var(--text-primary)',
      marginBottom: '10px',
      letterSpacing: '-0.01em',
    }}>
      {title}
    </h3>
    <p style={{
      fontSize: '0.85rem',
      color: 'var(--text-secondary)',
      lineHeight: 1.65,
    }}>
      {desc}
    </p>
    <div style={{
      marginTop: '20px', display: 'flex', alignItems: 'center', gap: '6px',
      fontSize: '0.8rem', fontWeight: 500, color: 'var(--accent)',
      cursor: 'pointer',
    }}>
      <Link to="/auth" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '4px' }}>
        Learn more <FiArrowUpRight size={13} />
      </Link>
    </div>
  </motion.div>
)

/* ─── Stat ─── */
const Stat = ({ value, label, delay }) => (
  <motion.div
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
  >
    <div style={{
      fontFamily: "'Playfair Display', serif",
      fontSize: '2.6rem',
      fontWeight: 700,
      color: 'var(--text-primary)',
      lineHeight: 1,
      letterSpacing: '-0.03em',
    }}>
      {value}
    </div>
    <div style={{
      fontSize: '0.78rem',
      color: 'var(--text-muted)',
      marginTop: '6px',
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      fontWeight: 500,
    }}>
      {label}
    </div>
  </motion.div>
)

/* ─── Who We Serve Card ─── */
const ServeCard = ({ n, title, desc, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.97 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true, margin: '-40px' }}
    transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '20px',
      padding: '32px',
      transition: 'all 0.3s ease',
      cursor: 'default',
      display: 'flex', flexDirection: 'column',
      height: '100%',
    }}
    whileHover={{ y: -4, borderColor: 'var(--border-hover)', boxShadow: 'var(--shadow-hover)' }}
  >
    <div style={{
      fontSize: '0.75rem',
      fontWeight: 500,
      color: 'var(--text-muted)',
      marginBottom: '16px',
    }}>
      {n}
    </div>
    <h3 style={{
      fontFamily: "'Playfair Display', serif",
      fontSize: '1.35rem',
      fontWeight: 400,
      color: 'var(--text-primary)',
      marginBottom: '10px',
      letterSpacing: '-0.01em',
    }}>
      {title}
    </h3>
    <p style={{
      fontSize: '0.875rem',
      color: 'var(--text-secondary)',
      lineHeight: 1.6,
      flex: 1,
    }}>
      {desc}
    </p>
    <div style={{
      marginTop: '24px', paddingTop: '16px',
      borderTop: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
      fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)',
      cursor: 'pointer', transition: 'color 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}
    >
      <Link to="/auth" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', justifyItems: 'center', gap: '4px' }}>
        Learn more <FiArrowUpRight size={14} />
      </Link>
    </div>
  </motion.div>
)

/* ─── FAQ Accordion ─── */
const FAQItem = ({ q, a, delay }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      style={{
        borderBottom: '1px solid var(--border)',
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'none', border: 'none', padding: '24px 0',
          cursor: 'pointer', textAlign: 'left',
          color: 'var(--text-primary)',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}
      >
        <span style={{ fontSize: '1.05rem', fontWeight: 500, fontFamily: "'Playfair Display', serif", letterSpacing: '-0.01em' }}>
          {q}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ color: 'var(--text-muted)' }}
        >
          <FiPlus size={20} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <p style={{
              paddingBottom: '24px',
              fontSize: '0.9rem', color: 'var(--text-secondary)',
              lineHeight: 1.7, maxWidth: '90%',
            }}>
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════
   HOME PAGE
═══════════════════════════════════════════════════════ */
const Home = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { isDark } = useThemeStore()

  useEffect(() => { if (user) navigate('/dashboard') }, [user])

  const blossoms = [
    { left: '5%', duration: 18, delay: 0 },
    { left: '22%', duration: 22, delay: 7 },
    { left: '68%', duration: 19, delay: 12 },
    { left: '88%', duration: 24, delay: 3 },
  ]

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      <BlossomDrift />

      {/* Global background now handled by index.css body */}

      {/* ═══════════════════════════════════════
          HERO — Split layout like Elomia
      ═══════════════════════════════════════ */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center',
        padding: '100px 80px 80px',
        maxWidth: '1280px', margin: '0 auto',
        position: 'relative', zIndex: 1,
        gap: '60px',
      }}>
        {/* LEFT — Headline & CTA */}
        <div style={{ flex: '1 1 0', minWidth: 0 }}>
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              fontSize: '0.78rem',
              fontWeight: 500,
              color: 'var(--text-muted)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '28px',
            }}
          >
            AI emotional wellness · Available 24/7
          </motion.p>

          {/* Main headline — Playfair Display, large, like Elomia */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(2.8rem, 5vw, 4.6rem)',
              fontWeight: 400,
              lineHeight: 1.1,
              color: 'var(--text-primary)',
              letterSpacing: '-0.025em',
              marginBottom: '28px',
            }}
          >
            Your personal
            <br />
            <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>emotional</span>
            <br />
            wellness companion.
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.55 }}
            style={{
              fontSize: '1rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              maxWidth: '440px',
              marginBottom: '44px',
              fontWeight: 400,
            }}
          >
            <span style={{ fontFamily: "'Lora', serif", fontStyle: 'italic', color: 'var(--accent)', fontWeight: 600 }}>Amore</span>{' '}
            is designed to understand you — detecting nuance, responding with empathy, and reflecting
            your mental wellbeing back with clarity. Private, intelligent, always there.
          </motion.p>

          {/* CTA Buttons — pill shaped like Elomia */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}
          >
            <Link to="/auth" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ opacity: 0.88, y: -1 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  background: 'var(--text-primary)',
                  color: 'var(--bg-primary)',
                  border: 'none',
                  borderRadius: '100px',
                  padding: '14px 30px',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  letterSpacing: '0.01em',
                  transition: 'all 0.25s ease',
                }}
              >
                Talk to Amore
              </motion.button>
            </Link>

            <motion.button
              whileHover={{ borderColor: 'var(--text-primary)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                background: 'transparent',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-hover)',
                borderRadius: '100px',
                padding: '14px 30px',
                fontSize: '0.9rem',
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                letterSpacing: '0.01em',
                transition: 'all 0.25s ease',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              How it works <FiArrowUpRight size={14} />
            </motion.button>
          </motion.div>

          {/* Trust note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              marginTop: '28px',
              letterSpacing: '0.01em',
            }}
          >
            100% anonymous · End-to-end encrypted · No credit card required
          </motion.p>
        </div>

        {/* RIGHT — Chat preview card */}
        <div style={{
          flex: '0 0 420px',
          display: 'flex', justifyContent: 'center',
        }}>
          <ChatPreview isDark={isDark} />
        </div>
      </section>

      {/* Stats strip */}
      <div style={{
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '40px 80px',
        maxWidth: '1280px', margin: '0 auto',
        display: 'flex', gap: '64px',
        justifyContent: 'center', alignItems: 'center',
        flexWrap: 'wrap',
        position: 'relative', zIndex: 1,
      }}>
        <Stat value="10K+" label="People supported" delay={0} />
        <div style={{ width: '1px', background: 'var(--border)', alignSelf: 'stretch' }} />
        <Stat value="98%" label="Feel understood" delay={0.08} />
        <div style={{ width: '1px', background: 'var(--border)', alignSelf: 'stretch' }} />
        <Stat value="4.9" label="Average rating" delay={0.16} />
        <div style={{ width: '1px', background: 'var(--border)', alignSelf: 'stretch' }} />
        <Stat value="24/7" label="Always available" delay={0.24} />
      </div>

      {/* ═══════════════════════════════════════
          FEATURES — Numbered cards like Elomia
      ═══════════════════════════════════════ */}
      <section
        id="features"
        style={{
          padding: '100px 80px',
          maxWidth: '1280px', margin: '0 auto',
          position: 'relative', zIndex: 1,
        }}
      >
        {/* Section header — center aligned like Elomia */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: '60px' }}
        >
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
            fontWeight: 400,
            color: 'var(--text-primary)',
            letterSpacing: '-0.025em',
            marginBottom: '14px',
          }}>
            Everything you need to feel better
          </h2>
          <p style={{
            fontSize: '0.95rem',
            color: 'var(--text-secondary)',
            maxWidth: '480px',
            margin: '0 auto',
            lineHeight: 1.65,
          }}>
            Built with care, for anyone who wants to understand themselves more deeply.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '14px',
        }}>
          {features.map((f, i) => (
            <FeatureCard key={f.n} {...f} delay={i * 0.06} />
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          LARGE QUOTE — like Elomia's WSJ quote
      ═══════════════════════════════════════ */}
      <section style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '100px 80px',
        position: 'relative', zIndex: 1,
        textAlign: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: '800px', margin: '0 auto' }}
        >
          <TypewriterQuote />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════
          WHO WE SERVE — Elomia style grid
      ═══════════════════════════════════════ */}
      <section style={{
        padding: '120px 80px',
        maxWidth: '1280px', margin: '0 auto',
        position: 'relative', zIndex: 1,
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: '60px' }}
        >
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
            fontWeight: 400,
            color: 'var(--text-primary)',
            letterSpacing: '-0.025em',
            marginBottom: '14px',
          }}>
            Who We Serve
          </h2>
          <p style={{
            fontSize: '0.95rem',
            color: 'var(--text-secondary)',
            maxWidth: '480px',
            margin: '0 auto',
            lineHeight: 1.65,
          }}>
            Tailored mental health solutions for different needs
          </p>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
        }}>
          <ServeCard
            n="01" title="Individuals"
            desc="Personal, private mental health support tailored exactly to your emotional rhythms."
            delay={0.0}
          />
          <ServeCard
            n="02" title="Employers"
            desc="Workplace wellness solutions that prevent burnout and foster genuine resilience."
            delay={0.1}
          />
          <ServeCard
            n="03" title="Private Practice"
            desc="Advanced AI insights and tools designed to support clinicians between sessions."
            delay={0.2}
          />
          <ServeCard
            n="04" title="Universities"
            desc="Scalable campus mental wellness resources for students navigating extreme pressure."
            delay={0.3}
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SCROLLING TESTIMONIALS
      ═══════════════════════════════════════ */}
      <section style={{
        padding: '80px 0 100px',
        position: 'relative', zIndex: 1,
        overflow: 'hidden',
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.8rem',
            color: 'var(--text-primary)',
            letterSpacing: '-0.025em',
          }}>
            Stories of Growth
          </h2>
        </div>
        <div style={{
          display: 'flex',
          width: 'max-content',
        }}>
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 30, ease: 'linear', repeat: Infinity }}
            style={{ display: 'flex', gap: '24px', paddingLeft: '24px' }}
          >
            {/* Double the testimonials to create seamless loop */}
            {[...Array(2)].map((_, loopIdx) => (
              <React.Fragment key={loopIdx}>
                {[
                  { text: "Amore feels remarkably human. It caught nuances in my journal that no app ever has.", attr: "Sarah M.", role: "Designer" },
                  { text: "It’s like having an emotionally intelligent friend 24/7. My anxiety has genuinely reduced.", attr: "James T.", role: "Engineer" },
                  { text: "The insights are shockingly accurate. The emotional breakdowns over the week really opened my eyes.", attr: "Lily P.", role: "Student" },
                  { text: "Not just a chatbot — it actually helps me reflect and grow.", attr: "Marcus C.", role: "Entrepreneur" },
                  { text: "This app understands me better than I understand myself sometimes.", attr: "Elena R.", role: "Artist" },
                ].map((t, i) => (
                  <div key={i} style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '24px',
                    width: '320px',
                    flexShrink: 0,
                    boxShadow: 'var(--shadow-card)',
                  }}>
                    <p style={{
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      lineHeight: 1.6,
                      fontStyle: 'italic',
                      marginBottom: '16px',
                    }}>"{t.text}"</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '30px', height: '30px', borderRadius: '50%',
                        background: 'var(--accent-light)', color: 'var(--accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 600, fontSize: '0.8rem',
                      }}>
                        {t.attr.charAt(0)}
                      </div>
                      <div>
                        <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.8rem' }}>{t.attr}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FAQ SECTION
      ═══════════════════════════════════════ */}
      <section style={{
        padding: '80px 80px 140px',
        maxWidth: '800px', margin: '0 auto',
        position: 'relative', zIndex: 1,
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: '40px', textAlign: 'center' }}
        >
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
            fontWeight: 400,
            color: 'var(--text-primary)',
            letterSpacing: '-0.025em',
          }}>
            Frequently asked questions
          </h2>
        </motion.div>

        <div>
          <FAQItem
            q="Is Amore a replacement for a human therapist?"
            a="No. Amore is an intelligent emotional wellness companion designed to support you with immediate empathy, reflection, and journaling insights. It is highly effective for daily wellbeing, but it does not provide medical diagnoses or replace clinical therapy."
            delay={0.1}
          />
          <FAQItem
            q="How does the emotion detection work?"
            a="We use state-of-the-art Natural Language Processing (NLP) to read the subtext, pacing, and vocabulary of your words. This allows Amore to understand not just what you are saying, but how you are feeling, so it can respond with genuine nuance."
            delay={0.2}
          />
          <FAQItem
            q="Are my conversations truly private?"
            a="Absolutely. We employ zero-knowledge encryption protocols. Your journal entries and conversations are encrypted on your device and are never shared, sold, or accessible to human reviewers. We believe privacy is a fundamental human right."
            delay={0.3}
          />
          <FAQItem
            q="Can I use Amore when I'm experiencing a crisis?"
            a="While Amore is equipped to detect distress signals and gently guide you toward emergency resources or hotlines, it is not a crisis intervention service. If you are in immediate danger, please reach out to your local emergency services."
            delay={0.4}
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CTA — Minimal, like Elomia
      ═══════════════════════════════════════ */}
      <section style={{
        padding: '120px 80px',
        maxWidth: '1280px', margin: '0 auto',
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'flex-start',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
            fontWeight: 400,
            color: 'var(--text-primary)',
            letterSpacing: '-0.025em',
            lineHeight: 1.12,
            marginBottom: '28px',
            maxWidth: '600px',
          }}>
            Start your journey to emotional clarity today.
          </h2>
          <p style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            maxWidth: '480px',
            marginBottom: '40px',
          }}>
            Join thousands who use{' '}
            <span style={{ fontFamily: "'Lora', serif", color: 'var(--accent)', fontStyle: 'italic', fontWeight: 600 }}>Amore</span>{' '}
            to understand themselves more deeply — one conversation, one entry, one insight at a time.
          </p>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <Link to="/auth" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ opacity: 0.85, y: -1 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  background: 'var(--text-primary)',
                  color: 'var(--bg-primary)',
                  border: 'none', borderRadius: '100px',
                  padding: '14px 32px',
                  fontSize: '0.9rem', fontWeight: 500,
                  cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                  letterSpacing: '0.01em', transition: 'all 0.25s ease',
                }}
              >
                Get started — it's free
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '32px 80px',
        maxWidth: '1280px', margin: '0 auto',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap',
        gap: '16px', position: 'relative', zIndex: 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ opacity: 0.4, fontSize: '0.95rem', filter: 'saturate(0.4)' }}>🌸</span>
          <span style={{
            fontFamily: "'Lora', serif", fontStyle: 'italic',
            fontWeight: 600, color: 'var(--accent)', fontSize: '1.05rem',
          }}>
            Amore
          </span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          © 2026 Amore · Emotional wellness, redefined.
        </p>
        <div style={{ display: 'flex', gap: '24px' }}>
          {['Privacy', 'Terms', 'Contact'].map(link => (
            <span key={link} style={{
              color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              {link}
            </span>
          ))}
        </div>
      </footer>
    </div>
  )
}

export default Home
