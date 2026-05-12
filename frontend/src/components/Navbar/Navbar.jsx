import { useAuth } from '../../contexts/AuthContext'
import './Navbar.css'

/**
 * Navbar — barra superior fixa.
 *
 * Props:
 *   onMenuClick  → abre/fecha a Sidebar no mobile
 */
export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth()

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'D'

  return (
    <header className="nb-bar">

      {/* Esquerda — hambúrguer (mobile) + marca */}
      <div className="nb-left">
        <button
          className="nb-menu-btn"
          onClick={onMenuClick}
          aria-label="Abrir menu"
        >
          <span /><span /><span />
        </button>

        <div className="nb-brand">
          <span className="nb-brand-mark">D</span>
          <span className="nb-brand-name">DinaCare</span>
        </div>
      </div>

      {/* Direita — avatar + nome + logout */}
      <div className="nb-right">
        <span className="nb-user-name">{user?.name ?? 'Profissional'}</span>

        <div className="nb-avatar">{initials}</div>

        <button className="nb-logout" onClick={logout} aria-label="Sair">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>

    </header>
  )
}