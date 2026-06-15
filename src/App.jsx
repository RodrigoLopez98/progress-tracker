import { useState } from 'react'
import RoleSelection from './components/RoleSelection'
import AlfredoView from './components/AlfredoView'
import RodrigoView from './components/RodrigoView'

function App() {
  const [role, setRole] = useState(null)
  // role puede ser: null | 'alfredo' | 'rodrigo'

  // Función para volver a la selección de rol
  const handleGoBack = () => {
    setRole(null)
  }

  // Si no ha seleccionado rol, mostramos la pantalla inicial
  if (!role) {
    return <RoleSelection onSelectRole={setRole} />
  }

  // Vista de Alfredo
  if (role === 'alfredo') {
    return <AlfredoView onGoBack={handleGoBack} />
  }

  // Vista de Rodrigo
  if (role === 'rodrigo') {
    return <RodrigoView onGoBack={handleGoBack} />
  }

  return null
}

export default App