"use client"

import { useMemo, useState } from 'react'
import { Task } from '@saas/shared-types'

interface TaskListProps {
  tasks: Task[]
  total: number
}

type EditableTask = Pick<Task, 'taskId' | 'title' | 'project' | 'priority' | 'date' | 'owner'>

function priorityClasses(priority: Task['priority']) {
  if (priority === 'Critical') {
    return 'bg-red-100 text-red-700'
  }

  if (priority === 'High') {
    return 'bg-orange-100 text-orange-700'
  }

  if (priority === 'Medium') {
    return 'bg-amber-100 text-amber-700'
  }

  return 'bg-green-100 text-green-700'
}

export default function TaskList({ tasks, total }: TaskListProps) {
  const [taskItems, setTaskItems] = useState<Task[]>(tasks)
  const [menuTaskId, setMenuTaskId] = useState<string | null>(null)
  const [editTask, setEditTask] = useState<EditableTask | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const displayedTotal = useMemo(() => taskItems.length, [taskItems])

  const openEdit = (task: Task) => {
    setMenuTaskId(null)
    setEditTask({
      taskId: task.taskId,
      title: task.title,
      project: task.project,
      priority: task.priority,
      date: task.date,
      owner: task.owner,
    })
  }

  const onEditField = <K extends keyof EditableTask>(field: K, value: EditableTask[K]) => {
    if (!editTask) {
      return
    }

    setEditTask({
      ...editTask,
      [field]: value,
    })
  }

  const saveEdit = async () => {
    if (!editTask) {
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/tasks/${encodeURIComponent(editTask.taskId)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editTask.title,
          project: editTask.project,
          priority: editTask.priority,
          date: editTask.date,
          owner: editTask.owner,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update task')
      }

      const body = await response.json()
      const updatedTask = body.task as Task

      setTaskItems((prev) => prev.map((task) => (task.taskId === updatedTask.taskId ? updatedTask : task)))
      setEditTask(null)
    } catch (error) {
      console.error('Failed to edit task:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const deleteTask = async (taskId: string) => {
    setMenuTaskId(null)
    const confirmed = window.confirm('Are you sure you want to delete this task?')
    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(`/api/tasks/${encodeURIComponent(taskId)}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete task')
      }

      setTaskItems((prev) => prev.filter((task) => task.taskId !== taskId))
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  const ActionButton = ({ task }: { task: Task }) => (
    <div className="relative">
      <button
        type="button"
        aria-label={`Task actions for ${task.taskId}`}
        onClick={() => setMenuTaskId((prev) => (prev === task.taskId ? null : task.taskId))}
        className="inline-flex items-center justify-center rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>

      {menuTaskId === task.taskId && (
        <div className="absolute right-0 z-20 mt-1 w-28 rounded-md border border-gray-200 bg-white shadow-lg">
          <button
            type="button"
            onClick={() => openEdit(task)}
            className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => deleteTask(task.taskId)}
            className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900">All Tasks ({displayedTotal || total})</h2>
        <p className="mt-1 text-sm text-gray-500">Track current work across projects</p>
      </div>

      <div className="sm:hidden divide-y divide-gray-100">
        {taskItems.map((task) => (
          <article key={task.taskId} className="p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <ActionButton task={task} />
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-gray-900">{task.title}</p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityClasses(task.priority)}`}>
                {task.priority}
              </span>
            </div>
            <p className="text-xs text-gray-500">{task.taskId}</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p className="text-gray-600">Project</p>
              <p className="text-gray-900 text-right">{task.project}</p>
              <p className="text-gray-600">Owner</p>
              <p className="text-gray-900 text-right">{task.owner}</p>
              <p className="text-gray-600">Date</p>
              <p className="text-gray-900 text-right">{task.date}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left font-medium px-4 py-3">Task-ID</th>
              <th className="text-left font-medium px-4 py-3">Title</th>
              <th className="text-left font-medium px-4 py-3">Project</th>
              <th className="text-left font-medium px-4 py-3">Priority</th>
              <th className="text-left font-medium px-4 py-3">Date</th>
              <th className="text-left font-medium px-4 py-3">Owner</th>
              <th className="text-right font-medium px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {taskItems.map((task) => (
              <tr key={task.taskId} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium text-gray-900">{task.taskId}</td>
                <td className="px-4 py-3 text-gray-900">{task.title}</td>
                <td className="px-4 py-3 text-gray-700">{task.project}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityClasses(task.priority)}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700">{task.date}</td>
                <td className="px-4 py-3 text-gray-700">{task.owner}</td>
                <td className="px-4 py-3 text-right">
                  <ActionButton task={task} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {taskItems.length === 0 && (
        <div className="p-8 text-center text-gray-500">No tasks found.</div>
      )}

      {editTask && (
        <div className="fixed inset-0 z-30 bg-black/30 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-xl bg-white border border-gray-200 p-5 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Edit Task</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-sm text-gray-700 sm:col-span-2">
                Title
                <input
                  value={editTask.title}
                  onChange={(event) => onEditField('title', event.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </label>

              <label className="text-sm text-gray-700 sm:col-span-2">
                Project
                <input
                  value={editTask.project}
                  onChange={(event) => onEditField('project', event.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </label>

              <label className="text-sm text-gray-700">
                Priority
                <select
                  value={editTask.priority}
                  onChange={(event) => onEditField('priority', event.target.value as EditableTask['priority'])}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 bg-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </label>

              <label className="text-sm text-gray-700">
                Date
                <input
                  type="date"
                  value={editTask.date}
                  onChange={(event) => onEditField('date', event.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </label>

              <label className="text-sm text-gray-700 sm:col-span-2">
                Owner
                <input
                  value={editTask.owner}
                  onChange={(event) => onEditField('owner', event.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </label>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditTask(null)}
                className="px-3 py-2 rounded-md border border-gray-300 text-gray-700"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEdit}
                className="px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                disabled={isSaving}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}