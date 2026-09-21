import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useBoards } from '@/features/kanban/hooks/useBoards'
import { BoardCard } from '@/features/boards/components/BoardCard'
import { CreateBoardModal } from '@/features/boards/components/CreateBoardModal'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { tasksApi } from '@/api/endpoints/tasks'
import type { Task } from '@/api/endpoints/boards'
import { ThemeToggle } from '@/components/ThemeToggle'

export const Dashboard = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { boards, isLoading, fetchBoards, createBoard, deleteBoard, duplicateBoard } = useBoards()

  const [showLogoutModal, setShowLogoutModal]   = useState(false)
  const [isLoggingOut, setIsLoggingOut]         = useState(false)
  const [showCreateModal, setShowCreateModal]   = useState(false)
  const [showDeleteModal, setShowDeleteModal]   = useState(false)
  const [boardToDelete, setBoardToDelete]       = useState<{ slug: string; name: string } | null>(null)
  const [showUserMenu, setShowUserMenu]         = useState(false)
  const [mounted, setMounted]                   = useState(false)

  const [tasks, setTasks]                       = useState<Task[]>([])
  const [tasksLoading, setTasksLoading]         = useState(false)
  const [searchQuery, setSearchQuery]           = useState('')
  const [activeTab, setActiveTab]               = useState<'all' | 'owned' | 'shared'>('all')
  const [sortBy, setSortBy]                     = useState<'name-asc' | 'name-desc' | 'tasks-desc' | 'tasks-asc' | 'columns-desc' | 'created-desc'>('created-desc')

  const fetchTasks = async () => {
    setTasksLoading(true)
    try {
      const response = await tasksApi.list()
      setTasks(response.data)
    } catch (err) {
      console.error('Failed to fetch tasks:', err)
    } finally {
      setTasksLoading(false)
    }
  }

  useEffect(() => { fetchBoards() }, [fetchBoards])
  useEffect(() => { fetchTasks() }, [])
  useEffect(() => { const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t) }, [])

  // Close user menu on outside click
  useEffect(() => {
    const handler = () => setShowUserMenu(false)
    if (showUserMenu) window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [showUserMenu])

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      toast.success('Logged out successfully')
      navigate('/login')
    } catch {
      navigate('/login')
    } finally {
      setIsLoggingOut(false)
      setShowLogoutModal(false)
    }
  }

  const handleCreateBoard = async (data: { name: string; description: string }) => {
    const board = await createBoard(data)
    navigate(`/boards/${board.slug}`)
  }

  const handleDeleteClick = (slug: string, name: string) => {
    setBoardToDelete({ slug, name })
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!boardToDelete) return
    await deleteBoard(boardToDelete.slug)
    setShowDeleteModal(false)
    setBoardToDelete(null)
  }

  const getBoardSlug = (boardId: number, boardName: string) => {
    const b = boards.find(x => x.id === boardId)
    return b ? b.slug : boardName.toLowerCase().replace(/\s+/g, '-')
  }

  const totalTasks = boards.reduce((acc, b) => acc + (b.tasks_count ?? 0), 0)

  const initials = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() || user.email[0].toUpperCase()
    : '?'

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  // Dynamic filter / search / sort board logic
  const filteredSortedBoards = boards
    .filter((board) => {
      const query = searchQuery.toLowerCase().trim()
      const matchesSearch =
        board.name.toLowerCase().includes(query) ||
        (board.description || '').toLowerCase().includes(query)
      
      if (!matchesSearch) return false
      if (activeTab === 'owned') {
        return board.owner_id === user?.id
      }
      if (activeTab === 'shared') {
        return board.owner_id !== user?.id
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'name-asc') {
        return a.name.localeCompare(b.name)
      }
      if (sortBy === 'name-desc') {
        return b.name.localeCompare(a.name)
      }
      if (sortBy === 'tasks-desc') {
        return (b.tasks_count ?? 0) - (a.tasks_count ?? 0)
      }
      if (sortBy === 'tasks-asc') {
        return (a.tasks_count ?? 0) - (b.tasks_count ?? 0)
      }
      if (sortBy === 'columns-desc') {
        return (b.columns_count ?? 0) - (a.columns_count ?? 0)
      }
      if (sortBy === 'created-desc') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
      return 0
    })

  // Task analysis calculations
  const highPriorityTasks = tasks.filter(t => t.priority === 'high' && !t.is_archived).length
  const medPriorityTasks = tasks.filter(t => t.priority === 'medium' && !t.is_archived).length
  const lowPriorityTasks = tasks.filter(t => t.priority === 'low' && !t.is_archived).length
  const myAssignedTasks = tasks.filter(t => t.assignee?.id === user?.id && !t.is_archived).length

  // Overdue and upcoming task filtering
  const overdueTasks = tasks.filter(t => {
    if (t.is_archived) return false
    if (t.column_name?.toLowerCase() === 'done') return false
    return t.is_overdue || (t.due_date && new Date(t.due_date).getTime() < Date.now())
  })

  const upcomingTasks = tasks.filter(t => {
    if (t.is_archived) return false
    if (t.column_name?.toLowerCase() === 'done') return false
    if (!t.due_date) return false
    const dueTime = new Date(t.due_date).getTime()
    const now = Date.now()
    const diffDays = (dueTime - now) / (1000 * 60 * 60 * 24)
    return diffDays >= 0 && diffDays <= 3
  })

  return (
    <div style={styles.root}>
      {/* Background aura blobs */}
      <div style={styles.aura1} />
      <div style={styles.aura2} />

      {/* ── NAVBAR ── */}
      <nav style={styles.nav} className="glass">
        <div style={styles.navInner}>
          {/* Logo */}
          <Link to="/" style={styles.logo}>
            <span style={styles.logoIcon}>⚡</span>
            <span style={styles.logoText} className="gradient-text">Thunder</span>
          </Link>

          {/* Right section */}
          <div style={styles.navRight}>
            <ThemeToggle />
            {/* User avatar + dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                style={styles.avatarBtn}
                onClick={(e) => { e.stopPropagation(); setShowUserMenu(v => !v) }}
                title={`${user?.first_name} ${user?.last_name}`}
              >
                <div style={styles.avatar}>{initials}</div>
                <span style={styles.avatarName}>{user?.first_name}</span>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showUserMenu && (
                <div style={styles.dropdown} className="glass-strong" onClick={e => e.stopPropagation()}>
                  <div style={styles.dropdownHeader}>
                    <div style={styles.dropdownAvatar}>{initials}</div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {user?.first_name} {user?.last_name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{user?.email}</div>
                    </div>
                  </div>
                  <div style={styles.dropdownDivider} />
                  <button
                    style={styles.dropdownItem}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--danger-soft)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => { setShowUserMenu(false); setShowLogoutModal(true) }}
                  >
                    <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--danger)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span style={{ color: 'var(--danger)' }}>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── MAIN ── */}
      <main style={styles.main}>

        {/* Header */}
        <div style={{ ...styles.header, opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(16px)', transition: 'all 0.5s ease' }}>
          <div>
            <p style={styles.greeting}>{greeting},</p>
            <h1 style={styles.heroTitle}>
              <span className="gradient-text">{user?.first_name ?? 'there'}</span> 👋
            </h1>
            <p style={styles.heroSub}>Here's what you're working on today.</p>
          </div>
        </div>

        {/* ── METRICS GRID ── */}
        <div style={styles.metricsGrid}>
          {/* Card 1: Boards summary */}
          <div style={styles.metricCard} className="glass">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>BOARDS SUMMARY</span>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 4, color: 'var(--text-primary)', lineHeight: 1 }}>{boards.length}</h3>
              </div>
              <div style={{ padding: 8, borderRadius: 10, background: 'rgba(124, 58, 237, 0.1)', color: 'var(--accent-light)' }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 8 }}>
              {boards.filter(b => b.owner_id === user?.id).length} owned · {boards.filter(b => b.owner_id !== user?.id).length} collaborated
            </span>
          </div>

          {/* Card 2: Tasks assigned */}
          <div style={styles.metricCard} className="glass">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>TASKS ASSIGNED</span>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: 4, color: 'var(--text-primary)', lineHeight: 1 }}>{myAssignedTasks}</h3>
              </div>
              <div style={{ padding: 8, borderRadius: 10, background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 8 }}>
              Across active boards ({totalTasks} total tasks)
            </span>
          </div>

          {/* Card 3: Priority breakdown */}
          <div style={styles.metricCard} className="glass">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>PRIORITIES</span>
              <div style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(255, 255, 255, 0.05)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                Active
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)' }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{highPriorityTasks}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>High</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--priority-med-bar)' }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{medPriorityTasks}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Med</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{lowPriorityTasks}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Low</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── CONTROLS ROW ── */}
        <div className="dashboard-controls">
          {/* Tabs */}
          <div style={styles.tabContainer}>
            <button
              style={{
                ...styles.tabBtn,
                background: activeTab === 'all' ? 'linear-gradient(135deg, var(--accent), var(--accent-end))' : 'transparent',
                color: activeTab === 'all' ? '#fff' : 'var(--text-secondary)',
              }}
              onClick={() => setActiveTab('all')}
            >
              All Boards
            </button>
            <button
              style={{
                ...styles.tabBtn,
                background: activeTab === 'owned' ? 'linear-gradient(135deg, var(--accent), var(--accent-end))' : 'transparent',
                color: activeTab === 'owned' ? '#fff' : 'var(--text-secondary)',
              }}
              onClick={() => setActiveTab('owned')}
            >
              Owned by Me
            </button>
            <button
              style={{
                ...styles.tabBtn,
                background: activeTab === 'shared' ? 'linear-gradient(135deg, var(--accent), var(--accent-end))' : 'transparent',
                color: activeTab === 'shared' ? '#fff' : 'var(--text-secondary)',
              }}
              onClick={() => setActiveTab('shared')}
            >
              Shared with Me
            </button>
          </div>

          {/* Search and Sort */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={styles.searchWrapper}>
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={styles.searchIcon}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search boards..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="dark-input"
                style={styles.searchInput}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.85rem' }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              style={styles.sortSelect}
            >
              <option value="created-desc">Recently Created</option>
              <option value="name-asc">Alphabetical (A - Z)</option>
              <option value="name-desc">Alphabetical (Z - A)</option>
              <option value="tasks-desc">Most Tasks First</option>
              <option value="tasks-asc">Least Tasks First</option>
              <option value="columns-desc">Most Columns First</option>
            </select>
          </div>
        </div>

        {/* ── TWO COLUMN LAYOUT ── */}
        <div className="dashboard-layout">
          {/* LEFT: Boards Grid */}
          <div>
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>My Boards</h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {filteredSortedBoards.length === 0 
                    ? 'No matching boards' 
                    : `${filteredSortedBoards.length} board${filteredSortedBoards.length !== 1 ? 's' : ''} found`}
                </p>
              </div>
              <button
                id="create-board-btn"
                style={styles.createBtn}
                onClick={() => setShowCreateModal(true)}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.45)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,58,237,0.3)' }}
              >
                <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                New Board
              </button>
            </div>

            {isLoading ? (
              <div style={styles.skeletonGrid}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={styles.skeletonCard} className="glass">
                    <div style={{ height: 4, borderRadius: 4, marginBottom: 20 }} className="skeleton" />
                    <div style={{ height: 20, width: '60%', marginBottom: 10 }} className="skeleton" />
                    <div style={{ height: 14, width: '80%', marginBottom: 6 }} className="skeleton" />
                    <div style={{ height: 14, width: '50%', marginBottom: 28 }} className="skeleton" />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div style={{ height: 28, width: 80, borderRadius: 20 }} className="skeleton" />
                      <div style={{ height: 28, width: 68, borderRadius: 20 }} className="skeleton" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredSortedBoards.length === 0 ? (
              <div style={styles.emptyState} className="glass">
                <div style={styles.emptyIcon}>
                  <span style={{ fontSize: '3rem', animation: 'float 3s ease-in-out infinite', display: 'block' }}>📋</span>
                </div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                  {boards.length === 0 ? 'No boards yet' : 'No boards match search'}
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 28, maxWidth: 320, textAlign: 'center' }}>
                  {boards.length === 0 
                    ? 'Create your first Kanban board and start organizing your work like a pro.' 
                    : 'Try clearing your search query or switching filter tabs.'}
                </p>
                {boards.length === 0 && (
                  <button
                    style={styles.createBtn}
                    onClick={() => setShowCreateModal(true)}
                  >
                    <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    Create First Board
                  </button>
                )}
              </div>
            ) : (
              <div style={styles.grid}>
                {filteredSortedBoards.map((board, idx) => (
                  <div
                    key={board.id}
                    style={{
                      animation: `slideUp 0.4s ease both`,
                      animationDelay: `${idx * 60}ms`,
                    }}
                  >
                    <BoardCard
                      id={board.id}
                      slug={board.slug}
                      name={board.name}
                      description={board.description}
                      columnsCount={board.columns_count}
                      tasksCount={board.tasks_count}
                      colorIndex={idx % 6}
                      onDuplicate={() => duplicateBoard(board.slug)}
                      onDelete={() => handleDeleteClick(board.slug, board.name)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Tasks & Deadlines Sidebar */}
          <div style={styles.sidebar}>
            {/* Overdue / Upcoming warning card */}
            {(overdueTasks.length > 0 || upcomingTasks.length > 0) && (
              <div style={{ ...styles.sidebarCard, border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.02)' }} className="glass">
                <h3 style={{ ...styles.sidebarTitle, color: 'var(--danger)', marginBottom: 12 }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: 2 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Critical Deadlines
                </h3>
                
                {/* Overdue List */}
                {overdueTasks.map(t => (
                  <Link to={`/boards/${getBoardSlug(t.board_id, t.board_name)}`} key={t.id} style={styles.sidebarItem} className="sidebar-hover-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: 160 }}>{t.title}</span>
                      <span style={{ fontSize: '0.62rem', padding: '2px 6px', borderRadius: 4, background: 'var(--danger-soft)', color: 'var(--danger)', fontWeight: 700 }}>OVERDUE</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      <span>Board: {t.board_name}</span>
                      <span>Due: {t.due_date ? new Date(t.due_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : 'N/A'}</span>
                    </div>
                  </Link>
                ))}

                {/* Upcoming List */}
                {upcomingTasks.map(t => (
                  <Link to={`/boards/${getBoardSlug(t.board_id, t.board_name)}`} key={t.id} style={styles.sidebarItem} className="sidebar-hover-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: 160 }}>{t.title}</span>
                      <span style={{ fontSize: '0.62rem', padding: '2px 6px', borderRadius: 4, background: 'var(--priority-med-bg)', color: 'var(--priority-med-text)', fontWeight: 700 }}>DUE SOON</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      <span>Board: {t.board_name}</span>
                      <span>Due: {t.due_date ? new Date(t.due_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}) : 'N/A'}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* My Assigned Tasks panel */}
            <div style={styles.sidebarCard} className="glass">
              <h3 style={styles.sidebarTitle}>
                <svg width="16" height="16" fill="none" stroke="var(--accent-light)" viewBox="0 0 24 24" style={{ marginRight: 2 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                My Tasks ({tasks.filter(t => t.assignee?.id === user?.id && !t.is_archived && t.column_name?.toLowerCase() !== 'done').length})
              </h3>

              {tasksLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ height: 48, borderRadius: 10 }} className="skeleton" />
                  <div style={{ height: 48, borderRadius: 10 }} className="skeleton" />
                </div>
              ) : tasks.filter(t => t.assignee?.id === user?.id && !t.is_archived && t.column_name?.toLowerCase() !== 'done').length === 0 ? (
                <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  🎉 No pending tasks assigned to you.
                </div>
              ) : (
                <div style={{ maxHeight: 380, overflowY: 'auto', paddingRight: 4 }}>
                  {tasks
                    .filter(t => t.assignee?.id === user?.id && !t.is_archived && t.column_name?.toLowerCase() !== 'done')
                    .map(t => (
                      <Link 
                        to={`/boards/${getBoardSlug(t.board_id, t.board_name)}`} 
                        key={t.id} 
                        style={styles.sidebarItem}
                        className="sidebar-hover-item"
                      >
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{t.title}</span>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                          <span>{t.column_name}</span>
                          <span style={{ 
                            fontSize: '0.65rem', 
                            padding: '1px 5px', 
                            borderRadius: 4, 
                            background: t.priority === 'high' ? 'var(--priority-high-bg)' : t.priority === 'medium' ? 'var(--priority-med-bg)' : 'var(--priority-low-bg)', 
                            color: t.priority === 'high' ? 'var(--priority-high-text)' : t.priority === 'medium' ? 'var(--priority-med-text)' : 'var(--priority-low-text)',
                            textTransform: 'uppercase',
                            fontWeight: 700
                          }}>
                            {t.priority}
                          </span>
                        </div>
                      </Link>
                    ))
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <CreateBoardModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateBoard}
      />

      <ConfirmDialog
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
        title="Sign out"
        description="Are you sure you want to sign out of Thunder?"
        confirmText="Sign out"
        cancelText="Stay"
        isLoading={isLoggingOut}
        variant="danger"
      />

      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setBoardToDelete(null) }}
        onConfirm={handleDeleteConfirm}
        title="Delete Board"
        description={`Are you sure you want to delete "${boardToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  )
}

/* ─────────────────────────────────────────────
   STYLES
   ───────────────────────────────────────────── */
const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100vh',
    background: 'var(--bg-base)',
    position: 'relative',
    overflowX: 'hidden',
  },
  aura1: {
    position: 'fixed', top: '-20vh', left: '-10vw',
    width: '55vw', height: '55vw',
    background: 'radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)',
    borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
  },
  aura2: {
    position: 'fixed', bottom: '-20vh', right: '-10vw',
    width: '50vw', height: '50vw',
    background: 'radial-gradient(ellipse, rgba(79,70,229,0.10) 0%, transparent 70%)',
    borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
  },
  nav: {
    position: 'sticky', top: 0, zIndex: 100,
    borderBottom: '1px solid var(--border-subtle)',
    borderRadius: 0,
  },
  navInner: {
    maxWidth: 1280, margin: '0 auto',
    padding: '0 28px',
    height: 64,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  logo: { display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' },
  logoIcon: { fontSize: '1.5rem', lineHeight: 1 },
  logoText: { fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em' },
  navRight: { display: 'flex', alignItems: 'center', gap: 12 },
  avatarBtn: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '6px 10px 6px 6px',
    borderRadius: 40,
    border: '1px solid var(--border-subtle)',
    background: 'var(--bg-surface)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: 'var(--text-secondary)',
    fontSize: '0.85rem', fontWeight: 500,
  },
  avatar: {
    width: 32, height: 32, borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--accent), var(--accent-end))',
    color: '#fff',
    fontSize: '0.78rem', fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  avatarName: { color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.85rem' },
  dropdown: {
    position: 'absolute', top: 'calc(100% + 10px)', right: 0,
    minWidth: 220,
    padding: '8px',
    animation: 'slideDown 0.18s ease',
    zIndex: 200,
    borderRadius: 14,
  },
  dropdownHeader: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 10px 12px',
  },
  dropdownAvatar: {
    width: 36, height: 36, borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--accent), var(--accent-end))',
    color: '#fff', fontSize: '0.85rem', fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  dropdownDivider: { height: 1, background: 'var(--border-subtle)', margin: '0 4px 6px' },
  dropdownItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    width: '100%', padding: '9px 10px',
    borderRadius: 8,
    fontSize: '0.85rem', fontWeight: 500,
    cursor: 'pointer',
    transition: 'background 0.15s',
    background: 'transparent',
  },
  main: {
    maxWidth: 1280, margin: '0 auto',
    padding: '48px 28px 80px',
    position: 'relative', zIndex: 1,
  },
  header: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    marginBottom: 32, gap: 20, flexWrap: 'wrap',
  },
  greeting: { fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400, marginBottom: 4 },
  heroTitle: { fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 8 },
  heroSub: { fontSize: '0.92rem', color: 'var(--text-secondary)' },
  sectionHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 24,
  },
  sectionTitle: { fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' },
  createBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '11px 22px',
    borderRadius: 40,
    background: 'linear-gradient(135deg, var(--accent), var(--accent-end))',
    color: '#fff', fontSize: '0.88rem', fontWeight: 600,
    boxShadow: '0 4px 20px rgba(124,58,237,0.3)',
    transition: 'all 0.25s ease',
    cursor: 'pointer',
    border: 'none',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 20,
  },
  skeletonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 20,
  },
  skeletonCard: {
    padding: 24, borderRadius: 16,
    animation: 'fadeIn 0.4s ease',
  },
  emptyState: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '72px 24px',
    borderRadius: 20,
    border: '1.5px dashed rgba(124,58,237,0.3)',
    animation: 'fadeIn 0.5s ease',
    width: '100%',
  },
  emptyIcon: {
    width: 80, height: 80, borderRadius: '50%',
    background: 'rgba(124,58,237,0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 16,
    marginBottom: 32,
  },
  metricCard: {
    padding: '16px 20px',
    borderRadius: 16,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: 105,
    transition: 'transform 0.2s',
  },
  tabContainer: {
    display: 'flex',
    gap: 4,
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    padding: 3,
    borderRadius: 30,
    alignItems: 'center',
    width: 'fit-content',
  },
  tabBtn: {
    padding: '7px 16px',
    borderRadius: 25,
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: 'none',
  },
  searchWrapper: {
    position: 'relative',
    minWidth: 200,
    maxWidth: 280,
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  },
  searchInput: {
    paddingLeft: 34,
    paddingRight: 30,
    height: 38,
    borderRadius: 30,
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    color: 'var(--text-primary)',
    fontSize: '0.82rem',
    outline: 'none',
    width: '100%',
  },
  sortSelect: {
    padding: '0 16px',
    height: 38,
    borderRadius: 30,
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    color: 'var(--text-primary)',
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
    outline: 'none',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  sidebarCard: {
    padding: 20,
    borderRadius: 16,
    display: 'flex',
    flexDirection: 'column',
  },
  sidebarTitle: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  sidebarItem: {
    padding: '10px 12px',
    borderRadius: 10,
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    marginBottom: 8,
    transition: 'all 0.2s',
    textDecoration: 'none',
  },
}