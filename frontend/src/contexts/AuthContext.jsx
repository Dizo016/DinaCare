import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import api from '../api/api'

const AuthContext = createContext(null)

const NOTIF_KEY = 'dinacare_notif_seen_at'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  const [token, setToken] = useState(() => localStorage.getItem('token') ?? null)
  const [pendingCount, setPendingCount] = useState(0)
  const [hasUnread, setHasUnread] = useState(false)

  const login = useCallback(async (login, password) => {
    const { data } = await api.post('/auth/login', { login, password })
    localStorage.setItem('token', data.token)
    setToken(data.token)

    const { data: userData } = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${data.token}` },
    })
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    setPendingCount(0)
    setHasUnread(false)
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const { data: userData } = await api.get('/auth/me')
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      return userData
    } catch { /* silencioso */ }
  }, [])
  const refreshPendingCount = useCallback(async (userId) => {
    try {
      const { data } = await api.get(`/appointments/user/${userId}/pending-count`)
      setPendingCount(data)

      const seenAt = localStorage.getItem(NOTIF_KEY)
      const seenCount = seenAt ? parseInt(seenAt) : 0
      setHasUnread(data > seenCount)
    } catch {
      // silencioso
    }
  }, [])

  // Marca notificações como vistas
  const markNotificationsRead = useCallback(() => {
    localStorage.setItem(NOTIF_KEY, String(pendingCount))
    setHasUnread(false)
  }, [pendingCount])

  // Polling a cada 30s enquanto logado
  useEffect(() => {
    if (!user?.id || !token) return
    refreshPendingCount(user.id)
    const interval = setInterval(() => refreshPendingCount(user.id), 30000)
    return () => clearInterval(interval)
  }, [user?.id, token, refreshPendingCount])

  const isAuthenticated = !!token

  return (
    <AuthContext.Provider value={{
      user, token, isAuthenticated,
      pendingCount, hasUnread,
      login, logout,
      refreshUser,
      refreshPendingCount, markNotificationsRead,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}