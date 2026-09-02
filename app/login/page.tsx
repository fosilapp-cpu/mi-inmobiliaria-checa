'use client'

import { useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  const handleAuth = async (e: any) => {
    e.preventDefault()
    setLoading(true)

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) alert('Error en registro: ' + error.message)
      else alert('¡Registro exitoso! Ya puedes iniciar sesión.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) alert('Error al iniciar sesión: ' + error.message)
      else {
        alert('¡Bienvenido!')
        router.push('/')
        router.refresh()
      }
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-md border w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="text-2xl font-black text-blue-600 tracking-tight">CzechRealEstate 🇨🇿</Link>
          <h1 className="text-xl font-bold text-gray-800 mt-2">{isSignUp ? 'Crear una cuenta' : 'Iniciar Sesión'}</h1>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-xl p-3 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              placeholder="tu@correo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-xl p-3 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Procesando...' : (isSignUp ? 'Registrarse' : 'Entrar')}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-blue-600 hover:underline font-medium cursor-pointer"
          >
            {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate aquí'}
          </button>
        </div>
      </div>
    </main>
  )
}