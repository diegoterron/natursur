import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllAppointmentTypes } from './api/appointmentTypes'

export default function Dashboard({ session, onLogout }) {
  const [appointmentTypes, setAppointmentTypes] = useState([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const types = await getAllAppointmentTypes()
        setAppointmentTypes(types)
      } catch (error) {
        console.error('Error cargando tipos:', error.message)
      }
    }
    loadData()
  }, [])

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h2>Bienvenido, {session.user.email}</h2>
      <button onClick={onLogout}>Cerrar sesión</button>
      <hr />

      <h3>Tipos de Citas</h3>
      <ul>
        {appointmentTypes.map((type) => (
          <li key={type.id}>
            <Link to={`/appointment-type/${type.id}`}>
              {type.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
