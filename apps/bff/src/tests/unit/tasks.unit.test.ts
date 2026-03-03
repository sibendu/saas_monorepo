import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import tasksRouter, { mapTaskRowToTask } from '../../routes/tasks';

function createTaskTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api', tasksRouter);
  return app;
}

describe('tasks route mapping', () => {
  it('maps database row to API task shape', () => {
    const task = mapTaskRowToTask({
      task_id: 'TASK-2001',
      title: 'Backend task',
      project: 'Platform',
      priority: 'High',
      date: '2026-03-10',
      owner: 'Demo Owner',
    });

    expect(task).toEqual({
      taskId: 'TASK-2001',
      title: 'Backend task',
      project: 'Platform',
      priority: 'High',
      date: '2026-03-10',
      owner: 'Demo Owner',
    });
  });

  it('updates editable task fields via PATCH', async () => {
    const app = createTaskTestApp();

    const response = await request(app).patch('/api/tasks/TASK-1002').send({
      title: 'Unit Updated Title',
      project: 'Unit Updated Project',
      priority: 'Low',
      date: '2026-03-21',
      owner: 'Unit Owner',
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.task).toMatchObject({
      taskId: 'TASK-1002',
      title: 'Unit Updated Title',
      project: 'Unit Updated Project',
      priority: 'Low',
      date: '2026-03-21',
      owner: 'Unit Owner',
    });
  });

  it('deletes a task via DELETE and returns not found on second delete', async () => {
    const app = createTaskTestApp();

    const deleteResponse = await request(app).delete('/api/tasks/TASK-1003');

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.success).toBe(true);
    expect(deleteResponse.body.deletedTaskId).toBe('TASK-1003');

    const secondDeleteResponse = await request(app).delete('/api/tasks/TASK-1003');
    expect(secondDeleteResponse.status).toBe(404);
    expect(secondDeleteResponse.body.error).toBe('Task not found');
  });
});
