const CACHE_PREFIX = 'kanban_cache'

interface CacheEntry<T> {
  data: T
  timestamp: number
}

class CacheService {
  private getUserId(): string | null {
    try {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        return String(user.id)
      }
    } catch {
      return null
    }
    return null
  }

  private getUserPrefix(): string {
    const userId = this.getUserId()
    return userId ? `${CACHE_PREFIX}_${userId}` : CACHE_PREFIX
  }

  private getKey(key: string): string {
    return `${this.getUserPrefix()}_${key}`
  }

  set<T>(key: string, data: T): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    }

    try {
      localStorage.setItem(this.getKey(key), JSON.stringify(entry))
    } catch (error) {
      console.warn('Cache write failed:', error)
      this.clearOldEntries()
    }
  }

  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.getKey(key))
      if (!item) return null

      const entry: CacheEntry<T> = JSON.parse(item)
      return entry.data
    } catch {
      return null
    }
  }

  remove(key: string): void {
    localStorage.removeItem(this.getKey(key))
  }

  clearUserCache(): void {
    const prefix = this.getUserPrefix()
    const keysToRemove: string[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(prefix)) {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key))
  }

  clearAllCache(): void {
    const keysToRemove: string[] = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key))
  }

  private clearOldEntries(): void {
    const entries: { key: string; timestamp: number }[] = []
    const prefix = this.getUserPrefix()

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(prefix)) {
        try {
          const item = localStorage.getItem(key)
          if (item) {
            const parsed = JSON.parse(item)
            entries.push({ key, timestamp: parsed.timestamp || 0 })
          }
        } catch {
          if (key) localStorage.removeItem(key)
        }
      }
    }

    entries
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(0, Math.ceil(entries.length * 0.25))
      .forEach((entry) => localStorage.removeItem(entry.key))
  }
}

export const cacheService = new CacheService()