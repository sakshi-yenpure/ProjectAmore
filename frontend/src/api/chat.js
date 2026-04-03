import api from './axios'

export const getSessions = () => api.get('/chat/sessions/')
export const createSession = (title) => api.post('/chat/sessions/', { title })
export const getMessages = (sessionId) => api.get(`/chat/sessions/${sessionId}/messages/`)
export const sendMessage = (content, session_id) => 
  api.post('/chat/message/', { content, session_id })
export const deleteSession = (sessionId) => api.delete(`/chat/sessions/${sessionId}/`)
