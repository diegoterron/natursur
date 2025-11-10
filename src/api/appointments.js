import { supabase } from './supabaseClient'

export const createAppointment = async ({ appointment_type_id, start_at, end_at }) => {
  const user = supabase.auth.getUser()
  if (!user) throw new Error('No estás autenticado')

  const { data, error } = await supabase
    .from('appointments')
    .insert([
      {
        user_id: user.id,
        appointment_type_id,
        start_at,
        end_at,
        status: 'booked'
      }
    ])

  if (error) throw error
  return data
}

export async function getUserAppointments(userId) {
  // Example using Supabase
  const { data, error } = await supabase
    .from('appointments_view') // or 'appointments'
    .select('*')
    .eq('user_id', userId)
    .order('start_at', { ascending: true })

  if (error) throw error
  return data
}

export async function cancelAppointment(id) {
  const { error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', id)

  if (error) throw error
}
