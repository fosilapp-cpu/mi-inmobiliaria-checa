'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { dictionary } from '@/app/lib/dictionary'
import Image from 'next/image';

export default function Home() {
  const router = useRouter()
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  
  // Estado del idioma (por defecto 'es', o puedes cambiarlo a 'cs' o 'en')
  const [lang, setLang] = useState<'es' | 'en' | 'cs'>('es')
  const t = dictionary[lang]

  // Estados para los filtros
  const [operationType, setOperationType] = useState('Todos')
  const [cityFilter, setCityFilter] = useState('Todas')
  const [dispositionFilter, setDispositionFilter] = useState('Todas')

  useEffect(() => {
    fetchProperties()
    checkUser()
  }, [])

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession()
    setUser(session?.user || null)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
    router.refresh()
    alert(lang === 'cs' ? 'Odhlášení proběhło úspěšně' : lang === 'en' ? 'Successfully logged out' : 'Sesión cerrada con éxito')
  }

  async function fetchProperties() {
    setLoading(true)
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('id', { ascending: false })

    if (error) {
      console.error('Error:', error.message)
    } else {
      setProperties(data || [])
    }
    setLoading(false)
  }

  const filteredProperties = properties.filter((property) => {
    const matchOperation = operationType === 'Todos' || property.operation_type === operationType || 
      (lang === 'cs' && ((operationType === 'Alquiler' && property.operation_type === 'Pronájem') || (operationType === 'Venta' && property.operation_type === 'Prodej')))
    const matchCity = cityFilter === 'Todas' || property.city?.toLowerCase() === cityFilter.toLowerCase()
    const matchDisposition = dispositionFilter === 'Todas' || property.disposition === dispositionFilter
    return matchOperation && matchCity && matchDisposition
  })

  const uniqueCities = ['Todas', ...Array.from(new Set(properties.map((p) => p.city).filter(Boolean)))]
  const uniqueDispositions = ['Todas', ...Array.from(new Set(properties.map((p) => p.disposition).filter(Boolean)))]

  return (
    <main className="min-h-screen bg-gray-100 text-gray-800 pb-20">
      {/* Menú Superior con Selector de Idioma */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-black text-blue-600 tracking-tight flex items-center gap-2">
            <span>{t.title}</span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-semibold">CzRe</span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Selector de Idioma */}
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as 'es' | 'en' | 'cs')}
              className="bg-gray-50 border rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 outline-none cursor-pointer"
            >
              <option value="es">🇪🇸 Español</option>
              <option value="en">🇬🇧 English</option>
              <option value="cs">🇨🇿 Čeština</option>
            </select>

            {user && (
              <Link 
                href="/nuevo" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl transition shadow text-sm cursor-pointer"
              >
                {t.publish}
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 hidden md:inline font-medium">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 font-semibold px-3 py-2 rounded-xl transition text-sm cursor-pointer border"
                >
                  {t.logout}
                </button>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-xl transition text-sm cursor-pointer border"
              >
                {t.login}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero y Filtros */}
      <div className="relative w-full py-16 px-4 text-white overflow-hidden">
        <Image
  src="/images/hero-praga.jpeg"
  alt="Praga inmobiliaria"
  fill
  className="object-cover -z-10 brightness-75"
/>
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-3">{t.subtitle}</h1>
          <p className="text-blue-200 text-lg mb-8">{t.searchDesc}</p>

          <div className="bg-white p-6 rounded-3xl shadow-xl text-gray-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">{t.operation}</label>
              <select
                value={operationType}
                onChange={(e) => setOperationType(e.target.value)}
                className="w-full bg-gray-50 border rounded-xl p-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Todos">{t.allOperations}</option>
                <option value="Alquiler">{lang === 'cs' ? 'Pronájem' : t.rent}</option>
                <option value="Venta">{lang === 'cs' ? 'Prodej' : t.sale}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">{t.city}</label>
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full bg-gray-50 border rounded-xl p-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Todas">{t.allCities}</option>
                {uniqueCities.filter(c => c !== 'Todas').map((city, index) => (
                  <option key={index} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">{t.disposition}</label>
              <select
                value={dispositionFilter}
                onChange={(e) => setDispositionFilter(e.target.value)}
                className="w-full bg-gray-50 border rounded-xl p-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Todas">{t.allDispositions}</option>
                {uniqueDispositions.filter(d => d !== 'Todas').map((disp, index) => (
                  <option key={index} value={disp}>{disp}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Listado */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {t.availableProperties} <span className="text-sm font-normal text-gray-500">({filteredProperties.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500 font-medium text-lg">Loading...</div>
        ) : filteredProperties.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center border shadow-sm max-w-md mx-auto">
            <p className="text-gray-500 font-medium mb-4">{t.noResults}</p>
            <button
              onClick={() => { setOperationType('Todos'); setCityFilter('Todas'); setDispositionFilter('Todas'); }}
              className="bg-blue-600 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-blue-700 transition"
            >
              {t.resetFilters}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property) => (
              <div key={property.id} className="bg-white rounded-3xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100 flex flex-col">
                <div className="h-56 bg-gray-200 relative overflow-hidden">
                  {property.image_url ? (
                    <img 
                      src={property.image_url} 
                      alt={property.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">Image</div>
                  )}
                  <span className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {property.operation_type}
                  </span>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">📍 {property.city}</span>
                      <span className="text-xs bg-gray-100 text-gray-700 font-bold px-2.5 py-1 rounded-lg">
                        {property.disposition || 'N/D'}
                      </span>
                    </div>

                    <h3 className="text-lg font-extrabold text-gray-900 mb-2 line-clamp-1">{property.title}</h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{property.description}</p>
                  </div>

                  <div className="pt-4 border-t flex items-center justify-between mt-auto">
                    <div>
                      <span className="text-xs text-gray-400 block font-medium">{t.price}</span>
                      <span className="text-xl font-black text-blue-600">
                        {property.price ? Number(property.price).toLocaleString() : 0} <span className="text-sm font-bold text-gray-700">CZK</span>
                      </span>
                    </div>

                    <Link 
                      href={'/' + property.id}
                      className="bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white font-bold px-4 py-2.5 rounded-xl transition text-sm"
                    >
                      {t.viewDetails}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}