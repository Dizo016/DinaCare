import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../api/api'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import './Renda.css'

function formatarPreco(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor ?? 0)
}

function mesAtualRange() {
  const hoje = new Date()
  const ano  = hoje.getFullYear()
  const mes  = String(hoje.getMonth() + 1).padStart(2, '0')
  const ultimo = new Date(ano, hoje.getMonth() + 1, 0).getDate()
  return {
    from: `${ano}-${mes}-01`,
    to:   `${ano}-${mes}-${String(ultimo).padStart(2, '0')}`,
  }
}

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

export default function Renda() {
  const { user } = useAuth()
  const range = mesAtualRange()

  const [from, setFrom]             = useState(range.from)
  const [to, setTo]                 = useState(range.to)
  const [dados, setDados]           = useState(null)
  const [carregando, setCarregando] = useState(true)

  const carregar = useCallback(async () => {
    if (!user?.id) return
    setCarregando(true)
    try {
      const { data } = await api.get(`/appointments/user/${user.id}/revenue`, {
        params: { from, to },
      })
      setDados(data)
    } catch {
      setDados(null)
    } finally {
      setCarregando(false)
    }
  }, [user?.id, from, to])

  useEffect(() => { carregar() }, [carregar])

  const chartData = (dados?.porDia ?? []).map(d => ({
    dia: d.date.substring(8), // DD
    total: parseFloat(d.total),
    count: d.count,
  }))

  return (
    <div className="renda-tela">
      <div className="renda-header">
        <h2 className="renda-titulo">Renda</h2>
        <p className="renda-sub">Procedimentos concluídos e pagos</p>
      </div>

      {/* Filtro de período */}
      <div className="renda-filtro">
        <div className="renda-filtro-campo">
          <label>De</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
        </div>
        <div className="renda-filtro-campo">
          <label>Até</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} />
        </div>
      </div>

      {carregando ? (
        <div className="renda-loading">
          <div className="renda-spinner" />
          <span>Calculando...</span>
        </div>
      ) : !dados ? (
        <div className="renda-vazio"><p>Não foi possível carregar os dados.</p></div>
      ) : (
        <>
          {/* Cards de resumo */}
          <div className="renda-cards">
            <div className="renda-card">
              <span className="renda-card-label">Total recebido</span>
              <span className="renda-card-valor">{formatarPreco(dados.total)}</span>
            </div>
            <div className="renda-card">
              <span className="renda-card-label">Procedimentos</span>
              <span className="renda-card-valor">{dados.count}</span>
            </div>
            <div className="renda-card">
              <span className="renda-card-label">Ticket médio</span>
              <span className="renda-card-valor">{formatarPreco(dados.ticketMedio)}</span>
            </div>
          </div>

          {/* Gráfico de barras por dia */}
          {chartData.length > 0 ? (
            <div className="renda-grafico">
              <h3 className="renda-grafico-titulo">Receita por dia</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0dde3" />
                  <XAxis dataKey="dia" tick={{ fontSize: 12, fill: '#6b6568' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b6568' }} tickFormatter={v => `R$${v}`} />
                  <Tooltip
                    formatter={(value) => [formatarPreco(value), 'Receita']}
                    labelFormatter={(label) => `Dia ${label}`}
                    contentStyle={{ borderRadius: 10, border: '1px solid #e8d8dc', fontSize: 13 }}
                  />
                  <Bar dataKey="total" fill="#c9748a" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="renda-vazio">
              <p>Nenhum procedimento concluído e pago neste período.</p>
            </div>
          )}

          {/* Lista de transações */}
          {dados.porDia.length > 0 && (
            <div className="renda-lista">
              <h3 className="renda-grafico-titulo">Detalhes por dia</h3>
              {[...dados.porDia].reverse().map(d => {
                const [ano, mes, dia] = d.date.split('-')
                return (
                  <div key={d.date} className="renda-linha">
                    <div className="renda-linha-data">
                      <span className="renda-linha-dia">{dia}</span>
                      <span className="renda-linha-mes">{MESES[parseInt(mes) - 1]}</span>
                    </div>
                    <div className="renda-linha-info">
                      <span className="renda-linha-count">{d.count} procedimento{d.count !== 1 ? 's' : ''}</span>
                    </div>
                    <span className="renda-linha-total">{formatarPreco(d.total)}</span>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}