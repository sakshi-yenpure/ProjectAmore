import api from './axios'

export const login = (credentials) => api.post('/auth/login/', credentials)
export const signup = (data) => api.post('/auth/register/', data)
export const getMe = () => api.get('/auth/me/')
