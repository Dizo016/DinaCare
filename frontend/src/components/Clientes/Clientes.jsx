import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../api/api'
import './Clientes.css'

function formatarDataHora(isoString) {
  if (!isoString) return '—'
  const d = new Date(isoString)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default function Clientes() {
  const { user } = useAuth()

  const [clientes, setClientes]         = useState([])
  const [agendamentos, setAgendamentos] = useState({}) // clientId → último agendamento
  const [carregando, setCarregando]     = useState(true)
  const [busca, setBusca]               = useState('')

  const carregar = useCallback(async () => {
    if (!user?.id) return
    try {
      const { data: clientesData } = await api.get(`/appointments/user/${user.id}/clients`)
      setClientes(clientesData)

      // Para cada cliente, busca os agendamentos e pega o mais recente
      const mapaUltimo = {}
      await Promise.all(
        clientesData.map(async (c) => {
          try {
            const { data: apps } = await api.get(`/appointments/client/${c.id}`)
            if (apps.length > 0) {
              apps.sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
              mapaUltimo[c.id] = apps[0]
            }
          } catch { /* silencioso */ }
        })
      )
      setAgendamentos(mapaUltimo)
    } catch {
      setClientes([])
    } finally {
      setCarregando(false)
    }
  }, [user?.id])

  useEffect(() => { carregar() }, [carregar])

  const filtrados = clientes.filter(c =>
    c.name.toLowerCase().includes(busca.toLowerCase()) ||
    c.phone.includes(busca)
  )

  if (carregando) {
    return (
      <div className="cl-loading">
        <div className="cl-spinner" />
        <span>Carregando clientes...</span>
      </div>
    )
  }

  return (
    <div className="cl-tela">
      <div className="cl-header">
        <h2 className="cl-titulo">Clientes</h2>
        <span className="cl-total">{clientes.length} clientes</span>
      </div>

      <input
        className="cl-busca"
        type="text"
        placeholder="Buscar por nome ou telefone..."
        value={busca}
        onChange={e => setBusca(e.target.value)}
      />

      {filtrados.length === 0 ? (
        <div className="cl-vazio">
          <p>{busca ? 'Nenhum cliente encontrado.' : 'Ainda não há clientes. Quando uma pessoa agendar pelo seu link, aparecerá aqui.'}</p>
        </div>
      ) : (
        <div className="cl-lista">
          {filtrados.map(c => {
            const ultimo = agendamentos[c.id]
            return (
              <div key={c.id} className="cl-card">
                <div className="cl-card-avatar">
                  {c.name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="cl-card-info">
                  <span className="cl-card-nome">{c.name}</span>
                  <span className="cl-card-tel">{c.phone}</span>
                  {ultimo && (
                    <div className="cl-card-ultimo">
                      <span className="cl-card-ultimo-label">Último agendamento</span>
                      <span className="cl-card-ultimo-val">
                        {ultimo.procedure?.name} · {formatarDataHora(ultimo.startTime)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}