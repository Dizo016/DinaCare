import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute/PrivateRoute'
import Login from './components/Login/Login'
import Agendamento from './components/Agendamento/Agendamento'

/**
 * Estrutura de rotas do DinaCare:
 *
 * /login                → Login (pública)
 * /agendar/:id          → Agendamento (pública — link da profissional)
 * /home                 → protegida por PrivateRoute (futuro: Dashboard)
 * /home/agendamentos    → protegida (futuro)
 * /home/profissionais   → protegida (futuro)
 * /home/clientes        → protegida (futuro)
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Redireciona raiz para login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Rotas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/agendar/:profissionalId" element={<Agendamento />} />

          {/* Rotas protegidas */}
          <Route element={<PrivateRoute />}>
            <Route path="/home" element={
              <div style={{ padding: 40, fontFamily: 'DM Sans, sans-serif' }}>
                Dashboard — em construção
              </div>
            } />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App