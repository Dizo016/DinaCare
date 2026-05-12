import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../Navbar/Navbar'
import Sidebar from '../Sidebar/Sidebar'
import './HomeLayout.css'

/**
 * HomeLayout — estrutura base de todas as telas internas.
 *
 * Composição:
 *   <Navbar />         → topo fixo
 *   <Sidebar />        → lateral esquerda (colapsável no mobile)
 *   <main>             → conteúdo da rota ativa via <Outlet />
 *
 * O estado `sidebarOpen` vive aqui e é passado para ambos,
 * permitindo que o hambúrguer da Navbar abra/feche a Sidebar.
 */
export default function HomeLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="hl-root">
      <Navbar onMenuClick={() => setSidebarOpen((o) => !o)} />

      <div className="hl-body">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Overlay mobile — fecha sidebar ao clicar fora */}
        {sidebarOpen && (
          <div
            className="hl-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="hl-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}