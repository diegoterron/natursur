import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Dashboard from './Dashboard'
import AppointmentTypeDetail from './AppointmentTypeDetail'
import MyAppointments from './MyAppointments'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
)

export default function App() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setErrorMessage(error.message)
    setLoading(false)
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setErrorMessage(error.message)
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md bg-white border border-emerald-100 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.15)] p-8">
          <h2 className="text-2xl font-semibold text-center text-sky-900 mb-6">
            Inicia sesión o regístrate
          </h2>

          {errorMessage && (
            <p className="text-red-600 text-sm mb-4 text-center">
              {errorMessage}
            </p>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-md font-medium shadow-sm transition ${
                loading
                  ? 'bg-gray-200 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
              }`}
            >
              {loading ? 'Cargando…' : 'Iniciar sesión'}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center">
            <hr className="flex-1 border-slate-200" />
            <span className="mx-3 text-slate-400 text-sm">o</span>
            <hr className="flex-1 border-slate-200" />
          </div>

          <button
            onClick={handleSignUp}
            disabled={loading}
            className="mt-6 w-full py-2 rounded-md border border-sky-100 bg-sky-50 text-sky-700 hover:bg-sky-100 shadow-sm font-medium transition"
          >
            Registrarse
          </button>

          <footer className="mt-8 text-center text-xs text-slate-400">
            © 2025 Fernando Escalona
          </footer>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="w-full max-w-6xl p-4 md:p-8">
          <Routes>
            <Route
              path="/"
              element={<Dashboard session={session} onLogout={handleLogout} />}
            />
            <Route
              path="/appointment-type/:typeId"
              element={<AppointmentTypeDetail />}
            />
            <Route
              path="/my-appointments"
              element={<MyAppointments session={session} />}
            />
          </Routes>
        </div>
      </div>
    </div>
  )
}




