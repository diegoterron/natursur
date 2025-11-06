import { supabase } from './supabaseClient'

export const calculateAvailableSlots = async (appointmentTypeId, date, durationMinutes, staffId) => {
  if (!appointmentTypeId || !date || !durationMinutes || !staffId) {
    throw new Error('Faltan parámetros appointmentTypeId, date, durationMinutes o staffId')
  }

  // 1. Obtener todos los slots semanales del tipo y masajista
  const { data: weeklySlots, error: slotsError } = await supabase
    .from('weekly_slots')
    .select('id, start_time, end_time')
    .eq('appointment_type_id', appointmentTypeId)
    .eq('staff_id', staffId)

  if (slotsError) throw slotsError
  if (!weeklySlots || weeklySlots.length === 0) return []

  // 2. Crear sub-slots basados en la duración dentro de cada slot
  const slotSubdivisions = []
  weeklySlots.forEach((slot) => {
    const [startHours, startMinutes] = slot.start_time.split(':').map(Number)
    const [endHours, endMinutes] = slot.end_time.split(':').map(Number)

    const slotStart = new Date(date)
    slotStart.setHours(startHours, startMinutes, 0, 0)

    const slotEnd = new Date(date)
    slotEnd.setHours(endHours, endMinutes, 0, 0)

    let current = new Date(slotStart)
    while (current.getTime() + durationMinutes * 60000 <= slotEnd.getTime()) {
      const next = new Date(current.getTime() + durationMinutes * 60000)
      slotSubdivisions.push({
        slot_id: slot.id,
        start_at: current.toISOString(),
        end_at: next.toISOString(),
        // Además guardamos los timestamps numéricos para comparaciones rápidas
        _start_ts: current.getTime(),
        _end_ts: next.getTime(),
        is_booked: false // por defecto disponible
      })
      current = next
    }
  })

  // 3. Obtener citas ya creadas que coinciden con el tipo y masajista en la fecha
  const { data: bookedAppointmentsRaw, error: bookedError } = await supabase
    .from('appointments')
    .select('start_at, end_at')
    .eq('staff_id', staffId)
    .eq('appointment_type_id', appointmentTypeId)
    // filtramos por el día (sin Z; Supabase guarda con zona, pero la consulta por rango funciona)
    .gte('start_at', `${date}T00:00:00`)
    .lte('end_at', `${date}T23:59:59`)

  if (bookedError) throw bookedError

  const bookedAppointments = (bookedAppointmentsRaw || []).map(appt => {
    const start = new Date(appt.start_at)
    const end = new Date(appt.end_at)
    return {
      raw: appt,
      start_ts: start.getTime(),
      end_ts: end.getTime(),
      start_iso: start.toISOString(),
      end_iso: end.toISOString()
    }
  })

  // 4. Marcar los slots que coinciden exactamente como ocupados (comparación por timestamp)
  const slotsWithAvailability = slotSubdivisions.map((slot) => {
    const isBookedExact = bookedAppointments.some(appt =>
      appt.start_ts === slot._start_ts && appt.end_ts === slot._end_ts
    )


    const finalBooked = isBookedExact

    // eliminamos las claves privadas antes de devolver si no quieres exponerlas
    const { _start_ts, _end_ts, ...publicSlot } = slot
    return { ...publicSlot, is_booked: finalBooked }
  })

  // opcional: orden cronológico por start_at
  slotsWithAvailability.sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())

  const uniqueSlots = slotsWithAvailability.filter(
    (slot, index, self) =>
      index === self.findIndex(
        (s) =>
          s.start_at === slot.start_at &&
          s.end_at === slot.end_at
      )
  )
  // console.log para depuración rápida
  console.log('Slots calculados:', slotsWithAvailability)
  return uniqueSlots;
}
