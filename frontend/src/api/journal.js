import api from './axios'

export const getEntries = () => api.get('/journal/entries/')
export const getEntry = (date) => api.get(`/journal/entries/by-date/${date}/`)
export const saveEntry = (data) => api.post('/journal/entries/', data)
export const analyzeEntry = (content, manual_mood, date) => 
  api.post('/journal/analyze/', { content, manual_mood, date })
