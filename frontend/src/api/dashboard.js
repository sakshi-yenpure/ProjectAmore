import api from './axios'

export const getDashboardStats = (period = 'week') => api.get(`/dashboard/stats/?period=${period}`)
