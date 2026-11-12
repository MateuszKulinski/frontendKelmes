import api from '@/core/api/axios'

interface LoginData {
  login: string
  password: string
}

export const loginRequest = (data: LoginData) => {
  return api.post('/login', data)
}