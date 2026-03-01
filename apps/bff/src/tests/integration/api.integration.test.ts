import { describe, expect, it } from 'vitest'
import request from 'supertest'
import app from '../../index'

describe('BFF API integration', () => {
  it('returns customers list', async () => {
    const response = await request(app).get('/api/customers')

    expect(response.status).toBe(200)
    expect(Array.isArray(response.body.customers)).toBe(true)
    expect(typeof response.body.total).toBe('number')
  })

  it('returns dashboard data for valid user payload', async () => {
    const response = await request(app).post('/api/dashboard').send({
      user: {
        email: 'demo@example.com',
        name: 'Demo User',
      },
    })

    expect(response.status).toBe(200)
    expect(response.body.welcomeMessage).toContain('Demo User')
    expect(Array.isArray(response.body.kpiCards)).toBe(true)
    expect(Array.isArray(response.body.revenueSeries)).toBe(true)
    expect(Array.isArray(response.body.channelBreakdown)).toBe(true)
    expect(Array.isArray(response.body.topCampaigns)).toBe(true)
  })

  it('returns 400 when dashboard request missing user email', async () => {
    const response = await request(app).post('/api/dashboard').send({
      user: {
        name: 'No Email User',
      },
    })

    expect(response.status).toBe(400)
    expect(response.body.error).toBe('user.email is required')
  })
})