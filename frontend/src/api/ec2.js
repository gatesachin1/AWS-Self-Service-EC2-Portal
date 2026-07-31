/**
 * Axios API client — all calls to the API Gateway backend go through here.
 * Set VITE_API_URL in .env to your API Gateway invoke URL.
 */
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

if (!API_URL) {
  console.warn(
    '[EC2 Portal] VITE_API_URL is not set.\n' +
    'Copy frontend/.env.example to frontend/.env and set the API Gateway URL.\n' +
    'Run: terraform output api_gateway_url'
  )
}

const client = axios.create({
  baseURL: API_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor — debug logging ───────────────────────────────────
client.interceptors.request.use((config) => {
  console.debug(`[API] ▶ ${config.method?.toUpperCase()} ${config.url}`)
  return config
})

// ── Response interceptor — normalise errors ───────────────────────────────
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const apiMessage =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      'An unexpected error occurred'
    console.error('[API] ✖', err.config?.url, '→', apiMessage)
    return Promise.reject(new Error(apiMessage))
  }
)

// ── Instance operations ────────────────────────────────────────────────────

export const listInstances = () =>
  client.get('/instances').then((r) => r.data)

export const createInstance = (payload) =>
  client.post('/instances', payload).then((r) => r.data)

export const startInstance = (instanceId) =>
  client.post('/instances/start', { instance_id: instanceId }).then((r) => r.data)

export const stopInstance = (instanceId) =>
  client.post('/instances/stop', { instance_id: instanceId }).then((r) => r.data)

export const rebootInstance = (instanceId) =>
  client.post('/instances/reboot', { instance_id: instanceId }).then((r) => r.data)

export const terminateInstance = (instanceId) =>
  client.delete(`/instances/${instanceId}`).then((r) => r.data)

// ── Form dropdown data ─────────────────────────────────────────────────────

export const getResources = () =>
  client.get('/resources').then((r) => r.data)
