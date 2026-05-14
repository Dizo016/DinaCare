import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import './Login.css'

export default function Login() {
  const { login: doLogin } = useAuth()
  const navigate = useNavigate()

  const [loginValue, setLoginValue] = useState('')
  const [password, setPassword]     = useState('')
  const [showPass, setShowPass]     = useState(false)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  async function handleSubmit(e) {
    e.preventDefault()

    if (!loginValue.trim()) { setError('Informe seu login.'); return }
    if (!password.trim())   { setError('Informe sua senha.'); return }

    setLoading(true)
    setError('')

    try {
      await doLogin(loginValue.trim(), password)
      navigate('/home', { replace: true })
    } catch (err) {
      const status = err?.response?.status
      if (status === 401)      setError('Login ou senha incorretos.')
      else if (status === 404) setError('Conta não encontrada.')
      else                     setError('Não foi possível conectar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ln-page">

      {/* Painel esquerdo — decorativo */}
      <aside className="ln-aside">
        <div className="ln-aside-content">
          <div className="ln-logo-mark">D</div>
          <h2 className="ln-aside-title">Seu negócio de beleza, organizado.</h2>
          <p className="ln-aside-sub">
            Gerencie seus agendamentos, clientes e serviços em um só lugar.
          </p>
          <div className="ln-aside-dots">
            <span /><span /><span />
          </div>
        </div>
        <div className="ln-aside-bg" aria-hidden="true" />
      </aside>

      {/* Painel direito — formulário */}
      <main className="ln-main">
        <div className="ln-form-wrapper">

          <div className="ln-brand">
            <span className="ln-brand-mark">D</span>
            <span className="ln-brand-name">DinaCare</span>
          </div>

          <div className="ln-heading">
            <h1>Bem-vinda de volta</h1>
            <p>Entre na sua conta para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="ln-form" noValidate>

            <div className="ln-field">
              <label htmlFor="ln-login">Login</label>
              <input
                id="ln-login"
                type="text"
                placeholder="seu.login"
                value={loginValue}
                onChange={(e) => { setLoginValue(e.target.value); setError('') }}
                autoComplete="username"
                autoFocus
              />
            </div>

            <div className="ln-field">
              <label htmlFor="ln-pass">Senha</label>
              <div className="ln-pass-wrapper">
                <input
                  id="ln-pass"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="ln-pass-toggle"
                  onClick={() => setShowPass((s) => !s)}
                  aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPass ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="ln-error" role="alert">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <button type="submit" className="ln-btn" disabled={loading}>
              {loading
                ? <span className="ln-btn-spinner" />
                : 'Entrar'
              }
            </button>

          </form>

          <p className="ln-footer-text">
            DinaCare &copy; {new Date().getFullYear()}
          </p>

        </div>
      </main>

    </div>
  )
}