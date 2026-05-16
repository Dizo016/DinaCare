import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../api/api'
import './Agendamento.css'

// ─── Helpers ─────────────────────────────────────────────────────────────────
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

function mascaraTelefone(valor) {
  const nums = valor.replace(/\D/g, '').slice(0, 11)
  if (nums.length <= 10) return nums.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
  return nums.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
}

function formatarData(dateStr) {
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

function toISODate(date) {
  return date.toISOString().split('T')[0]
}

function proximosDias(quantidade) {
  const dias = []
  const hoje = new Date()
  for (let i = 0; i < quantidade; i++) {
    const d = new Date(hoje)
    d.setDate(hoje.getDate() + i)
    dias.push(toISODate(d))
  }
  return dias
}

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Agendamento() {
  const { profissionalId } = useParams()

  const [profissional, setProfissional]   = useState(null)
  const [procedimentos, setProcedimentos] = useState([])
  const [carregando, setCarregando]       = useState(true)
  const [erroCarregar, setErroCarregar]   = useState(false)

  const [procedimentoSelecionado, setProcedimentoSelecionado] = useState(null)
  const [dataSelecionada, setDataSelecionada]                 = useState(null)
  const [horarioSelecionado, setHorarioSelecionado]           = useState(null)

  const [slots, setSlots]                     = useState([])
  const [carregandoSlots, setCarregandoSlots] = useState(false)
  const [erroSlots, setErroSlots]             = useState(false)

  const [modalAberto, setModalAberto] = useState(false)
  const [nome, setNome]               = useState('')
  const [telefone, setTelefone]       = useState('')
  const [enviando, setEnviando]       = useState(false)
  const [erroForm, setErroForm]       = useState('')

  const [confirmado, setConfirmado] = useState(false)

  const dias = proximosDias(14)

  // ── carrega profissional e procedimentos ──────────────────────────────────
  useEffect(() => {
    async function carregar() {
      try {
        const [profRes, procRes] = await Promise.all([
          api.get(`/users/${profissionalId}`),
          api.get(`/procedures/public/${profissionalId}`),
        ])
        const u = profRes.data
        setProfissional({ nome: u.name, id: u.id })
        setProcedimentos(procRes.data)
      } catch {
        setErroCarregar(true)
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [profissionalId])

  // ── carrega slots ao selecionar data ─────────────────────────────────────
  const carregarSlots = useCallback(async (data) => {
    setCarregandoSlots(true)
    setErroSlots(false)
    setHorarioSelecionado(null)
    setSlots([])
    try {
      const { data: resultado } = await api.get(
        `/appointments/public/${profissionalId}/available-slots`,
        { params: { date: data } }
      )
      setSlots(resultado)
    } catch {
      setErroSlots(true)
    } finally {
      setCarregandoSlots(false)
    }
  }, [profissionalId])

  function selecionarProcedimento(proc) {
    setProcedimentoSelecionado(proc)
    setDataSelecionada(null)
    setHorarioSelecionado(null)
    setSlots([])
    setTimeout(() => {
      document.getElementById('secao-data')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  function selecionarData(data) {
    setDataSelecionada(data)
    setHorarioSelecionado(null)
    carregarSlots(data)
    setTimeout(() => {
      document.getElementById('secao-horarios')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 300)
  }

  async function confirmarAgendamento(e) {
    e.preventDefault()
    const nomeT = nome.trim()
    const telT  = telefone.replace(/\D/g, '')

    if (nomeT.length < 3) { setErroForm('Informe seu nome completo.'); return }
    if (telT.length < 10) { setErroForm('Informe um telefone válido com DDD.'); return }

    setEnviando(true)
    setErroForm('')

    // slots da API vêm como "HH:mm:ss", monta ISO sem adicionar segundos extras
    const startTime = `${dataSelecionada}T${horarioSelecionado}`

    try {
      await api.post('/appointments/public', {
        profissionalId,
        procedureId:  procedimentoSelecionado.id,
        startTime,
        clientName:   nomeT,
        clientPhone:  telT,
      })
      setModalAberto(false)
      setConfirmado(true)
    } catch (err) {
      const msg = err?.response?.data?.message
      setErroForm(msg ?? 'Não foi possível confirmar. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  // ── estados especiais ─────────────────────────────────────────────────────
  if (carregando) {
    return (
      <div className="ag-loading">
        <div className="ag-spinner" />
        <p>Carregando...</p>
      </div>
    )
  }

  if (erroCarregar) {
    return (
      <div className="ag-loading">
        <p>Profissional não encontrada.</p>
      </div>
    )
  }

  if (confirmado) {
    return (
      <div className="ag-confirmado">
        <div className="ag-confirmado-icone">✓</div>
        <h2>Agendamento confirmado!</h2>
        <p>
          <strong>{procedimentoSelecionado?.name}</strong> com{' '}
          <strong>{profissional?.nome}</strong>
        </p>
        <p className="ag-confirmado-horario">
          {formatarData(dataSelecionada)} às {horarioSelecionado.substring(0, 5)}
        </p>
        <p className="ag-confirmado-sub">
          {profissional?.nome} entrará em contato pelo WhatsApp para confirmar os detalhes.
        </p>
      </div>
    )
  }

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="ag-page">

      <header className="ag-header">
        <div className="ag-avatar">
          <span>{profissional?.nome?.[0] ?? 'D'}</span>
        </div>
        <div className="ag-header-info">
          <h1>{profissional?.nome}</h1>
        </div>
      </header>

      {/* ── Procedimentos ── */}
      <section className="ag-secao">
        <h2 className="ag-secao-titulo">Procedimentos</h2>
        <p className="ag-secao-sub">Selecione o serviço desejado</p>
        <div className="ag-procedimentos">
          {procedimentos.map((proc) => (
            <button
              key={proc.id}
              className={`ag-proc-card ${procedimentoSelecionado?.id === proc.id ? 'selecionado' : ''}`}
              onClick={() => selecionarProcedimento(proc)}
            >
              <div className="ag-proc-topo">
                <span className="ag-proc-nome">{proc.name}</span>
                <span className="ag-proc-preco">{formatarPreco(proc.price)}</span>
              </div>
              {proc.duration && (
                <span className="ag-proc-duracao">⏱ {formatarDuracao(proc.duration)}</span>
              )}
              {procedimentoSelecionado?.id === proc.id && (
                <span className="ag-proc-check">✓ Selecionado</span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* ── Seleção de data ── */}
      {procedimentoSelecionado && (
        <section id="secao-data" className="ag-secao">
          <h2 className="ag-secao-titulo">Escolha uma data</h2>
          <p className="ag-secao-sub">Próximos 14 dias</p>
          <div className="ag-datas">
            {dias.map((dia) => {
              const dateObj  = new Date(dia + 'T00:00:00')
              const diaSemana = DIAS_SEMANA[dateObj.getDay()]
              const [, mes, d] = dia.split('-')
              return (
                <button
                  key={dia}
                  className={`ag-data-btn ${dataSelecionada === dia ? 'selecionado' : ''}`}
                  onClick={() => selecionarData(dia)}
                >
                  <span className="ag-data-semana">{diaSemana}</span>
                  <span className="ag-data-dia">{d}/{mes}</span>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Horários disponíveis ── */}
      {dataSelecionada && (
        <section id="secao-horarios" className="ag-secao ag-secao-horarios">
          <h2 className="ag-secao-titulo">Horários disponíveis</h2>
          <p className="ag-secao-sub">
            {formatarData(dataSelecionada)} · <strong>{procedimentoSelecionado.name}</strong>
            {procedimentoSelecionado.duration && ` · ${formatarDuracao(procedimentoSelecionado.duration)}`}
          </p>

          {carregandoSlots && (
            <div className="ag-loading" style={{ minHeight: 80 }}>
              <div className="ag-spinner" />
            </div>
          )}

          {!carregandoSlots && erroSlots && (
            <p className="ag-erro">Não foi possível carregar os horários. Tente novamente.</p>
          )}

          {!carregandoSlots && !erroSlots && slots.length === 0 && (
            <p className="ag-secao-sub">Nenhum horário disponível para esta data.</p>
          )}

          {!carregandoSlots && !erroSlots && slots.length > 0 && (
            <div className="ag-horarios">
              {slots.map((h) => {
                const exibicao = h.substring(0, 5) // "HH:mm:ss" → "HH:mm"
                return (
                  <button
                    key={h}
                    className={`ag-horario-btn ${horarioSelecionado === h ? 'selecionado' : ''}`}
                    onClick={() => setHorarioSelecionado(h)}
                  >
                    {exibicao}
                  </button>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* ── Footer de confirmação ── */}
      {procedimentoSelecionado && horarioSelecionado && (
        <div className="ag-footer">
          <div className="ag-resumo">
            <span>{procedimentoSelecionado.name}</span>
            <span className="ag-resumo-sep">·</span>
            <span>{formatarData(dataSelecionada)} às {horarioSelecionado.substring(0, 5)}</span>
            <span className="ag-resumo-sep">·</span>
            <strong>{formatarPreco(procedimentoSelecionado.price)}</strong>
          </div>
          <button
            className="ag-btn-confirmar"
            onClick={() => { setErroForm(''); setModalAberto(true) }}
          >
            Confirmar agendamento →
          </button>
        </div>
      )}

      {/* ── Modal de dados do cliente ── */}
      {modalAberto && (
        <div
          className="ag-overlay"
          onClick={(e) => e.target === e.currentTarget && setModalAberto(false)}
        >
          <div className="ag-modal">
            <button className="ag-modal-fechar" onClick={() => setModalAberto(false)}>✕</button>

            <h3 className="ag-modal-titulo">Seus dados</h3>
            <p className="ag-modal-sub">Apenas nome e telefone — sem cadastro necessário.</p>

            <div className="ag-modal-resumo">
              <div className="ag-modal-resumo-item">
                <span className="ag-modal-resumo-label">Procedimento</span>
                <span>{procedimentoSelecionado?.name}</span>
              </div>
              <div className="ag-modal-resumo-item">
                <span className="ag-modal-resumo-label">Data e horário</span>
                <span>{formatarData(dataSelecionada)} às {horarioSelecionado.substring(0, 5)}</span>
              </div>
              <div className="ag-modal-resumo-item">
                <span className="ag-modal-resumo-label">Valor</span>
                <strong>{formatarPreco(procedimentoSelecionado?.price)}</strong>
              </div>
            </div>

            <form onSubmit={confirmarAgendamento} className="ag-modal-form">
              <div className="ag-campo">
                <label htmlFor="ag-nome">Nome completo</label>
                <input
                  id="ag-nome"
                  type="text"
                  placeholder="Ex: Maria Silva"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="ag-campo">
                <label htmlFor="ag-tel">Telefone (WhatsApp)</label>
                <input
                  id="ag-tel"
                  type="tel"
                  placeholder="(71) 99999-9999"
                  value={telefone}
                  onChange={(e) => setTelefone(mascaraTelefone(e.target.value))}
                />
              </div>
              {erroForm && <p className="ag-erro">{erroForm}</p>}
              <button type="submit" className="ag-btn-confirmar" disabled={enviando}>
                {enviando ? 'Confirmando...' : 'Confirmar agendamento'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}