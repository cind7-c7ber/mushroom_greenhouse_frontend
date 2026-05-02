import client from './client'

export const getLatestControlled = () =>
  client.get('/sensors/latest/controlled').then(r => r.data)

export const getLatestControl = () =>
  client.get('/sensors/latest/control').then(r => r.data)

export const getSensorHistory = (section) =>
  client.get(`/sensors/history/${section}`).then(r => r.data)

export const getSensorCompare = () =>
  client.get('/sensors/compare').then(r => r.data)
