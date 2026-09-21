import { useMemo, useState } from 'react'
import type { BoardDetail, Task } from '@/api/endpoints/boards'

interface AnalyticsDashboardProps {
  board: BoardDetail
  onTaskClick: (task: Task) => void
}

export const AnalyticsDashboard = ({ board, onTaskClick }: AnalyticsDashboardProps) => {
  // Sort columns by position to ensure sequential ordering
  const sortedColumns = useMemo(() => {
    return [...board.columns].sort((a, b) => a.position - b.position)
  }, [board.columns])

  const doneColumn = sortedColumns[sortedColumns.length - 1]

  const allTasks = useMemo(() => {
    return sortedColumns.flatMap(col => col.tasks)
  }, [sortedColumns])

  // Filter out archived tasks for display/count
  const activeTasks = useMemo(() => {
    return allTasks.filter(t => !t.is_archived)
  }, [allTasks])

  // 1. Stats calculations
  const totalTasks = activeTasks.length
  
  const completedTasks = useMemo(() => {
    if (!doneColumn) return []
    return doneColumn.tasks.filter(t => !t.is_archived)
  }, [doneColumn])

  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0

  const highPriorityTasksCount = useMemo(() => {
    return activeTasks.filter(t => t.priority === 'high').length
  }, [activeTasks])

  const overdueTasks = useMemo(() => {
    return activeTasks.filter(t => {
      const isDone = doneColumn && t.column === doneColumn.id
      return t.is_overdue && !isDone
    })
  }, [activeTasks, doneColumn])

  const upcomingTasks = useMemo(() => {
    return activeTasks
      .filter(t => {
        const isDone = doneColumn && t.column === doneColumn.id
        if (isDone || !t.due_date) return false
        
        // Check if it's upcoming (due date is today or in the future, and not marked overdue)
        const dueDate = new Date(t.due_date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return dueDate >= today && !t.is_overdue
      })
      .sort((a, b) => {
        if (!a.due_date || !b.due_date) return 0
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      })
  }, [activeTasks, doneColumn])

  // 2. Priority Breakdown
  const priorityStats = useMemo(() => {
    const stats = { low: 0, medium: 0, high: 0 }
    activeTasks.forEach(t => {
      if (t.priority in stats) {
        stats[t.priority as keyof typeof stats]++
      }
    })
    return stats
  }, [activeTasks])

  // 3. Workload by Assignee
  const assigneeStats = useMemo(() => {
    const stats: Record<
      number,
      {
        id: number
        email: string
        name: string
        isOwner: boolean
        total: number
        completed: number
        active: number
      }
    > = {}

    // Add board owner
    const ownerId = board.owner_id
    stats[ownerId] = {
      id: ownerId,
      email: board.owner,
      name: board.owner_name || board.owner,
      isOwner: true,
      total: 0,
      completed: 0,
      active: 0,
    }

    // Add members
    if (board.members) {
      board.members.forEach(m => {
        stats[m.id] = {
          id: m.id,
          email: m.email,
          name: `${m.first_name} ${m.last_name}`.trim() || m.email,
          isOwner: m.email === board.owner,
          total: 0,
          completed: 0,
          active: 0,
        }
      })
    }

    // Aggregate tasks
    activeTasks.forEach(t => {
      const assignee = t.assignee
      if (assignee && stats[assignee.id]) {
        const isDone = doneColumn && t.column === doneColumn.id
        stats[assignee.id].total++
        if (isDone) {
          stats[assignee.id].completed++
        } else {
          stats[assignee.id].active++
        }
      }
    })

    // Filter to display members
    return Object.values(stats)
  }, [board, activeTasks, doneColumn])

  // 4. Custom SVG Priority Doughnut Chart details
  const priorityDoughnut = useMemo(() => {
    const { low, medium, high } = priorityStats
    const total = low + medium + high
    
    if (total === 0) {
      return {
        hasData: false,
        elements: (
          <circle
            cx="60"
            cy="60"
            r="40"
            fill="transparent"
            stroke="var(--bg-surface-2)"
            strokeWidth="10"
          />
        ),
      }
    }

    const r = 40
    const circ = 2 * Math.PI * r // ~251.3
    
    const lowPct = (low / total) * 100
    const medPct = (medium / total) * 100
    const highPct = (high / total) * 100

    const lowDash = (lowPct / 100) * circ
    const medDash = (medPct / 100) * circ
    const highDash = (highPct / 100) * circ

    const lowOffset = 0
    const medOffset = -lowDash
    const highOffset = -(lowDash + medDash)

    return {
      hasData: true,
      lowPct: Math.round(lowPct),
      medPct: Math.round(medPct),
      highPct: Math.round(highPct),
      elements: (
        <>
          {low > 0 && (
            <circle
              cx="60"
              cy="60"
              r={r}
              fill="transparent"
              stroke="#10b981"
              strokeWidth="9"
              strokeDasharray={`${lowDash} ${circ}`}
              strokeDashoffset={lowOffset}
              transform="rotate(-90 60 60)"
              className="transition-all duration-300 hover:stroke-[11px] cursor-pointer"
              style={{ transformOrigin: 'center' }}
            />
          )}
          {medium > 0 && (
            <circle
              cx="60"
              cy="60"
              r={r}
              fill="transparent"
              stroke="#f59e0b"
              strokeWidth="9"
              strokeDasharray={`${medDash} ${circ}`}
              strokeDashoffset={medOffset}
              transform="rotate(-90 60 60)"
              className="transition-all duration-300 hover:stroke-[11px] cursor-pointer"
              style={{ transformOrigin: 'center' }}
            />
          )}
          {high > 0 && (
            <circle
              cx="60"
              cy="60"
              r={r}
              fill="transparent"
              stroke="#ef4444"
              strokeWidth="9"
              strokeDasharray={`${highDash} ${circ}`}
              strokeDashoffset={highOffset}
              transform="rotate(-90 60 60)"
              className="transition-all duration-300 hover:stroke-[11px] cursor-pointer"
              style={{ transformOrigin: 'center' }}
            />
          )}
        </>
      ),
    }
  }, [priorityStats])

  const [activeSubTab, setActiveSubTab] = useState<'overdue' | 'upcoming'>('overdue')

  return (
    <div style={{ animation: 'fadeIn 0.3s ease', overflowY: 'auto', height: '100%', paddingRight: 4 }}>
      {/* 1. Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card 1: Total Tasks */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between" style={{ minHeight: 110 }}>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Tasks</span>
            <div style={{ padding: 6, borderRadius: 8, background: 'rgba(124, 58, 237, 0.1)', color: 'var(--accent)' }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{totalTasks}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>Active on board</div>
          </div>
        </div>

        {/* Card 2: Completion Rate */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between" style={{ minHeight: 110 }}>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Completion Rate</span>
            <div style={{ padding: 6, borderRadius: 8, background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div>
            <div className="flex items-end justify-between mb-1.5">
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{completionRate}%</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{completedTasks.length} / {totalTasks}</span>
            </div>
            <div style={{ width: '100%', height: 5, borderRadius: 10, background: 'var(--bg-surface-2)', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${completionRate}%`,
                  height: '100%',
                  background: 'var(--success)',
                  borderRadius: 10,
                  transition: 'width 0.6s cubic-bezier(0.1, 0.8, 0.2, 1)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: High Priority */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between" style={{ minHeight: 110 }}>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>High Priority</span>
            <div style={{ padding: 6, borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{highPriorityTasksCount}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>Urgent action required</div>
          </div>
        </div>

        {/* Card 4: Overdue Tasks */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between" style={{ minHeight: 110 }}>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Overdue Tasks</span>
            <div style={{ padding: 6, borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: overdueTasks.length > 0 ? 'var(--danger)' : 'var(--text-primary)', lineHeight: 1.1 }}>
              {overdueTasks.length}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>Passed scheduled date</div>
          </div>
        </div>
      </div>

      {/* 2. Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left: Column distribution */}
        <div className="glass p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Column Task Distribution</h3>
            {sortedColumns.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-sm" style={{ color: 'var(--text-muted)' }}>No column data found.</div>
            ) : (
              <div className="flex flex-col gap-4">
                {sortedColumns.map((col, index) => {
                  const count = col.tasks.filter(t => !t.is_archived).length
                  const pct = totalTasks > 0 ? (count / totalTasks) * 100 : 0
                  
                  // Card color cycled to match theme
                  const cycleColor = `var(--card-c${(index % 6) + 1})`
                  
                  return (
                    <div key={col.id} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span style={{ color: 'var(--text-primary)' }}>{col.name}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{count} task{count !== 1 ? 's' : ''} ({Math.round(pct)}%)</span>
                      </div>
                      <div style={{ width: '100%', height: 8, borderRadius: 10, background: 'var(--bg-surface-2)', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            background: cycleColor,
                            borderRadius: 10,
                            boxShadow: `0 0 8px ${cycleColor}80`,
                            transition: 'width 0.5s ease-out',
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Priority Breakdown Chart */}
        <div className="glass p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Priority Distribution</h3>
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
              {/* SVG Doughnut */}
              <div className="relative" style={{ width: 120, height: 120 }}>
                <svg width="120" height="120" viewBox="0 0 120 120">
                  {priorityDoughnut.elements}
                  {/* Center base circle */}
                  <circle cx="60" cy="60" r="30" fill="var(--bg-base)" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalTasks}</span>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Tasks</span>
                </div>
              </div>

              {/* Legend details */}
              <div className="flex flex-col gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-3">
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
                  <div className="flex flex-col">
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>High Priority</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {priorityStats.high} task{priorityStats.high !== 1 ? 's' : ''} ({priorityDoughnut.hasData ? priorityDoughnut.highPct : 0}%)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
                  <div className="flex flex-col">
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Medium Priority</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {priorityStats.medium} task{priorityStats.medium !== 1 ? 's' : ''} ({priorityDoughnut.hasData ? priorityDoughnut.medPct : 0}%)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
                  <div className="flex flex-col">
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Low Priority</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {priorityStats.low} task{priorityStats.low !== 1 ? 's' : ''} ({priorityDoughnut.hasData ? priorityDoughnut.lowPct : 0}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Team Workload & Timeline Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Assignee workload lists (L: 5 cols) */}
        <div className="glass p-5 rounded-2xl lg:col-span-5 flex flex-col">
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Collaborator Workloads</h3>
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto max-h-72 pr-1 scrollbar-thin">
            {assigneeStats.filter(s => s.total > 0).length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-sm py-8 text-[var(--text-muted)]">
                No active task assignments
              </div>
            ) : (
              assigneeStats
                .filter(s => s.total > 0)
                .map(stat => {
                  const completedPct = stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0
                  const initial = (stat.name?.[0] || stat.email?.[0] || '?').toUpperCase()
                  
                  return (
                    <div key={stat.id} className="flex gap-3 items-center">
                      {/* User initial circle */}
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          color: '#fff',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          background: stat.isOwner 
                            ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' 
                            : 'linear-gradient(135deg, var(--accent), var(--accent-end))',
                          border: '1.5px solid var(--border-subtle)',
                        }}
                        title={`${stat.name} (${stat.isOwner ? 'Owner' : 'Collaborator'})`}
                      >
                        {initial}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center text-xs mb-1 font-semibold">
                          <span className="truncate text-[var(--text-primary)]">{stat.name}</span>
                          <span style={{ color: 'var(--text-secondary)' }}>
                            {stat.active} active / {stat.completed} done
                          </span>
                        </div>
                        <div style={{ width: '100%', height: 6, borderRadius: 10, background: 'var(--bg-surface-2)', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${completedPct}%`,
                              height: '100%',
                              background: 'linear-gradient(90deg, var(--accent), var(--accent-light))',
                              borderRadius: 10,
                              transition: 'width 0.4s ease',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })
            )}
          </div>
        </div>

        {/* Task lists & Alerts (R: 7 cols) */}
        <div className="glass p-5 rounded-2xl lg:col-span-7 flex flex-col">
          {/* Sub tabs header */}
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2 mb-4">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveSubTab('overdue')}
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: activeSubTab === 'overdue' ? 'var(--text-primary)' : 'var(--text-muted)',
                  borderBottom: activeSubTab === 'overdue' ? '2px solid var(--danger)' : '2px solid transparent',
                  paddingBottom: 4,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                Overdue Tasks
                {overdueTasks.length > 0 && (
                  <span style={{ background: 'var(--danger-soft)', color: 'var(--danger)', fontSize: '0.7rem', padding: '1px 6px', borderRadius: 10, border: '1px solid rgba(239,68,68,0.2)' }}>
                    {overdueTasks.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveSubTab('upcoming')}
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: activeSubTab === 'upcoming' ? 'var(--text-primary)' : 'var(--text-muted)',
                  borderBottom: activeSubTab === 'upcoming' ? '2px solid var(--accent)' : '2px solid transparent',
                  paddingBottom: 4,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                Upcoming Deadlines
                {upcomingTasks.length > 0 && (
                  <span style={{ background: 'rgba(124,58,237,0.12)', color: 'var(--accent-light)', fontSize: '0.7rem', padding: '1px 6px', borderRadius: 10, border: '1px solid rgba(124,58,237,0.2)' }}>
                    {upcomingTasks.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* List display */}
          <div className="flex-1 overflow-y-auto max-h-64 pr-1 scrollbar-thin">
            {activeSubTab === 'overdue' ? (
              overdueTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-sm py-12" style={{ color: 'var(--text-muted)' }}>
                  <span className="text-2xl mb-2">🎉</span>
                  No overdue tasks! Keep it up.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {overdueTasks.map(task => (
                    <div
                      key={task.id}
                      onClick={() => onTaskClick(task)}
                      className="glass-card p-3.5 rounded-xl cursor-pointer hover:border-[rgba(239,68,68,0.4)] transition-all flex justify-between items-center"
                    >
                      <div className="min-w-0 pr-3">
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }} className="truncate">
                          {task.title}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          Column: <span className="font-semibold">{task.column_name}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 flex-shrink-0">
                        {task.due_date && (
                          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--danger)', background: 'var(--danger-soft)', padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(239,68,68,0.2)' }}>
                            Overdue: {task.due_date}
                          </span>
                        )}
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: task.priority === 'high' ? 'var(--priority-high-bg)' : task.priority === 'medium' ? 'var(--priority-med-bg)' : 'var(--priority-low-bg)', color: task.priority === 'high' ? 'var(--priority-high-text)' : task.priority === 'medium' ? 'var(--priority-med-text)' : 'var(--priority-low-text)' }}>
                          {task.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              upcomingTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-sm py-12" style={{ color: 'var(--text-muted)' }}>
                  <span className="text-2xl mb-2">📅</span>
                  No upcoming deadlines scheduled.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {upcomingTasks.map(task => {
                    // Calculate days remaining
                    const dueDate = new Date(task.due_date!)
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    const diffTime = dueDate.getTime() - today.getTime()
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                    let daysLabel = `Due in ${diffDays} day${diffDays !== 1 ? 's' : ''}`
                    if (diffDays === 0) daysLabel = 'Due today'
                    else if (diffDays === 1) daysLabel = 'Due tomorrow'

                    return (
                      <div
                        key={task.id}
                        onClick={() => onTaskClick(task)}
                        className="glass-card p-3.5 rounded-xl cursor-pointer hover:border-[rgba(124,58,237,0.4)] transition-all flex justify-between items-center"
                      >
                        <div className="min-w-0 pr-3">
                          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }} className="truncate">
                            {task.title}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            Column: <span className="font-semibold">{task.column_name}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5 flex-shrink-0">
                          {task.due_date && (
                            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--accent-light)', background: 'rgba(124,58,237,0.08)', padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(124,58,237,0.15)' }}>
                              {daysLabel} ({task.due_date})
                            </span>
                          )}
                          <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: task.priority === 'high' ? 'var(--priority-high-bg)' : task.priority === 'medium' ? 'var(--priority-med-bg)' : 'var(--priority-low-bg)', color: task.priority === 'high' ? 'var(--priority-high-text)' : task.priority === 'medium' ? 'var(--priority-med-text)' : 'var(--priority-low-text)' }}>
                            {task.priority.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
