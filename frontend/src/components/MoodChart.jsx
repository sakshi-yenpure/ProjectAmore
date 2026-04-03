import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card" style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '10px 16px',
        boxShadow: 'var(--shadow-hover)'
      }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
        <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>{payload[0].value.toFixed(1)}</p>
      </div>
    )
  }
  return null
}

const MoodChart = ({ data, period }) => {

  const mockData = {
    week: [
      { day: 'Mon', score: 6.2 }, { day: 'Tue', score: 6.8 },
      { day: 'Wed', score: 7.1 }, { day: 'Thu', score: 6.5 },
      { day: 'Fri', score: 7.4 }, { day: 'Sat', score: 7.8 },
      { day: 'Sun', score: 7.2 },
    ],
    month: Array.from({ length: 30 }, (_, i) => ({
      day: `${i + 1}`, score: 5 + Math.random() * 4,
    })),
    '3mo': Array.from({ length: 12 }, (_, i) => ({
      day: `W${i + 1}`, score: 5 + Math.random() * 4,
    })),
  }

  const chartData = data || mockData[period || 'week']

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <h3 style={{ 
          color: 'var(--text-primary)', 
          fontWeight: 600, 
          fontSize: '1rem',
          letterSpacing: '-0.01em'
        }}>
          Mood trend
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Score</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '2px', background: 'var(--text-primary)', opacity: 0.6 }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Trend</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
          <XAxis
            dataKey="day"
            tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          <YAxis
            domain={[0, 10]}
            tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--accent)', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Line
            type="linear"
            dataKey="regression"
            stroke="var(--text-primary)"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
            activeDot={false}
            opacity={0.6}
            animationDuration={1500}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="var(--accent)"
            strokeWidth={3}
            fill="url(#moodGradient)"
            dot={{ fill: 'var(--bg-primary)', r: 4, strokeWidth: 2.5, stroke: 'var(--accent)' }}
            activeDot={{ r: 7, fill: 'var(--accent)', stroke: 'var(--bg-primary)', strokeWidth: 2.5 }}
            animationDuration={1500}
            connectNulls={true}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export default MoodChart
