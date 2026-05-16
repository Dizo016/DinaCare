import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../api/api'
import './Agendamento.css'

// ─── Mock para desenvolvimento sem API ──────────────────────────────────────
const MOCK = {
  profissional: {
    nome: 'Dina Oliveira',
    especialidade: 'Esteticista & Designer de Sobrancelhas',
    foto: null,
    bio: 'Especialista em design de sobrancelhas e procedimentos faciais com mais de 8 anos de experiência.',
    endereco: 'Rua das Flores, 142 – Simões Filho, BA',
  },
  procedimentos: [
    { id: 1, nome: 'Design de Sobrancelhas', preco: 45,  duracao: 40,  descricao: 'Modelagem com pinça e linha' },
    { id: 2, nome: 'Limpeza de Pele',        preco: 120, duracao: 90,  descricao: 'Extração + máscara hidratante' },
    { id: 3, nome: 'Micropigmentação',       preco: 350, duracao: 180, descricao: 'Técnica fio a fio' },
    { id: 4, nome: 'Hydra Gloss Labial',     preco: 80,  duracao: 60,  descricao: 'Volumização natural dos lábios' },
  ],
  horarios: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'],
}

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

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Agendamento() {
  const { profissionalId } = useParams()

  const [profissional, setProfissional]   = useState(null)
  const [procedimentos, setProcedimentos] = useState([])
  const [horarios, setHorarios]           = useState([])
  const [carregando, setCarregando]       = useState(true)
  const [usandoMock, setUsandoMock]       = useState(false)

  const [procedimentoSelecionado, setProcedimentoSelecionado] = useState(null)
  const [horarioSelecionado, setHorarioSelecionado]           = useState(null)

  const [modalAberto, setModalAberto] = useState(false)
  const [nome, setNome]               = useState('')
  const [telefone, setTelefone]       = useState('')
  const [enviando, setEnviando]       = useState(false)
  const [erroForm, setErroForm]       = useState('')

  const [confirmado, setConfirmado] = useState(false)

  useEffect(() => {
    async function carregar() {
      try {
        // Profissional e procedimentos são independentes — busca em paralelo
        const [profRes, procRes] = await Promise.all([
          api.get(`/users/${profissionalId}`),
          api.get(`/procedures/public/${profissionalId}`),
        ])

        // UserResponse usa campos em inglês
        const u = profRes.data
        setProfissional({
          nome:         u.name,
          especialidade: null,
          foto:         null,
          bio:          null,
          endereco:     null,
        })
        setProcedimentos(procRes.data)

        // Horários: endpoint ainda não existe — usa lista estática
        setHorarios(MOCK.horarios)

      } catch {
        // Só cai no mock completo se profissional ou procedimentos falharem
        setProfissional(MOCK.profissional)
        setProcedimentos(MOCK.procedimentos)
        setHorarios(MOCK.horarios)
        setUsandoMock(true)
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [profissionalId])

  function selecionarProcedimento(proc) {
    setProcedimentoSelecionado(proc)
    setHorarioSelecionado(null)
    setTimeout(() => {
      document.getElementById('secao-horarios')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  async function confirmarAgendamento(e) {
    e.preventDefault()
    const nomeT = nome.trim()
    const telT  = telefone.replace(/\D/g, '')

    if (nomeT.length < 3) { setErroForm('Informe seu nome completo.'); return }
    if (telT.length < 10) { setErroForm('Informe um telefone válido com DDD.'); return }

    setEnviando(true)
    setErroForm('')

    try {
      await api.post('/agendamentos', {
        profissionalId,
        procedimentoId:  procedimentoSelecionado.id,
        horario:         horarioSelecionado,
        clienteNome:     nomeT,
        clienteTelefone: telT,
      })
      setModalAberto(false)
      setConfirmado(true)
    } catch {
      setErroForm('Não foi possível confirmar. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  // ── estados especiais ────────────────────────────────────────────────────────
  if (carregando) {
    return (
      <div className="ag-loading">
        <div className="ag-spinner" />
        <p>Carregando...</p>
      </div>
    )
  }

  if (confirmado) {
    return (
      <div className="ag-confirmado">
        <div className="ag-confirmado-icone">✓</div>
        <h2>Agendamento confirmado!</h2>
        <p>
          <strong>{procedimentoSelecionado?.name ?? procedimentoSelecionado?.nome}</strong> com{' '}
          <strong>{profissional?.nome}</strong>
        </p>
        <p className="ag-confirmado-horario">às {horarioSelecionado}</p>
        <p className="ag-confirmado-sub">
          {profissional?.nome} entrará em contato pelo WhatsApp para confirmar os detalhes.
        </p>
      </div>
    )
  }

  // ── render ────────────────────────────────────────────────────────────────────
  return (
    <div className="ag-page">

      {usandoMock && (
        <div className="ag-aviso-mock">
          ⚠ API indisponível — exibindo dados de demonstração
        </div>
      )}

      <header className="ag-header">
        <div className="ag-avatar">
          {profissional?.foto
            ? <img src={profissional.foto} alt={profissional.nome} />
            : <span>{profissional?.nome?.[0] ?? 'D'}</span>
          }
        </div>
        <div className="ag-header-info">
          <h1>{profissional?.nome}</h1>
          <p className="ag-especialidade">{profissional?.especialidade}</p>
          {profissional?.endereco && (
            <p className="ag-endereco">📍 {profissional.endereco}</p>
          )}
        </div>
      </header>

      {profissional?.bio && <p className="ag-bio">{profissional.bio}</p>}

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
                <span className="ag-proc-nome">{proc.name ?? proc.nome}</span>
                <span className="ag-proc-preco">{formatarPreco(proc.price ?? proc.preco)}</span>
              </div>
              {(proc.description ?? proc.descricao) && <p className="ag-proc-desc">{proc.description ?? proc.descricao}</p>}
              {(proc.duration ?? proc.duracao) && <span className="ag-proc-duracao">⏱ {formatarDuracao(proc.duration ?? proc.duracao)}</span>}
              {procedimentoSelecionado?.id === proc.id && (
                <span className="ag-proc-check">✓ Selecionado</span>
              )}
            </button>
          ))}
        </div>
      </section>

      {procedimentoSelecionado && (
        <section id="secao-horarios" className="ag-secao ag-secao-horarios">
          <h2 className="ag-secao-titulo">Horários disponíveis</h2>
          <p className="ag-secao-sub">
            Para <strong>{procedimentoSelecionado.name ?? procedimentoSelecionado.nome}</strong>
            {(procedimentoSelecionado.duration ?? procedimentoSelecionado.duracao) && ` · ${formatarDuracao(procedimentoSelecionado.duration ?? procedimentoSelecionado.duracao)}`}
          </p>
          <div className="ag-horarios">
            {horarios.map((h) => (
              <button
                key={h}
                className={`ag-horario-btn ${horarioSelecionado === h ? 'selecionado' : ''}`}
                onClick={() => setHorarioSelecionado(h)}
              >
                {h}
              </button>
            ))}
          </div>
        </section>
      )}

      {procedimentoSelecionado && horarioSelecionado && (
        <div className="ag-footer">
          <div className="ag-resumo">
            <span>{procedimentoSelecionado.name ?? procedimentoSelecionado.nome}</span>
            <span className="ag-resumo-sep">·</span>
            <span>{horarioSelecionado}</span>
            <span className="ag-resumo-sep">·</span>
            <strong>{formatarPreco(procedimentoSelecionado.price ?? procedimentoSelecionado.preco)}</strong>
          </div>
          <button
            className="ag-btn-confirmar"
            onClick={() => { setErroForm(''); setModalAberto(true) }}
          >
            Confirmar agendamento →
          </button>
        </div>
      )}

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
                <span>{procedimentoSelecionado?.name ?? procedimentoSelecionado?.nome}</span>
              </div>
              <div className="ag-modal-resumo-item">
                <span className="ag-modal-resumo-label">Horário</span>
                <span>{horarioSelecionado}</span>
              </div>
              <div className="ag-modal-resumo-item">
                <span className="ag-modal-resumo-label">Valor</span>
                <strong>{formatarPreco(procedimentoSelecionado?.price ?? procedimentoSelecionado?.preco)}</strong>
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