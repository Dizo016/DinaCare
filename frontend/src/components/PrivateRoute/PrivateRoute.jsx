import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

/**
 * Envolve rotas que exigem autenticação.
 * Se não autenticado → redireciona para /login.
 * Se autenticado    → renderiza o filho via <Outlet />.
 *
 * Uso no App.jsx:
 *   <Route element={<PrivateRoute />}>
 *     <Route path="/home" element={<Home />} />
 *   </Route>
 */
export default function PrivateRoute() {
  const { isAuthenticated } = useAuth()

  return isAuthenticated
    ? <Outlet />
    : <Navigate to="/login" replace />
}