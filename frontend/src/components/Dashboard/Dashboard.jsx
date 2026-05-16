import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../../api/api'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import './Dashboard.css'

function formatarPreco(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor ?? 0)
}

function formatarHora(isoString) {
  if (!isoString) return '—'
  const d = new Date(isoString)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

const CORES = ['#c9748a', '#f4a0b5', '#e8c0c0', '#b5607a', '#fdf0f3']

const STATUS_LABEL = {
  SCHEDULED: 'Agendado',
  CONFIRMED: 'Confirmado',
  COMPLETED: 'Concluído',
  CANCELED:  'Cancelado',
  NO_SHOW:   'Não veio',
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [dados, setDados]           = useState(null)
  const [carregando, setCarregando] = useState(true)

  const perfilIncompleto = user && !user.especialidade && !user.bio && !user.endereco

  const carregar = useCallback(async () => {
    if (!user?.id) return
    try {
      const { data } = await api.get(`/appointments/user/${user.id}/dashboard`)
      setDados(data)
    } catch {
      setDados(null)
    } finally {
      setCarregando(false)
    }
  }, [user?.id])

  useEffect(() => { carregar() }, [carregar])

  if (carregando) {
    return (
      <div className="dash-loading">
        <div className="dash-spinner" />
        <span>Carregando dashboard...</span>
      </div>
    )
  }

  if (!dados) {
    return <div className="dash-loading"><p>Não foi possível carregar os dados.</p></div>
  }

  const lineData = dados.ultimos6Meses.map(m => ({
    mes: m.mes.substring(0, 3).charAt(0) + m.mes.substring(1, 3).toLowerCase(),
    total: parseFloat(m.total),
  }))

  return (
    <div className="dash-tela">
      <div className="dash-header">
        <h2 className="dash-titulo">Dashboard</h2>
        <p className="dash-sub">Olá, {user?.name?.split(' ')[0]}! Aqui está o resumo do seu negócio.</p>
      </div>

      {/* ── Banner perfil incompleto ── */}
      {perfilIncompleto && (
        <div className="dash-banner-perfil" onClick={() => navigate('/home/perfil')}>
          <div className="dash-banner-perfil-icone">✨</div>
          <div className="dash-banner-perfil-texto">
            <strong>Complete seus dados para atrair mais clientes!</strong>
            <span>Adicione sua bio, especialidade e endereço ao seu perfil.</span>
          </div>
          <span className="dash-banner-perfil-cta">Completar →</span>
        </div>
      )}

      {/* ── Cards rápidos ── */}
      <div className="dash-cards">
        <div className="dash-card">
          <span className="dash-card-label">Agendamentos hoje</span>
          <span className="dash-card-valor">{dados.agendamentosHoje}</span>
        </div>
        <div className="dash-card dash-card--destaque">
          <span className="dash-card-label">Receita do mês</span>
          <span className="dash-card-valor">{formatarPreco(dados.receitaMes)}</span>
        </div>
        <div className="dash-card">
          <span className="dash-card-label">Clientes ativos</span>
          <span className="dash-card-valor">{dados.totalClientes}</span>
        </div>
        <div className="dash-card">
          <span className="dash-card-label">Taxa de conclusão</span>
          <span className="dash-card-valor">{dados.taxaConclusao.toFixed(0)}%</span>
        </div>
      </div>

      {/* ── Gráfico de receita ── */}
      {lineData.some(d => d.total > 0) && (
        <div className="dash-secao">
          <h3 className="dash-secao-titulo">Receita — últimos 6 meses</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={lineData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0dde3" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#6b6568' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6b6568' }} tickFormatter={v => `R$${v}`} />
              <Tooltip
                formatter={v => [formatarPreco(v), 'Receita']}
                contentStyle={{ borderRadius: 10, border: '1px solid #e8d8dc', fontSize: 13 }}
              />
              <Line
                type="monotone" dataKey="total"
                stroke="#c9748a" strokeWidth={2.5}
                dot={{ fill: '#c9748a', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Destaques ── */}
      <div className="dash-destaques">
        {dados.clienteMaisFiel && (
          <div className="dash-destaque">
            <span className="dash-destaque-icone">🏆</span>
            <div>
              <span className="dash-destaque-label">Cliente mais fiel</span>
              <span className="dash-destaque-val">{dados.clienteMaisFiel}</span>
            </div>
          </div>
        )}
        {dados.procedimentoMaisVendido && (
          <div className="dash-destaque">
            <span className="dash-destaque-icone">💅</span>
            <div>
              <span className="dash-destaque-label">Procedimento mais vendido</span>
              <span className="dash-destaque-val">{dados.procedimentoMaisVendido}</span>
            </div>
          </div>
        )}
        {dados.melhorDia && (
          <div className="dash-destaque">
            <span className="dash-destaque-icone">📈</span>
            <div>
              <span className="dash-destaque-label">Melhor dia</span>
              <span className="dash-destaque-val">{dados.melhorDia}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Próximos agendamentos de hoje ── */}
      {dados.proximosHoje.length > 0 && (
        <div className="dash-secao">
          <h3 className="dash-secao-titulo">Próximos agendamentos hoje</h3>
          <div className="dash-proximos">
            {dados.proximosHoje.map(a => (
              <div key={a.id} className="dash-proximo-card">
                <div className="dash-proximo-hora">{formatarHora(a.startTime)}</div>
                <div className="dash-proximo-info">
                  <span className="dash-proximo-cliente">{a.client?.name}</span>
                  <span className="dash-proximo-proc">{a.procedure?.name}</span>
                </div>
                <span className="dash-proximo-status">{STATUS_LABEL[a.appointmentStatus]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {dados.proximosHoje.length === 0 && dados.agendamentosHoje === 0 && (
        <div className="dash-secao">
          <p className="dash-vazio">Nenhum agendamento para hoje.</p>
        </div>
      )}
    </div>
  )
}