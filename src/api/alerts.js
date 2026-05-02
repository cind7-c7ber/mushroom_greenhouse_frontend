import client from './client'

export const getLatestAlerts = (limit = 10) =>
  client.get(`/alerts/latest?limit=${limit}`).then((r) => r.data)

export const getAlertHistory = (limit = 50) =>
  client.get(`/alerts/history?limit=${limit}`).then((r) => r.data)

export const getActiveAlerts = (limit = 50) =>
  client.get(`/alerts/active?limit=${limit}`).then((r) => r.data)

export const getAlertSummary = () =>
  client.get('/alerts/summary').then((r) => r.data)