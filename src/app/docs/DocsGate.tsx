'use client'

import { useState, useEffect } from 'react'

export default function DocsGate({ children }: { children: React.ReactNode }) {
  const [password, setPassword] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const auth = sessionStorage.getItem('docs_auth')
    if (auth === 'true') {
      setIsAuthorized(true)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const validPass = process.env.NEXT_PUBLIC_DOCS_PASS || 'password1234'
    
    if (password === validPass) {
      sessionStorage.setItem('docs_auth', 'true')
      setIsAuthorized(true)
      setError('')
    } else {
      setError('Contraseña incorrecta')
    }
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f7f4] font-sans px-4">
        <div className="max-w-sm w-full p-8 bg-white rounded-2xl shadow-sm border border-[#e2e0d8]">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-medium text-[#002845] mb-1">
              tu<span className="text-[#FF8C3C]">Herencia</span>Fácil
            </h1>
            <p className="text-[13px] text-[#5F5E5A]">Documentación interna</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 text-[15px] border border-[#e2e0d8] rounded-[10px] focus:ring-2 focus:ring-[#EBF5FA] focus:border-[#3A8DA8] outline-none transition-all text-[#1a1a18] bg-[#f8f7f4] placeholder-[#B4B2A9]"
                placeholder="Ingresa la contraseña"
                autoFocus
                required
              />
            </div>
            {error && <p className="text-[#E24B4A] text-xs font-medium text-center">{error}</p>}
            <button
              type="submit"
              className="w-full bg-[#002845] text-white font-medium text-[15px] py-2.5 rounded-[10px] hover:bg-[#004A80] transition-colors"
            >
              Acceder
            </button>
          </form>
          <div className="mt-8 pt-4 border-t border-[#e2e0d8] text-center">
            <p className="text-[11px] text-[#B4B2A9]">
              Uso exclusivo del equipo.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // When authorized, just return children without wrapping them in extra containers.
  // The pages themselves handle their own max-width and background.
  return <>{children}</>
}
