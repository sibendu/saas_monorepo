import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import TaskList from '@/components/TaskList'

describe('TaskList', () => {
  it('renders task records and total count', () => {
    render(
      <TaskList
        total={2}
        tasks={[
          {
            taskId: 'TASK-1001',
            title: 'Finalize onboarding copy',
            project: 'Website Revamp',
            priority: 'High',
            date: '2026-03-03',
            owner: 'Sibendu Das',
          },
          {
            taskId: 'TASK-1002',
            title: 'Review OAuth callback flow',
            project: 'Auth Modernization',
            priority: 'Critical',
            date: '2026-03-04',
            owner: 'Demo User',
          },
        ]}
      />
    )

    expect(screen.getByText('All Tasks (2)')).toBeInTheDocument()
    expect(screen.getAllByText('Finalize onboarding copy').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Review OAuth callback flow').length).toBeGreaterThan(0)
    expect(screen.getAllByText('High').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Critical').length).toBeGreaterThan(0)
  })

  it('shows empty-state text when there are no tasks', () => {
    render(<TaskList total={0} tasks={[]} />)

    expect(screen.getByText('No tasks found.')).toBeInTheDocument()
  })

  it('shows Edit/Delete options from task actions and deletes after confirmation', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, deletedTaskId: 'TASK-1001' }),
    } as Response)

    render(
      <TaskList
        total={1}
        tasks={[
          {
            taskId: 'TASK-1001',
            title: 'Finalize onboarding copy',
            project: 'Website Revamp',
            priority: 'High',
            date: '2026-03-03',
            owner: 'Sibendu Das',
          },
        ]}
      />
    )

    fireEvent.click(screen.getAllByRole('button', { name: 'Task actions for TASK-1001' })[0])

    expect(screen.getAllByText('Edit').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Delete').length).toBeGreaterThan(0)

    fireEvent.click(screen.getAllByText('Delete')[0])

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith('/api/tasks/TASK-1001', { method: 'DELETE' })
    })

    confirmSpy.mockRestore()
    fetchSpy.mockRestore()
  })
})