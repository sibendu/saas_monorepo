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

  it('returns task list with required task fields', async () => {
    const response = await request(app).get('/api/tasks')

    expect(response.status).toBe(200)
    expect(Array.isArray(response.body.tasks)).toBe(true)
    expect(typeof response.body.total).toBe('number')

    expect(response.body.tasks.length).toBeGreaterThan(0)
    expect(response.body.tasks[0]).toMatchObject({
      taskId: expect.any(String),
      title: expect.any(String),
      project: expect.any(String),
      priority: expect.any(String),
      date: expect.any(String),
      owner: expect.any(String),
    })
  })

  it('updates task fields from actions menu edit flow', async () => {
    const response = await request(app).patch('/api/tasks/TASK-1001').send({
      title: 'Updated task title',
      project: 'Updated project',
      priority: 'Medium',
      date: '2026-03-12',
      owner: 'Updated Owner',
    })

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.task).toMatchObject({
      taskId: 'TASK-1001',
      title: 'Updated task title',
      project: 'Updated project',
      priority: 'Medium',
      date: '2026-03-12',
      owner: 'Updated Owner',
    })
  })

  it('deletes task after confirmation flow', async () => {
    const response = await request(app).delete('/api/tasks/TASK-1004')

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.deletedTaskId).toBe('TASK-1004')
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