import client from './client'

export const getLatestImage = () =>
  client.get('/images/latest').then(r => r.data)

export const getImageHistory = () =>
  client.get('/images/history').then(r => r.data)
