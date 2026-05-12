import { createContext, useContext, useState, useCallback } from 'react'
import api from '../api/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  const [token, setToken] = useState(() => localStorage.getItem('token') ?? null)

  // ── login ────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    // MOCK TEMPORÁRIO — remover quando API estiver pronta
    if (email === 'dina@teste.com' && password === '123456') {
      const fakeToken = 'fake-jwt-token'
      const fakeUser  = { id: 1, name: 'Dina Oliveira', email }

      localStorage.setItem('token', fakeToken)
      localStorage.setItem('user', JSON.stringify(fakeUser))
      setToken(fakeToken)
      setUser(fakeUser)
      return fakeUser
    }

    // Simula erro 401 para qualquer outra credencial
    const err = new Error('Unauthorized')
    err.response = { status: 401 }
    throw err

    // PRODUÇÃO — descomentar quando API estiver pronta:
    // const { data } = await api.post('/auth/login', { email, password })
    // const { token: newToken, user: newUser } = data
    // localStorage.setItem('token', newToken)
    // localStorage.setItem('user', JSON.stringify(newUser))
    // setToken(newToken)
    // setUser(newUser)
    // return newUser
  }, [])

  // ── logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }, [])

  const isAuthenticated = !!token

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}