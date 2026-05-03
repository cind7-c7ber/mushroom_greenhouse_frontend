import axios from 'axios'

const baseURL =
  import.meta.env.VITE_API_BASE_URL?.trim() || 'http://127.0.0.1:8000/api'

const client = axios.create({
  baseURL,
  timeout: 50000,
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('gh_token')

  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const requestUrl = error?.config?.url || ''

    if (status === 401) {
      const isAuthRoute =
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/register')

      if (!isAuthRoute) {
        window.dispatchEvent(new CustomEvent('gh:unauthorized'))
      }
    }

    return Promise.reject(error)
  }
)

export default client 