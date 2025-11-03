// Dashboard.jsx
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Inicializa el cliente Supabase
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

export default function Dashboard({ session, onLogout }) {
  const [appointmentTypes, setAppointmentTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para llamar a la Edge Function
  const fetchAppointmentTypes = async () => {
    setLoading(true);
    setError(null);

    try {
      // para llamar a la funcion del backend simplemente supabase.functions.invoke("nombre")
      const { data, error } = await supabase.functions.invoke("get-all-appointmenttypes");
      if (error) {
        console.error("Edge Function Error:", error);
        setError(error.message);
        setAppointmentTypes([]);
      } else {
        setAppointmentTypes(data ?? []);
      }
    } catch (err) {
      console.error("Fetch failed:", err);
      setError("Error al obtener tipos de citas.");
      setAppointmentTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointmentTypes();
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h2>Bienvenido, {session.user.email}</h2>
      <button onClick={onLogout} style={{ marginBottom: "20px" }}>
        Cerrar sesión
      </button>

      <hr />

      <h3>Tipos de Citas</h3>

      {loading && <p>Cargando tipos de citas...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {appointmentTypes.map((type) => (
          <li key={type.id}>
            <strong>{type.name}</strong> - {type.description} (
            {type.duration_minutes} min, {type.price_cents
              ? `$${(type.price_cents / 100).toFixed(2)}`
              : "Gratis"}
            )
          </li>
        ))}
      </ul>

      {appointmentTypes.length === 0 && !loading && !error && (
        <p>No hay tipos de citas disponibles.</p>
      )}
    </div>
  );
}
