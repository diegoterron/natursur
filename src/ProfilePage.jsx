// src/pages/ProfilePage.jsx
import { useEffect, useState } from 'react'
import { getUserById, updateUser } from './api/user'
import { getAppointmentsByUser } from './api/appointments'
import ProfileButton from './ProfileButton.jsx'

export default function ProfilePage({ session }) {
  const userId = session?.user?.id
  const userEmail = session?.user?.email
  const [userData, setUserData] = useState({ full_name: '', phone: '', role: '' })
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await getUserById(userId)
        setUserData({
          full_name: user.full_name || '',
          phone: user.phone || '',
          role: user.role || ''
        })

        const appts = await getAppointmentsByUser(userId)
        setAppointments(appts)
      } catch (error) {
        console.error('Error cargando perfil:', error.message)
      }
    }
    if (userId) loadData()
  }, [userId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setUserData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      await updateUser(userId, userData)
      setMessage('✅ Información actualizada correctamente.')
    } catch (error) {
      setMessage('❌ Error al actualizar: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative p-6 max-w-lg mx-auto">
      {/* Botón de perfil para consistencia visual */}
      <ProfileButton />

      <h2 className="text-2xl font-semibold mb-2">Mi Perfil</h2>
      <p className="text-gray-600 mb-4">{userEmail}</p>

      <form onSubmit={handleSave} className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium">Nombre completo</label>
          <input
            type="text"
            name="full_name"
            value={userData.full_name}
            onChange={handleChange}
            className="w-full border rounded p-2 focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Teléfono</label>
          <input
            type="text"
            name="phone"
            value={userData.phone}
            onChange={handleChange}
            className="w-full border rounded p-2 focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Rol</label>
          <input
            type="text"
            value={userData.role}
            disabled
            className="w-full border rounded p-2 bg-gray-100 text-gray-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>

        {message && (
          <p className="mt-2 text-sm text-gray-700">{message}</p>
        )}
      </form>

      <hr className="my-6" />

      <h3 className="text-xl font-semibold mb-2">Mis Citas</h3>

      {appointments.length === 0 ? (
        <p className="text-gray-500">No tienes citas registradas.</p>
      ) : (
        <ul className="space-y-2">
          {appointments.map((appt) => (
            <li
              key={appt.id}
              className="border rounded p-3 shadow-sm bg-white"
            >
              <p className="font-medium text-gray-800">
                {appt.appointment_type?.name || 'Sin tipo'}
              </p>
              <p className="text-sm text-gray-600">
                {new Date(appt.start_at).toLocaleString()} —{' '}
                <span className="capitalize">{appt.status}</span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
