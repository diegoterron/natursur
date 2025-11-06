import { supabase } from './supabaseClient'

export const createAppointment = async ({ appointment_type_id, start_at, end_at, staffId,userId }) => {
  const user = supabase.auth.getUser()
  if (!user) throw new Error('No estás autenticado')

  const { data, error } = await supabase
    .from('appointments')
    .insert([
      {
        appointment_type_id,
        start_at,
        end_at,
        status: 'booked',
        staff_id: staffId,
        user_id: userId
      }
    ])


  return data
}

export const createMultipleAppointments = async (appointments) => {
  const { data: user } = await supabase.auth.getUser()
  if (!user) throw new Error('No estás autenticado')

  if (!Array.isArray(appointments) || appointments.length === 0) {
    throw new Error('Debes enviar un array de citas')
  }

  const formattedAppointments = appointments.map(appt => ({
    user_id: user.id,
    appointment_type_id: appt.appointment_type_id,
    start_at: appt.start_at,
    end_at: appt.end_at,
    status: 'booked',
    staff_id: appt.staffId
  }))

  const { data, error } = await supabase
    .from('appointments')
    .insert(formattedAppointments)

  if (error) throw error
  return data
}
