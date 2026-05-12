import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import './Login.css'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleSubmit(e) {
    e.preventDefault()

    if (!email.trim())    { setError('Informe seu e-mail.');  return }
    if (!password.trim()) { setError('Informe sua senha.');   return }

    setLoading(true)
    setError('')

    try {
      await login(email.trim(), password)
      navigate('/home', { replace: true })
    } catch (err) {
      const status = err?.response?.status
      if (status === 401) setError('E-mail ou senha incorretos.')
      else if (status === 404) setError('Conta não encontrada.')
      else setError('Não foi possível conectar. Tente novamente.')
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
              <label htmlFor="ln-email">E-mail</label>
              <input
                id="ln-email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                autoComplete="email"
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
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {error && (
              <div className="ln-error" role="alert">
                <span>⚠</span> {error}
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