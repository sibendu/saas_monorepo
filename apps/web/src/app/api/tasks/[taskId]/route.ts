import { NextRequest, NextResponse } from 'next/server'

function getBffUrl() {
  return process.env.BFF_INTERNAL_URL || process.env.NEXT_PUBLIC_BFF_URL || 'http://localhost:3001'
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await context.params

  if (!taskId) {
    return NextResponse.json({ success: false, error: 'taskId is required' }, { status: 400 })
  }

  const payload = await request.json()
  const bffUrl = getBffUrl()

  const response = await fetch(`${bffUrl}/api/tasks/${encodeURIComponent(taskId)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  })

  const data = await response.json()
  return NextResponse.json(data, { status: response.status })
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await context.params

  if (!taskId) {
    return NextResponse.json({ success: false, error: 'taskId is required' }, { status: 400 })
  }

  const bffUrl = getBffUrl()

  const response = await fetch(`${bffUrl}/api/tasks/${encodeURIComponent(taskId)}`, {
    method: 'DELETE',
    cache: 'no-store',
  })

  const data = await response.json()
  return NextResponse.json(data, { status: response.status })
}
