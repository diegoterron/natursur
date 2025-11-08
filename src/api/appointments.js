import { supabase } from './supabaseClient'

// crea una cita para el usuario autenticado
export const createAppointment = async ({ appointment_type_id, start_at, end_at, staffId, userId }) => {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('No estás autenticado')

  const { data, error } = await supabase
    .from('appointments')
    .insert([
      {
        appointment_type_id,
        start_at,
        end_at,
        status: 'booked',
        staff_id: staffId,
        user_id: userId || user.id // usa el que venga o el actual
      }
    ])
    .select()

  if (error) throw error
  return data
}

// crea múltiples citas para el usuario autenticado
export const createMultipleAppointments = async (appointments) => {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('No estás autenticado')

  if (!Array.isArray(appointments) || appointments.length === 0) {
    throw new Error('Debes enviar un array de citas')
  }

  const formattedAppointments = appointments.map(appt => ({
    user_id: appt.userId || user.id, // ✅ usa el user.id real
    appointment_type_id: appt.appointment_type_id,
    start_at: appt.start_at,
    end_at: appt.end_at,
    status: 'booked',
    staff_id: appt.staffId
  }))

  const { data, error } = await supabase
    .from('appointments')
    .insert(formattedAppointments)
    .select()

  if (error) throw error
  return data
}

// obtiene las citas de un usuario por su ID
export const getAppointmentsByUser = async (userId) => {
  if (!userId) throw new Error('Falta userId')

  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id,
      start_at,
      end_at,
      status,
      appointment_type:appointment_types(name)
    `)
    .eq('user_id', userId)
    .order('start_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}
