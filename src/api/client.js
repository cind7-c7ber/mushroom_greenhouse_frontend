import axios from 'axios'

const baseURL =
  import.meta.env.VITE_API_BASE_URL?.trim() || 'http://127.0.0.1:8000/api'

const client = axios.create({
  baseURL,
  timeout: 10000,
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('gh_token')

  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default client