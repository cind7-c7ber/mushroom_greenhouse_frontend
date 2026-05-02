import client from './client'

export const getLatestStatus = () =>
  client.get('/status/latest').then(r => r.data)

export const getStatusHistory = () =>
  client.get('/status/history').then(r => r.data)
