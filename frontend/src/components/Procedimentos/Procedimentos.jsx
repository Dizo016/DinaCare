import { useState, useEffect, useCallback } from 'react'
import api from '../../api/api'
import './Procedimentos.css'

function formatarPreco(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
}

function formatarDuracao(minutos) {
  if (!minutos) return null
  if (minutos < 60) return `${minutos} min`
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  return m ? `${h}h ${m}min` : `${h}h`
}

const FORM_VAZIO = { name: '', duration: '', price: '' }

export default function Procedimentos() {
  const [procedimentos, setProcedimentos] = useState([])
  const [carregando, setCarregando]       = useState(true)

  const [modalAberto, setModalAberto]   = useState(false)
  const [editando, setEditando]         = useState(null) // null = novo, objeto = editar
  const [form, setForm]                 = useState(FORM_VAZIO)
  const [enviando, setEnviando]         = useState(false)
  const [erro, setErro]                 = useState('')

  const carregar = useCallback(async () => {
    try {
      const { data } = await api.get('/procedures')
      setProcedimentos(data)
    } catch {
      setProcedimentos([])
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  function abrirNovo() {
    setEditando(null)
    setForm(FORM_VAZIO)
    setErro('')
    setModalAberto(true)
  }

  function abrirEdicao(proc) {
    setEditando(proc)
    setForm({
      name:     proc.name,
      duration: String(proc.duration),
      price:    String(proc.price),
    })
    setErro('')
    setModalAberto(true)
  }

  function fecharModal() {
    setModalAberto(false)
    setErro('')
  }

  function validar() {
    if (!form.name.trim())          { setErro('Informe o nome do procedimento.'); return false }
    if (!form.duration || Number(form.duration) <= 0)
                                    { setErro('Informe uma duração válida em minutos.'); return false }
    if (!form.price || Number(form.price) <= 0)
                                    { setErro('Informe um preço válido.'); return false }
    return true
  }

  async function salvar() {
    if (!validar()) return
    setEnviando(true)
    setErro('')

    const payload = {
      name:     form.name.trim(),
      duration: Number(form.duration),
      price:    parseFloat(form.price),
    }

    try {
      if (editando) {
        await api.put(`/procedures/${editando.id}`, payload)
      } else {
        await api.post('/procedures', payload)
      }
      fecharModal()
      carregar()
    } catch {
      setErro('Não foi possível salvar. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  async function desativar(id) {
    if (!confirm('Deseja desativar este procedimento?')) return
    try {
      await api.delete(`/procedures/${id}`)
      carregar()
    } catch {
      alert('Não foi possível desativar.')
    }
  }

  if (carregando) {
    return (
      <div className="proc-loading">
        <div className="proc-spinner" />
        <span>Carregando...</span>
      </div>
    )
  }

  return (
    <>
      <div className="proc-header">
        <h2 className="proc-titulo">Procedimentos</h2>
        <button className="proc-btn-novo" onClick={abrirNovo}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Novo procedimento
        </button>
      </div>

      {procedimentos.length === 0 ? (
        <div className="proc-vazio">
          <div className="proc-vazio-icone">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
          </div>
          <h3>Nenhum procedimento ainda</h3>
          <p>Cadastre os serviços que você oferece para que suas clientes possam agendar.</p>
          <button className="proc-btn-novo" onClick={abrirNovo} style={{ marginTop: 8 }}>
            Cadastrar primeiro procedimento
          </button>
        </div>
      ) : (
        <div className="proc-lista">
          {procedimentos.map(proc => (
            <div key={proc.id} className="proc-card">
              <div className="proc-card-info">
                <span className="proc-card-nome">{proc.name}</span>
                <div className="proc-card-meta">
                  {proc.duration && (
                    <span className="proc-card-duracao">
                      {formatarDuracao(proc.duration)}
                    </span>
                  )}
                </div>
              </div>
              <span className="proc-card-preco">{formatarPreco(proc.price)}</span>
              <div className="proc-card-acoes">
                <button
                  className="proc-btn-icone"
                  onClick={() => abrirEdicao(proc)}
                  title="Editar"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button
                  className="proc-btn-icone perigo"
                  onClick={() => desativar(proc.id)}
                  title="Desativar"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6"/>
                    <path d="M14 11v6"/>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalAberto && (
        <div
          className="proc-overlay"
          onClick={e => e.target === e.currentTarget && fecharModal()}
        >
          <div className="proc-modal">
            <button className="proc-modal-fechar" onClick={fecharModal}>✕</button>

            <h3 className="proc-modal-titulo">
              {editando ? 'Editar procedimento' : 'Novo procedimento'}
            </h3>
            <p className="proc-modal-sub">
              {editando
                ? 'Altere os dados do procedimento.'
                : 'Preencha as informações do serviço que você oferece.'}
            </p>

            <div className="proc-form">
              <div className="proc-campo">
                <label>Nome do procedimento</label>
                <input
                  type="text"
                  placeholder="Ex: Design de Sobrancelhas"
                  value={form.name}
                  onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErro('') }}
                  autoFocus
                />
              </div>

              <div className="proc-campos-row">
                <div className="proc-campo">
                  <label>Duração (minutos)</label>
                  <input
                    type="number"
                    placeholder="Ex: 45"
                    min="1"
                    value={form.duration}
                    onChange={e => { setForm(f => ({ ...f, duration: e.target.value })); setErro('') }}
                  />
                </div>
                <div className="proc-campo">
                  <label>Preço (R$)</label>
                  <input
                    type="number"
                    placeholder="Ex: 80"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={e => { setForm(f => ({ ...f, price: e.target.value })); setErro('') }}
                  />
                </div>
              </div>

              {erro && (
                <div className="proc-erro">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {erro}
                </div>
              )}

              <button
                className="proc-btn-submit"
                onClick={salvar}
                disabled={enviando}
              >
                {enviando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Cadastrar procedimento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}