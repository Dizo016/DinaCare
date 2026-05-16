import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute/PrivateRoute'
import HomeLayout from './components/HomeLayout/HomeLayout'
import Login from './components/Login/Login'
import Cadastro from './components/Cadastro/Cadastro'
import Procedimentos from './components/Procedimentos/Procedimentos'
import Agendamento from './components/Agendamento/Agendamento'
import Agendamentos from './components/Agendamentos/Agendamentos'
import Clientes from './components/Clientes/Clientes'

// Placeholder — será substituído pela tela real
function Dashboard() {
  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', color: '#2e2a2b' }}>
      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, marginBottom: 8 }}>
        Dashboard
      </h2>
      <p style={{ color: '#6b6568', fontSize: 14 }}>Em construção...</p>
    </div>
  )
}

function Profissionais() {
  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', color: '#2e2a2b' }}>
      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, marginBottom: 8 }}>
        Profissionais
      </h2>
      <p style={{ color: '#6b6568', fontSize: 14 }}>Em construção...</p>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Raiz → login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/agendar/:profissionalId" element={<Agendamento />} />

          {/* Protegidas — todas dentro do HomeLayout */}
          <Route element={<PrivateRoute />}>
            <Route element={<HomeLayout />}>
              <Route path="/home"                 element={<Dashboard />} />
              <Route path="/home/procedimentos" element={<Procedimentos />} />
              <Route path="/home/agendamentos"    element={<Agendamentos />} />
              <Route path="/home/profissionais"   element={<Profissionais />} />
              <Route path="/home/clientes"        element={<Clientes />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}