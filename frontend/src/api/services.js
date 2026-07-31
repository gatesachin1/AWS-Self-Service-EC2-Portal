import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

const client = axios.create({
  baseURL: API_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      'Unexpected error'
    console.error('[Services API]', err.config?.url, '→', msg)
    return Promise.reject(new Error(msg))
  }
)

export const getServiceData = (serviceName) =>
  client.get(`/services/${serviceName}`).then((r) => r.data)
