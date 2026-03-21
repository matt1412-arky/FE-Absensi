import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const api = axios.create({ baseURL: BASE })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  me: () => api.get('/me'),
}

export const usersAPI = {
  list: () => api.get('/users'),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
}

export const classesAPI = {
  list: () => api.get('/classes'),
  create: (data) => api.post('/classes', data),
  update: (id, data) => api.put(`/classes/${id}`, data),
  delete: (id) => api.delete(`/classes/${id}`),
  students: (id) => api.get(`/classes/${id}/students`),
}

export const studentsAPI = {
  list: (classId) => api.get('/students', { params: classId ? { class_id: classId } : {} }),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
}

export const attendanceAPI = {
  list: (params) => api.get('/attendance', { params }),
  save: (data) => api.post('/attendance', data),
}

export const gradesAPI = {
  list: (params) => api.get('/grades', { params }),
  create: (data) => api.post('/grades', data),
  update: (id, data) => api.put(`/grades/${id}`, data),
  delete: (id) => api.delete(`/grades/${id}`),
}

export const schedulesAPI = {
  list: () => api.get('/schedules'),
  create: (data) => api.post('/schedules', data),
  delete: (id) => api.delete(`/schedules/${id}`),
}

export const statsAPI = {
  get: (params) => api.get('/stats', { params }),
  dashboardAdmin: () => api.get('/dashboard/admin'),
}

export const studentAPI = {
  me: () => api.get('/student/me'),
  attendance: () => api.get('/student/attendance'),
  grades: () => api.get('/student/grades'),
  dashboard: () => api.get('/student/dashboard'),
}

export default api
