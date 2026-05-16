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
import Dashboard from './components/Dashboard/Dashboard'
import Renda from './components/Renda/Renda'
import Perfil from './components/Perfil/Perfil'

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
              <Route path="/home"               element={<Dashboard />} />
              <Route path="/home/agendamentos"  element={<Agendamentos />} />
              <Route path="/home/procedimentos" element={<Procedimentos />} />
              <Route path="/home/clientes"      element={<Clientes />} />
              <Route path="/home/renda"         element={<Renda />} />
              <Route path="/home/perfil"        element={<Perfil />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}