'use client'

import { useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NuevoInmueble() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    city: '',
    operation_type: 'Alquiler',
    disposition: '2+kk',
    surface_m2: '',
    image_urls: [] as string[]
  })

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleMultipleImagesUpload = async (e: any) => {
    try {
      setUploadingImages(true)
      const files = Array.from(e.target.files) as File[]
      if (files.length === 0) return

      const uploadedUrls: string[] = []

      for (const file of files) {
        const fileExt = file.name.split('.').pop()
        const fileName = Math.random() + '.' + fileExt
        const filePath = fileName

        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data } = supabase.storage
          .from('property-images')
          .getPublicUrl(filePath)

        if (data?.publicUrl) {
          uploadedUrls.push(data.publicUrl)
        }
      }

      setFormData({
        ...formData,
        image_urls: [...formData.image_urls, ...uploadedUrls]
      })

      alert('¡' + files.length + ' imágenes subidas con éxito!')
    } catch (error: any) {
      alert('Error al subir las imágenes: ' + error.message)
    } finally {
      setUploadingImages(false)
    }
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('properties').insert([
      {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        city: formData.city,
        operation_type: formData.operation_type,
        disposition: formData.disposition,
        surface_m2: formData.surface_m2 ? Number(formData.surface_m2) : null,
        image_urls: formData.image_urls,
        image_url: formData.image_urls[0] || ''
      }
    ])

    setLoading(false)

    if (error) {
      alert('Error al guardar la propiedad: ' + error.message)
    } else {
      alert('¡Inmueble publicado con éxito!')
      router.push('/')
      router.refresh()
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-xl mx-auto mb-6">
        <Link href="/" className="text-sm font-medium text-blue-600 hover:underline">
          ← Volver al inicio
        </Link>
      </div>

      <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-md border border-gray-100">
        <h1 className="text-2xl font-bold text-blue-600 mb-6 text-center">
          Publicar Nuevo Inmueble 🇨🇿
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título del anuncio</label>
            <input
              type="text"
              name="title"
              required
              placeholder="Ej: Moderno apartamento en Vinohrady"
              value={formData.title}
              onChange={handleChange}
              className="w-full border rounded-xl p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              name="description"
              required
              rows={3}
              placeholder="Detalles de la propiedad..."
              value={formData.description}
              onChange={handleChange}
              className="w-full border rounded-xl p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio (CZK)</label>
              <input
                type="number"
                name="price"
                required
                placeholder="Ej: 25000"
                value={formData.price}
                onChange={handleChange}
                className="w-full border rounded-xl p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
              <input
                type="text"
                name="city"
                required
                placeholder="Ej: Praha"
                value={formData.city}
                onChange={handleChange}
                className="w-full border rounded-xl p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Habitaciones</label>
              <select
                name="disposition"
                value={formData.disposition}
                onChange={handleChange}
                className="w-full border rounded-xl p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
              >
                <option value="1+kk">1+kk</option>
                <option value="1+1">1+1</option>
                <option value="2+kk">2+kk</option>
                <option value="2+1">2+1</option>
                <option value="3+kk">3+kk</option>
                <option value="3+1">3+1</option>
                <option value="4+kk o más">4+kk o más</option>
                <option value="Casa / Otro">Casa / Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Superficie (m²)</label>
              <input
                type="number"
                name="surface_m2"
                placeholder="Ej: 65"
                value={formData.surface_m2}
                onChange={handleChange}
                className="w-full border rounded-xl p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de operación</label>
            <select
              name="operation_type"
              value={formData.operation_type}
              onChange={handleChange}
              className="w-full border rounded-xl p-3 text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
            >
              <option value="Alquiler">Alquiler</option>
              <option value="Venta">Venta</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fotos del inmueble (puedes seleccionar varias)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleMultipleImagesUpload}
              className="w-full border rounded-xl p-2 text-gray-500 bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
            {uploadingImages && <p className="text-xs text-blue-600 mt-1">Subiendo imágenes a la nube...</p>}
            {formData.image_urls.length > 0 && (
              <p className="text-xs text-green-600 mt-1 font-semibold">✓ {formData.image_urls.length} imágenes cargadas</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || uploadingImages}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition shadow-md cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Publicando...' : 'Publicar Inmueble con Fotos'}
          </button>
        </form>
      </div>
    </main>
  )
}