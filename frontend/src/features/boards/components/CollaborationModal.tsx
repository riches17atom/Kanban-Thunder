import React, { useState, useEffect, useRef } from 'react'
import { Share2, Copy, Check, Search, UserPlus, X, Trash2, LogOut, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { boardsApi, type BoardDetail } from '@/api/endpoints/boards'
import { authApi } from '@/api/endpoints/auth'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type { User } from '@/api/types'

interface CollaborationModalProps {
  isOpen: boolean
  onClose: () => void
  board: BoardDetail
  onUpdate: (updatedBoard: BoardDetail) => void
}

export const CollaborationModal = ({ isOpen, onClose, board, onUpdate }: CollaborationModalProps) => {
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [memberToRemove, setMemberToRemove] = useState<{ id: number; name: string; isSelf: boolean } | null>(null)

  // Track if input is focused to handle keyboard dismissals or clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search users as query changes
  useEffect(() => {
    const search = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([])
        setShowDropdown(false)
        return
      }
      setIsSearching(true)
      try {
        const response = await authApi.searchUsers(searchQuery)
        setSearchResults(response.data)
        setShowDropdown(true)
      } catch (err) {
        console.error('Failed to search users:', err)
      } finally {
        setIsSearching(false)
      }
    }

    const timer = setTimeout(search, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  if (!isOpen) return null

  const inviteLink = `${window.location.origin}/join/${board.invite_token}`
  const isOwner = board.owner === user?.email

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      toast.success('Invite link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy link.')
    }
  }

  const handleResetLink = async () => {
    try {
      await boardsApi.resetInvite(board.slug)
      // fetch full details to reload columns and full board model
      const refetched = await boardsApi.get(board.slug)
      onUpdate(refetched.data)
      toast.success('Invite link reset successfully!')
    } catch {
      toast.error('Failed to reset link.')
    }
  }

  const handleSelectUser = (selectedUser: User) => {
    setSearchQuery(selectedUser.email)
    setShowDropdown(false)
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsAdding(true)
    try {
      await boardsApi.addMember(board.slug, searchQuery.trim())
      // Refetch board details to update parent state
      const refetched = await boardsApi.get(board.slug)
      onUpdate(refetched.data)
      setSearchQuery('')
      toast.success('Member added successfully!')
    } catch {
      // Error is handled by global client interceptor
    } finally {
      setIsAdding(false)
    }
  }

  const handleRemoveMember = async (memberId: number, isSelf: boolean) => {
    try {
      await boardsApi.removeMember(board.slug, memberId)
      
      if (isSelf) {
        toast.success('You left the board.')
        onClose()
        window.location.href = '/dashboard'
      } else {
        const refetched = await boardsApi.get(board.slug)
        onUpdate(refetched.data)
        toast.success('Member removed successfully.')
      }
    } catch {
      toast.error('Failed to remove member.')
    }
  }

  const getInitials = (first: string, last: string, email: string) => {
    const initials = `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase()
    return initials || email[0].toUpperCase()
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} className="glass-strong animate-slideUp" onClick={e => e.stopPropagation()}>
        {/* Accent Top Bar */}
        <div style={styles.modalAccent} />

        {/* Header */}
        <div style={styles.modalHeader}>
          <div style={styles.modalIconWrap}>
            <Share2 className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <h2 style={styles.modalTitle}>Board Collaboration</h2>
            <p style={styles.modalSub}>Manage team access and invite members</p>
          </div>
          <button style={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div style={{ padding: '0 24px 24px', maxHeight: '70vh', overflowY: 'auto' }} className="custom-scroll">
          {/* Section 1: Invite Link */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Invite Link</h3>
            <p style={styles.sectionDesc}>Anyone with access to this link can join as a collaborator.</p>
            
            <div style={styles.linkContainer}>
              <input
                type="text"
                readOnly
                value={inviteLink}
                style={styles.linkInput}
                onClick={handleCopyLink}
              />
              <button
                onClick={handleCopyLink}
                style={{
                  ...styles.actionIconBtn,
                  background: copied ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)',
                  color: copied ? 'var(--success)' : 'var(--text-primary)',
                  borderColor: copied ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)',
                }}
                title="Copy Link"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
              {isOwner && (
                <button
                  onClick={handleResetLink}
                  style={styles.actionIconBtn}
                  title="Reset invite token"
                >
                  <RefreshCw className="h-4 w-4 text-violet-400" />
                </button>
              )}
            </div>
          </div>

          {/* Section 2: Add Members (Only Owner) */}
          {isOwner && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Add Team Member</h3>
              <form onSubmit={handleAddMember} style={styles.addForm}>
                <div style={{ position: 'relative', flex: 1 }} ref={dropdownRef}>
                  <div style={styles.searchContainer}>
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search users by name or email..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      style={styles.searchInput}
                    />
                  </div>

                  {/* Dropdown Suggestions */}
                  {showDropdown && (searchResults.length > 0 || isSearching) && (
                    <div style={styles.dropdown} className="glass-strong">
                      {isSearching ? (
                        <div style={{ padding: '12px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <svg className="animate-spin h-3.5 w-3.5 text-slate-500" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Searching users...
                        </div>
                      ) : (
                        searchResults.map(u => (
                          <div
                            key={u.id}
                            style={styles.dropdownItem}
                            onClick={() => handleSelectUser(u)}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <div style={styles.dropdownAvatar}>
                              {getInitials(u.first_name, u.last_name, u.email)}
                            </div>
                            <div style={{ textAlign: 'left' }}>
                              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                {u.first_name} {u.last_name}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {u.email}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isAdding || !searchQuery.trim()}
                  style={{
                    ...styles.addBtn,
                    opacity: isAdding || !searchQuery.trim() ? 0.6 : 1,
                  }}
                >
                  {isAdding ? (
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Add
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Section 3: Current Members */}
          <div style={{ ...styles.section, borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
            <h3 style={styles.sectionTitle}>Collaborators ({board.members?.length ? board.members.length + 1 : 1})</h3>
            
            <div style={styles.membersList}>
              {/* Owner always shown first */}
              <div style={styles.memberRow}>
                <div style={{ ...styles.memberAvatar, background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
                  {board.owner_name ? board.owner_name[0].toUpperCase() : board.owner[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={styles.memberName}>{board.owner_name}</div>
                  <div style={styles.memberEmail}>{board.owner}</div>
                </div>
                <span style={{ ...styles.badge, color: '#fbbf24', background: 'rgba(245, 158, 11, 0.12)' }}>
                  Owner
                </span>
              </div>

              {/* Members */}
              {board.members && board.members.map(member => {
                const isSelf = member.email === user?.email
                return (
                  <div key={member.id} style={styles.memberRow}>
                    <div style={styles.memberAvatar}>
                      {getInitials(member.first_name, member.last_name, member.email)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={styles.memberName}>
                        {member.first_name} {member.last_name} {isSelf && '(You)'}
                      </div>
                      <div style={styles.memberEmail}>{member.email}</div>
                    </div>
                    
                    {/* Action: remove member or leave */}
                    {isOwner ? (
                      <button
                        onClick={() => setMemberToRemove({
                          id: member.id,
                          name: `${member.first_name} ${member.last_name}`.trim() || member.email,
                          isSelf: false
                        })}
                        style={styles.removeMemberBtn}
                        title="Remove collaborator"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : isSelf ? (
                      <button
                        onClick={() => setMemberToRemove({
                          id: member.id,
                          name: 'yourself',
                          isSelf: true
                        })}
                        style={styles.leaveBtn}
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Leave
                      </button>
                    ) : (
                      <span style={styles.badge}>Member</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Confirmation Overlay */}
          {memberToRemove && (
            <div style={styles.confirmOverlay}>
              <div style={styles.confirmCard} className="glass-strong animate-scaleIn">
                <h4 style={styles.confirmTitle}>
                  {memberToRemove.isSelf ? 'Leave Board?' : 'Remove Member?'}
                </h4>
                <p style={styles.confirmDesc}>
                  {memberToRemove.isSelf 
                    ? 'Are you sure you want to leave this board? You will lose access to all tasks and columns.'
                    : `Are you sure you want to remove ${memberToRemove.name} from this board?`}
                </p>
                <div style={styles.confirmActions}>
                  <button 
                    onClick={() => setMemberToRemove(null)} 
                    style={styles.confirmCancelBtn}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      handleRemoveMember(memberToRemove.id, memberToRemove.isSelf)
                      setMemberToRemove(null)
                    }} 
                    style={styles.confirmDeleteBtn}
                  >
                    {memberToRemove.isSelf ? 'Leave' : 'Remove'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(0,0,0,0.65)',
    backdropFilter: 'blur(6px)',
    animation: 'fadeIn 0.15s ease',
    padding: '20px',
  },
  modal: {
    width: '100%', maxWidth: 480,
    borderRadius: 20, overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  modalAccent: {
    height: 3,
    background: 'linear-gradient(90deg, var(--accent), var(--accent-end), #c084fc)',
  },
  modalHeader: {
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '24px 24px 20px',
  },
  modalIconWrap: {
    width: 42, height: 42, borderRadius: 12,
    background: 'rgba(124,58,237,0.12)',
    border: '1px solid rgba(124,58,237,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  modalTitle: {
    fontSize: '1.05rem', fontWeight: 700,
    color: 'var(--text-primary)', marginBottom: 2,
    textAlign: 'left',
  },
  modalSub: {
    fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 400,
    textAlign: 'left',
  },
  closeBtn: {
    marginLeft: 'auto', flexShrink: 0,
    width: 32, height: 32, borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    color: 'var(--text-muted)', cursor: 'pointer',
    transition: 'all 0.15s',
  },
  section: {
    paddingBottom: 20,
    marginBottom: 20,
    borderBottom: '1px solid var(--border-subtle)',
    textAlign: 'left',
  },
  sectionTitle: {
    fontSize: '0.85rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--text-secondary)',
    marginBottom: 8,
  },
  sectionDesc: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    marginBottom: 12,
  },
  linkContainer: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  linkInput: {
    flex: 1,
    padding: '9px 12px',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 10,
    color: 'var(--text-muted)',
    fontSize: '0.8rem',
    outline: 'none',
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
  },
  actionIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    border: '1px solid var(--border-subtle)',
    background: 'var(--bg-surface)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--text-primary)',
    transition: 'all 0.2s',
    flexShrink: 0,
  },
  addForm: {
    display: 'flex',
    gap: 8,
    alignItems: 'flex-start',
  },
  searchContainer: {
    position: 'relative',
    width: '100%',
  },
  searchInput: {
    width: '100%',
    padding: '9px 12px 9px 36px',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 10,
    color: 'var(--text-primary)',
    fontSize: '0.84rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    fontFamily: 'var(--font-sans)',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    left: 0,
    right: 0,
    borderRadius: 12,
    maxHeight: 180,
    overflowY: 'auto',
    zIndex: 200,
    border: '1px solid var(--border-medium)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 12px',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  dropdownAvatar: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    background: 'var(--accent)',
    color: '#fff',
    fontSize: '0.75rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '9px 18px',
    borderRadius: 10,
    background: 'linear-gradient(135deg, var(--accent), var(--accent-end))',
    color: '#fff',
    fontSize: '0.84rem',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    height: 38,
    boxShadow: '0 4px 16px rgba(124,58,237,0.25)',
  },
  membersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginTop: 10,
  },
  memberRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '8px 12px',
    borderRadius: 12,
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
  },
  memberAvatar: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--accent), var(--accent-end))',
    color: '#fff',
    fontSize: '0.78rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  memberName: {
    fontSize: '0.84rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  memberEmail: {
    fontSize: '0.74rem',
    color: 'var(--text-muted)',
    marginTop: 1,
  },
  badge: {
    padding: '3px 8px',
    borderRadius: 8,
    fontSize: '0.7rem',
    fontWeight: 600,
    background: 'var(--bg-surface-2)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-subtle)',
  },
  removeMemberBtn: {
    padding: 6,
    borderRadius: 6,
    color: 'var(--danger)',
    cursor: 'pointer',
    background: 'transparent',
    border: 'none',
    transition: 'background 0.15s',
  },
  leaveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '4px 10px',
    borderRadius: 8,
    border: '1px solid rgba(239, 68, 68, 0.25)',
    background: 'rgba(239, 68, 68, 0.08)',
    color: 'var(--danger)',
    fontSize: '0.74rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  confirmOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    zIndex: 1010,
    animation: 'fadeIn 0.2s ease',
  },
  confirmCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    padding: '20px',
    textAlign: 'center',
    border: '1px solid var(--border-medium)',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
  },
  confirmTitle: {
    fontSize: '0.95rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: 8,
  },
  confirmDesc: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
    marginBottom: 20,
  },
  confirmActions: {
    display: 'flex',
    gap: 10,
    justifyContent: 'center',
  },
  confirmCancelBtn: {
    padding: '8px 16px',
    borderRadius: 8,
    border: '1px solid var(--border-subtle)',
    background: 'var(--bg-surface)',
    color: 'var(--text-secondary)',
    fontSize: '0.78rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  confirmDeleteBtn: {
    padding: '8px 16px',
    borderRadius: 8,
    border: 'none',
    background: 'linear-gradient(135deg, var(--danger, #ef4444), #b91c1c)',
    color: '#fff',
    fontSize: '0.78rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
    transition: 'all 0.15s',
  },
}
