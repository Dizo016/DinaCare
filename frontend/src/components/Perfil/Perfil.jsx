import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../api/api'
import './Perfil.css'

export default function Perfil() {
  const { user, refreshUser } = useAuth()

  const [especialidade, setEspecialidade] = useState('')
  const [bio, setBio]                     = useState('')
  const [endereco, setEndereco]           = useState('')

  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso]   = useState(false)
  const [erro, setErro]         = useState('')

  useEffect(() => {
    if (user) {
      setEspecialidade(user.especialidade ?? '')
      setBio(user.bio ?? '')
      setEndereco(user.endereco ?? '')
    }
  }, [user])

  const perfilIncompleto = !user?.especialidade && !user?.bio && !user?.endereco

  async function salvar(e) {
    e.preventDefault()
    setSalvando(true)
    setSucesso(false)
    setErro('')

    try {
      await api.patch(`/users/${user.id}/profile`, {
        especialidade: especialidade.trim() || null,
        bio:           bio.trim()           || null,
        endereco:      endereco.trim()      || null,
      })
      await refreshUser()
      setSucesso(true)
      setTimeout(() => setSucesso(false), 3000)
    } catch {
      setErro('Não foi possível salvar. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="perfil-tela">

      <div className="perfil-header">
        <h2 className="perfil-titulo">Meu Perfil</h2>
        <p className="perfil-sub">
          Essas informações aparecem na sua página pública de agendamento.
        </p>
      </div>

      {/* Banner de perfil incompleto */}
      {perfilIncompleto && (
        <div className="perfil-banner">
          <div className="perfil-banner-icone">✨</div>
          <div className="perfil-banner-texto">
            <strong>Complete seus dados para atrair mais clientes!</strong>
            <span>Uma bio e especialidade transmitem confiança e profissionalismo.</span>
          </div>
        </div>
      )}

      {/* Info somente leitura */}
      <div className="perfil-card perfil-card--readonly">
        <div className="perfil-avatar">
          {user?.name?.[0]?.toUpperCase() ?? 'D'}
        </div>
        <div className="perfil-info">
          <span className="perfil-nome">{user?.name}</span>
          <span className="perfil-login">{user?.login}</span>
        </div>
      </div>

      <form onSubmit={salvar} className="perfil-form">

        <div className="perfil-campo">
          <label htmlFor="p-especialidade">Especialidade</label>
          <input
            id="p-especialidade"
            type="text"
            placeholder="Ex: Esteticista & Designer de Sobrancelhas"
            value={especialidade}
            onChange={e => setEspecialidade(e.target.value)}
            maxLength={120}
          />
          <span className="perfil-hint">Aparece logo abaixo do seu nome na página de agendamento.</span>
        </div>

        <div className="perfil-campo">
          <label htmlFor="p-bio">Biografia</label>
          <textarea
            id="p-bio"
            rows={4}
            placeholder="Conte um pouco sobre você, sua experiência e diferenciais..."
            value={bio}
            onChange={e => setBio(e.target.value)}
            maxLength={500}
          />
          <span className="perfil-hint">{bio.length}/500 caracteres</span>
        </div>

        <div className="perfil-campo">
          <label htmlFor="p-endereco">Endereço</label>
          <input
            id="p-endereco"
            type="text"
            placeholder="Ex: Rua das Flores, 142 – Simões Filho, BA"
            value={endereco}
            onChange={e => setEndereco(e.target.value)}
            maxLength={200}
          />
          <span className="perfil-hint">Exibido na página pública para orientar suas clientes.</span>
        </div>

        {erro && <p className="perfil-erro">{erro}</p>}

        {sucesso && (
          <div className="perfil-sucesso">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Perfil atualizado com sucesso!
          </div>
        )}

        <button type="submit" className="perfil-btn" disabled={salvando}>
          {salvando ? 'Salvando...' : 'Salvar perfil'}
        </button>

      </form>
    </div>
  )
}