import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/api'
import './Cadastro.css'

const DIAS = [
  { valor: 'MONDAY',    label: 'Seg' },
  { valor: 'TUESDAY',   label: 'Ter' },
  { valor: 'WEDNESDAY', label: 'Qua' },
  { valor: 'THURSDAY',  label: 'Qui' },
  { valor: 'FRIDAY',    label: 'Sex' },
  { valor: 'SATURDAY',  label: 'Sáb' },
  { valor: 'SUNDAY',    label: 'Dom' },
]

const ROLES = [
  {
    valor: 'PROFESSIONAL',
    icone: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    nome: 'Profissional',
    desc: 'Realiza atendimentos e gerencia sua agenda',
  },
  {
    valor: 'ADMIN',
    icone: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
    nome: 'Administradora',
    desc: 'Acesso completo ao sistema',
  },
]

const STEPS = ['Seus dados', 'Horários', 'Dias de trabalho', 'Confirmar']

export default function Cadastro() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [enviando, setEnviando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')

  // step 0 — dados pessoais
  const [nome, setNome]         = useState('')
  const [login, setLogin]       = useState('')
  const [senha, setSenha]       = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [role, setRole]         = useState('PROFESSIONAL')

  // step 1 — horários
  const [entrada, setEntrada]         = useState('08:00')
  const [saida, setSaida]             = useState('18:00')
  const [almocInicio, setAlmocInicio] = useState('12:00')
  const [almocFim, setAlmocFim]       = useState('13:00')

  // step 2 — dias
  const [dias, setDias] = useState(new Set(['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY']))

  function toggleDia(dia) {
    setDias(prev => {
      const next = new Set(prev)
      next.has(dia) ? next.delete(dia) : next.add(dia)
      return next
    })
  }

  function validarStep() {
    setErro('')
    if (step === 0) {
      if (nome.trim().length < 3)   { setErro('Informe seu nome completo.'); return false }
      if (login.trim().length < 3)  { setErro('O login deve ter ao menos 3 caracteres.'); return false }
      if (senha.trim().length < 6)  { setErro('A senha deve ter ao menos 6 caracteres.'); return false }
    }
    if (step === 1) {
      if (!entrada || !saida)       { setErro('Informe os horários de entrada e saída.'); return false }
      if (saida <= entrada)         { setErro('O horário de saída deve ser após a entrada.'); return false }
    }
    if (step === 2) {
      if (dias.size === 0)          { setErro('Selecione ao menos um dia de trabalho.'); return false }
    }
    return true
  }

  function avancar() {
    if (!validarStep()) return
    setStep(s => s + 1)
  }

  function voltar() {
    setErro('')
    setStep(s => s - 1)
  }

  async function submeter() {
    if (!validarStep()) return
    setEnviando(true)
    setErro('')
    try {
      await api.post('/users', {
        name:           nome.trim(),
        login:          login.trim(),
        password:       senha,
        userRole:       role,
        entryTime:      entrada + ':00',
        exitTime:       saida + ':00',
        lunchStartTime: almocInicio ? almocInicio + ':00' : null,
        lunchEndTime:   almocFim    ? almocFim    + ':00' : null,
        workDays:       [...dias],
      })
      setSucesso(true)
    } catch (err) {
      const msg = err?.response?.data?.message
      if (err?.response?.status === 409 || msg?.toLowerCase().includes('login')) {
        setErro('Este login já está em uso. Escolha outro.')
      } else {
        setErro('Não foi possível criar a conta. Tente novamente.')
      }
    } finally {
      setEnviando(false)
    }
  }

  // ── sucesso ───────────────────────────────────────────────────────────────
  if (sucesso) {
    return (
      <div className="cad-sucesso">
        <div className="cad-sucesso-icone">✓</div>
        <h2>Bem-vinda à plataforma!</h2>
        <p>Sua conta foi criada com sucesso.<br />Faça login para começar.</p>
        <button className="cad-sucesso-link" onClick={() => navigate('/login')}>
          Ir para o login →
        </button>
      </div>
    )
  }

  const roleAtual = ROLES.find(r => r.valor === role)

  return (
    <div className="cad-page">

      {/* Cabeçalho */}
      <header className="cad-header">
        <div className="cad-brand">
          <span className="cad-brand-mark">D</span>
          <span className="cad-brand-name">DinaCare</span>
        </div>
        <h1 className="cad-titulo">Criar conta</h1>
        <p className="cad-sub">Preencha as informações para começar a atender</p>
      </header>

      {/* Progress steps */}
      <div className="cad-steps">
        {STEPS.map((label, i) => (
          <>
            <div key={label} className={`cad-step ${i === step ? 'ativo' : ''} ${i < step ? 'concluido' : ''}`}>
              <div className="cad-step-dot">
                {i < step ? '✓' : i + 1}
              </div>
              <span className="cad-step-label">{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div key={`line-${i}`} className={`cad-step-line ${i < step ? 'concluida' : ''}`} />
            )}
          </>
        ))}
      </div>

      {/* ── Step 0: dados pessoais ── */}
      {step === 0 && (
        <section className="cad-secao">
          <h2 className="cad-secao-titulo">Seus dados</h2>
          <p className="cad-secao-sub">Como você vai se identificar na plataforma</p>

          <div className="cad-campos">
            <div className="cad-campo">
              <label>Nome completo</label>
              <input
                type="text"
                placeholder="Ex: Ana Lima"
                value={nome}
                onChange={e => { setNome(e.target.value); setErro('') }}
                autoFocus
              />
            </div>
            <div className="cad-campo">
              <label>Login</label>
              <input
                type="text"
                placeholder="Ex: ana.lima"
                value={login}
                onChange={e => { setLogin(e.target.value); setErro('') }}
                autoComplete="username"
              />
            </div>
            <div className="cad-campo">
              <label>Senha</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showSenha ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={senha}
                  onChange={e => { setSenha(e.target.value); setErro('') }}
                  style={{ width: '100%', paddingRight: 48 }}
                />
                <button
                  type="button"
                  onClick={() => setShowSenha(s => !s)}
                  style={{
                    position: 'absolute', right: 12, top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer', opacity: 0.5, padding: 4,
                  }}
                  aria-label={showSenha ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showSenha ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--grafite)', marginBottom: 10 }}>
                Tipo de conta
              </p>
              <div className="cad-roles">
                {ROLES.map(r => (
                  <button
                    key={r.valor}
                    className={`cad-role-card ${role === r.valor ? 'selecionado' : ''}`}
                    onClick={() => setRole(r.valor)}
                  >
                    <div className="cad-role-icon">{r.icone}</div>
                    <div className="cad-role-nome">{r.nome}</div>
                    <div className="cad-role-desc">{r.desc}</div>
                    {role === r.valor && <span className="cad-role-check">✓ Selecionado</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Step 1: horários ── */}
      {step === 1 && (
        <section className="cad-secao">
          <h2 className="cad-secao-titulo">Horários de atendimento</h2>
          <p className="cad-secao-sub">Quando você costuma atender suas clientes</p>

          <div className="cad-campos">
            <div className="cad-campos-row">
              <div className="cad-campo">
                <label>Entrada</label>
                <input type="time" value={entrada} onChange={e => { setEntrada(e.target.value); setErro('') }} />
              </div>
              <div className="cad-campo">
                <label>Saída</label>
                <input type="time" value={saida} onChange={e => { setSaida(e.target.value); setErro('') }} />
              </div>
            </div>

            <p style={{ fontSize: 13, color: 'var(--cinza)', marginTop: 8 }}>
              Intervalo de almoço <span style={{ fontSize: 12 }}>(opcional)</span>
            </p>

            <div className="cad-campos-row">
              <div className="cad-campo">
                <label>Início do almoço</label>
                <input type="time" value={almocInicio} onChange={e => setAlmocInicio(e.target.value)} />
              </div>
              <div className="cad-campo">
                <label>Fim do almoço</label>
                <input type="time" value={almocFim} onChange={e => setAlmocFim(e.target.value)} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Step 2: dias de trabalho ── */}
      {step === 2 && (
        <section className="cad-secao">
          <h2 className="cad-secao-titulo">Dias de trabalho</h2>
          <p className="cad-secao-sub">Selecione os dias em que você atende</p>
          <div className="cad-dias">
            {DIAS.map(d => (
              <button
                key={d.valor}
                className={`cad-dia-btn ${dias.has(d.valor) ? 'selecionado' : ''}`}
                onClick={() => { toggleDia(d.valor); setErro('') }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── Step 3: confirmar ── */}
      {step === 3 && (
        <section className="cad-secao">
          <h2 className="cad-secao-titulo">Tudo certo?</h2>
          <p className="cad-secao-sub">Revise seus dados antes de criar a conta</p>

          <div className="cad-resumo-card">
            <div className="cad-resumo-item">
              <span className="cad-resumo-label">Nome</span>
              <span className="cad-resumo-valor">{nome}</span>
            </div>
            <div className="cad-resumo-item">
              <span className="cad-resumo-label">Login</span>
              <span className="cad-resumo-valor">{login}</span>
            </div>
            <div className="cad-resumo-item">
              <span className="cad-resumo-label">Tipo</span>
              <span className="cad-resumo-valor">{roleAtual?.nome}</span>
            </div>
            <div className="cad-resumo-item">
              <span className="cad-resumo-label">Horário</span>
              <span className="cad-resumo-valor">{entrada} – {saida}</span>
            </div>
            {almocInicio && (
              <div className="cad-resumo-item">
                <span className="cad-resumo-label">Almoço</span>
                <span className="cad-resumo-valor">{almocInicio} – {almocFim}</span>
              </div>
            )}
            <div className="cad-resumo-item">
              <span className="cad-resumo-label">Dias</span>
              <span className="cad-resumo-valor">
                {DIAS.filter(d => dias.has(d.valor)).map(d => d.label).join(', ')}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Erro */}
      {erro && (
        <div style={{ padding: '12px 24px 0' }}>
          <div className="cad-erro">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {erro}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="cad-footer">
        {step > 0 && (
          <button className="cad-btn-voltar" onClick={voltar}>← Voltar</button>
        )}
        {step < 3 ? (
          <button className="cad-btn-avancar" onClick={avancar}>
            Continuar →
          </button>
        ) : (
          <button className="cad-btn-avancar" onClick={submeter} disabled={enviando}>
            {enviando ? 'Criando conta...' : 'Criar conta →'}
          </button>
        )}
      </div>

    </div>
  )
}