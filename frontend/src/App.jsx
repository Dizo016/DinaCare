import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Agendamento from './components/Agendamento/Agendamento'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota pública — link que a profissional envia ao cliente */}
        <Route path="/agendar/:profissionalId" element={<Agendamento />} />

        {/* Placeholder — será o Login no futuro */}
        <Route path="*" element={
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '100vh', fontFamily: 'DM Sans, sans-serif', color: '#6b6568'
          }}>
            DinaCare — em construção
          </div>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App