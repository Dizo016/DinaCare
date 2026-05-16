import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../api/api'
import './Agendamentos.css'

function formatarData(isoString) {
  if (!isoString) return '—'
  const d = new Date(isoString)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatarDataHora(isoString) {
  if (!isoString) return '—'
  const d = new Date(isoString)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function formatarPreco(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor ?? 0)
}

const STATUS_LABEL = {
  SCHEDULED:  { label: 'Agendado',   cor: '#c9748a' },
  CONFIRMED:  { label: 'Confirmado', cor: '#2196f3' },
  COMPLETED:  { label: 'Concluído',  cor: '#4caf87' },
  CANCELED:   { label: 'Cancelado',  cor: '#9e9e9e' },
  NO_SHOW:    { label: 'Não veio',   cor: '#ff7043' },
}

const PAYMENT_LABEL = {
  PENDING:  { label: 'Pendente',  cor: '#f57c00' },
  PAID:     { label: 'Pago',      cor: '#4caf87' },
  REFUNDED: { label: 'Reembolso', cor: '#9e9e9e' },
}

export default function Agendamentos() {
  const { user, refreshPendingCount } = useAuth()

  const [agendamentos, setAgendamentos] = useState([])
  const [carregando, setCarregando]     = useState(true)
  const [filtro, setFiltro]             = useState('TODOS')
  const [editando, setEditando]         = useState(null) // appointment sendo editado
  const [novoPreco, setNovoPreco]       = useState('')
  const [salvando, setSalvando]         = useState(false)

  const carregar = useCallback(async () => {
    if (!user?.id) return
    try {
      const { data } = await api.get(`/appointments/user/${user.id}/all`)
      // ordena por data de realização decrescente
      data.sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
      setAgendamentos(data)
    } catch {
      setAgendamentos([])
    } finally {
      setCarregando(false)
    }
  }, [user?.id])

  useEffect(() => { carregar() }, [carregar])

  const filtrados = filtro === 'TODOS'
    ? agendamentos
    : agendamentos.filter(a => a.appointmentStatus === filtro)

  async function atualizarStatus(id, status) {
    try {
      await api.patch(`/appointments/${id}/status?status=${status}`)
      await carregar()
      if (user?.id) refreshPendingCount(user.id)
    } catch { /* silencioso */ }
  }

  async function atualizarPagamento(id, status) {
    try {
      await api.patch(`/appointments/${id}/payment?status=${status}`)
      await carregar()
    } catch { /* silencioso */ }
  }

  async function salvarPreco(id) {
    if (!novoPreco || isNaN(parseFloat(novoPreco))) return
    setSalvando(true)
    try {
      await api.patch(`/appointments/${id}/charged-price`, {
        chargedPrice: parseFloat(novoPreco),
      })
      setEditando(null)
      setNovoPreco('')
      await carregar()
    } catch { /* silencioso */ } finally {
      setSalvando(false)
    }
  }

  if (carregando) {
    return (
      <div className="ag-tela-loading">
        <div className="ag-tela-spinner" />
        <span>Carregando agendamentos...</span>
      </div>
    )
  }

  return (
    <div className="ag-tela">
      <div className="ag-tela-header">
        <h2 className="ag-tela-titulo">Agendamentos</h2>
        <span className="ag-tela-total">{agendamentos.length} no total</span>
      </div>

      {/* Filtros */}
      <div className="ag-tela-filtros">
        {['TODOS', 'SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELED'].map(f => (
          <button
            key={f}
            className={`ag-tela-filtro-btn ${filtro === f ? 'ativo' : ''}`}
            onClick={() => setFiltro(f)}
          >
            {f === 'TODOS' ? 'Todos' : STATUS_LABEL[f]?.label}
          </button>
        ))}
      </div>

      {filtrados.length === 0 ? (
        <div className="ag-tela-vazio">
          <p>Nenhum agendamento encontrado.</p>
        </div>
      ) : (
        <div className="ag-tela-lista">
          {filtrados.map(a => {
            const st = STATUS_LABEL[a.appointmentStatus] ?? { label: a.appointmentStatus, cor: '#999' }
            const pt = PAYMENT_LABEL[a.paymentStatus]    ?? { label: a.paymentStatus,    cor: '#999' }
            return (
              <div key={a.id} className="ag-card">

                {/* Cabeçalho do card */}
                <div className="ag-card-header">
                  <div className="ag-card-cliente">
                    <span className="ag-card-nome">{a.client?.name}</span>
                    <span className="ag-card-tel">{a.client?.phone}</span>
                  </div>
                  <span className="ag-card-badge" style={{ background: st.cor }}>{st.label}</span>
                </div>

                {/* Dados do procedimento */}
                <div className="ag-card-proc">
                  <span className="ag-card-proc-nome">{a.procedure?.name}</span>
                  <span className="ag-card-proc-dur">{a.duration} min</span>
                </div>

                {/* Datas */}
                <div className="ag-card-datas">
                  <div className="ag-card-data-item">
                    <span className="ag-card-data-label">Realização</span>
                    <span className="ag-card-data-val">{formatarDataHora(a.startTime)}</span>
                  </div>
                  <div className="ag-card-data-item">
                    <span className="ag-card-data-label">Marcado em</span>
                    <span className="ag-card-data-val">{formatarData(a.createdAt)}</span>
                  </div>
                </div>

                {/* Preços */}
                <div className="ag-card-precos">
                  <div className="ag-card-preco-item">
                    <span className="ag-card-data-label">Preço do serviço</span>
                    <span>{formatarPreco(a.procedure?.price)}</span>
                  </div>
                  <div className="ag-card-preco-item">
                    <span className="ag-card-data-label">Preço cobrado</span>
                    {editando === a.id ? (
                      <div className="ag-card-preco-edit">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={novoPreco}
                          onChange={e => setNovoPreco(e.target.value)}
                          autoFocus
                        />
                        <button onClick={() => salvarPreco(a.id)} disabled={salvando}>✓</button>
                        <button onClick={() => setEditando(null)}>✕</button>
                      </div>
                    ) : (
                      <span
                        className="ag-card-preco-cobrado"
                        onClick={() => { setEditando(a.id); setNovoPreco(String(a.chargedPrice)) }}
                        title="Clique para editar"
                      >
                        {formatarPreco(a.chargedPrice)} ✏
                      </span>
                    )}
                  </div>
                </div>

                {/* Pagamento */}
                <div className="ag-card-row">
                  <span className="ag-card-data-label">Pagamento</span>
                  <span className="ag-card-badge" style={{ background: pt.cor }}>{pt.label}</span>
                  <select
                    className="ag-card-select"
                    value={a.paymentStatus}
                    onChange={e => atualizarPagamento(a.id, e.target.value)}
                  >
                    <option value="PENDING">Pendente</option>
                    <option value="PAID">Pago</option>
                    <option value="REFUNDED">Reembolso</option>
                  </select>
                </div>

                {/* Ações de status */}
                {a.appointmentStatus !== 'CANCELED' && a.appointmentStatus !== 'COMPLETED' && (
                  <div className="ag-card-acoes">
                    {a.appointmentStatus === 'SCHEDULED' && (
                      <button className="ag-card-btn ag-card-btn--confirmar"
                        onClick={() => atualizarStatus(a.id, 'CONFIRMED')}>
                        Confirmar
                      </button>
                    )}
                    {(a.appointmentStatus === 'SCHEDULED' || a.appointmentStatus === 'CONFIRMED') && (
                      <button className="ag-card-btn ag-card-btn--concluir"
                        onClick={() => atualizarStatus(a.id, 'COMPLETED')}>
                        Concluído
                      </button>
                    )}
                    <button className="ag-card-btn ag-card-btn--cancelar"
                      onClick={() => atualizarStatus(a.id, 'CANCELED')}>
                      Cancelar
                    </button>
                  </div>
                )}

              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}