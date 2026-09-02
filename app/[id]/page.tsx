'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

export default function DetallePropiedad() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id

  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    if (!id) return

    async function fetchProperty() {
      const numericId = Number(id)
      if (!isNaN(numericId)) {
        const { data } = await supabase
          .from('properties')
          .select('*')
          .eq('id', numericId)
          .maybeSingle()
        if (data) {
          setProperty(data)
          setLoading(false)
          return
        }
      }

      const { data } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      setProperty(data)
      setLoading(false)
    }

    fetchProperty()
  }, [id])

  const handleDelete = async () => {
    const confirmar = window.confirm('¿Estás seguro de que deseas eliminar este inmueble?')
    if (!confirmar) return

    setDeleting(true)
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', property.id)

    setDeleting(false)

    if (error) {
      alert('Hubo un error al eliminar la propiedad: ' + error.message)
    } else {
      alert('Propiedad eliminada con éxito.')
      router.push('/')
      router.refresh()
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-gray-500 font-medium text-lg">Cargando detalles...</div>
      </main>
    )
  }

  if (!property) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full border">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Propiedad no encontrada</h1>
          <p className="text-gray-500 mb-6">El inmueble que buscas no existe o fue eliminado.</p>
          <Link href="/" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition inline-block">
            Volver al inicio
          </Link>
        </div>
      </main>
    )
  }

  let images: string[] = []
  if (Array.isArray(property.image_urls) && property.image_urls.length > 0) {
    images = property.image_urls
  } else if (property.image_url) {
    images = [property.image_url]
  } else {
    images = ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1000&auto=format&fit=crop']
  }

  const currentImage = images[activeImageIndex] || images[0]

  return (
    <main className="min-h-screen bg-gray-100 text-gray-800 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-black text-blue-600 tracking-tight flex items-center gap-2">
            <span>CzechRealEstate</span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-semibold">CzRE</span>
          </Link>
          <Link href="/" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">
            ← Volver al listado
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-white rounded-3xl shadow-md overflow-hidden border border-gray-100">
          
          <div>
            <div className="h-96 bg-gray-900 relative overflow-hidden flex items-center justify-center">
              <img 
                src={currentImage} 
                alt={property.title} 
                className="w-full h-full object-cover absolute inset-0 transition-all duration-300"
              />
              <div className="absolute inset-0 bg-black/20"></div>

              <span className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider z-10">
                {property.operation_type || 'Inmueble'}
              </span>

              <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-lg z-10">
                Foto {activeImageIndex + 1} de {images.length}
              </div>
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 p-4 bg-gray-900/90 overflow-x-auto">
                {images.map((imgUrl: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={'w-20 h-16 rounded-xl overflow-hidden border-2 transition cursor-pointer flex-shrink-0 ' + (activeImageIndex === idx ? 'border-blue-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100')}
                  >
                    <img src={imgUrl} alt={'Miniatura ' + (idx + 1)} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">📍 {property.city}</span>
                <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mt-1">
                  {property.title}
                </h1>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400 block uppercase font-medium">Precio</span>
                <span className="text-3xl font-black text-blue-600">
                  {property.price ? Number(property.price).toLocaleString() : 0} <span className="text-lg font-bold text-gray-700">CZK</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl text-center">
                <span className="text-xs text-blue-600 font-bold uppercase tracking-wider block mb-1">Habitaciones</span>
                <span className="text-xl font-extrabold text-gray-800">{property.disposition || 'N/D'}</span>
              </div>
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl text-center">
                <span className="text-xs text-blue-600 font-bold uppercase tracking-wider block mb-1">Superficie</span>
                <span className="text-xl font-extrabold text-gray-800">{property.surface_m2 ? property.surface_m2 + ' m²' : 'N/D'}</span>
              </div>
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl text-center col-span-2 sm:col-span-1">
                <span className="text-xs text-blue-600 font-bold uppercase tracking-wider block mb-1">Ubicación</span>
                <span className="text-xl font-extrabold text-gray-800">{property.city}</span>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-3">Descripción completa</h3>
              <p className="text-gray-600 leading-relaxed text-base whitespace-pre-line bg-gray-50 p-6 rounded-2xl border">
                {property.description || 'Sin descripción detallada disponible.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
              <button 
                onClick={() => alert('¡Pronto podrás contactar directamente con el anunciante!')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl transition text-center shadow cursor-pointer"
              >
                Contactar al propietario
              </button>

              <Link 
                href={'/editar/' + property.id}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3.5 px-6 rounded-xl transition text-center flex items-center justify-center border cursor-pointer"
              >
                Modificar Inmueble
              </Link>
              
              <button 
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold py-3.5 px-6 rounded-xl transition text-center cursor-pointer"
              >
                {deleting ? 'Eliminando...' : '🗑️ Eliminar'}
              </button>
            </div>
{/* Formulario de Contacto Directo */}
            <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-2">¿Te interesa este inmueble?</h3>
              <p className="text-sm text-gray-500 mb-4">Envía un mensaje al propietario para coordinar una visita.</p>
              
              <form onSubmit={(e) => { e.preventDefault(); alert('¡Mensaje enviado con éxito al propietario! Te contactará pronto.'); e.currentTarget.reset(); }} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input type="text" required placeholder="Tu nombre" className="border rounded-xl p-3 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="email" required placeholder="Tu correo electrónico" className="border rounded-xl p-3 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <textarea required rows={2} placeholder="Hola, estoy interesado en este inmueble..." className="w-full border rounded-xl p-3 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition text-sm cursor-pointer shadow">
                  Enviar Mensaje al Propietario
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}