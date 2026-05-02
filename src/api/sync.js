import client from './client'

export const getSyncHealth = () =>
  client.get('/sync/health').then((r) => r.data)

export const runTelemetrySync = () =>
  client.post('/sync/telemetry').then((r) => r.data)

export const runTestPayloadSync = () =>
  client.post('/sync/test-payload').then((r) => r.data)