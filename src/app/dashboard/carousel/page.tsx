'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Plus, Trash2, Edit, Image, Loader2, Check, X, ChevronDown, Pause, Play
} from 'lucide-react'
import { ImageWithFallback } from '@/components/common/ImageWithFallback'

interface CarouselArtwork {
  id: number
  url: string
  title: string
  category: string
  year: string
}

interface GalleryArtwork {
  id: number
  title: string
  category: string
  image: string
  description: string
}

export default function CarouselPage() {
  const [artworks, setArtworks] = useState<CarouselArtwork[]>([])
  const [galleryArtworks, setGalleryArtworks] = useState<GalleryArtwork[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingArtwork, setEditingArtwork] = useState<CarouselArtwork | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [previewIndex, setPreviewIndex] = useState(0)
  const [previewAutoPlay, setPreviewAutoPlay] = useState(true)
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    url: '',
    title: '',
    category: '',
    year: '',
  })

  useEffect(() => {
    loadArtworks()
    loadCategories()
    loadGalleryArtworks()
  }, [])

  async function loadGalleryArtworks() {
    try {
      const res = await fetch('/api/artworks?type=gallery')
      const data = await res.json()
      setGalleryArtworks(data.data || [])
    } catch (error) {
      console.error('Erro ao carregar obras da galeria:', error)
    }
  }

  // Auto-play do preview
  useEffect(() => {
    if (previewAutoPlay && artworks.length > 0) {
      const interval = setInterval(() => {
        setPreviewIndex((prev) => (prev + 1) % artworks.length)
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [previewAutoPlay, artworks.length])


  async function loadCategories() {
    try {
      // Buscar categorias da galeria
      const galleryRes = await fetch('/api/artworks?type=gallery')
      const galleryData = await galleryRes.json()
      const galleryArtworks = galleryData.data || []
      
      // Buscar categorias do carrossel
      const carouselRes = await fetch('/api/artworks?type=carousel')
      const carouselData = await carouselRes.json()
      const carouselArtworks = carouselData.data || []
      
      // Coletar todas as categorias do banco de dados, normalizando e filtrando vazias
      const allCategoriesFromDB: string[] = []
      
      // Adicionar categorias da galeria
      galleryArtworks.forEach((a: any) => {
        if (a.category) {
          const trimmed = a.category.trim()
          if (trimmed && !allCategoriesFromDB.includes(trimmed)) {
            allCategoriesFromDB.push(trimmed)
          }
        }
      })
      
      // Adicionar categorias do carrossel (sem duplicar)
      carouselArtworks.forEach((a: any) => {
        if (a.category) {
          const trimmed = a.category.trim()
          if (trimmed && !allCategoriesFromDB.includes(trimmed)) {
            allCategoriesFromDB.push(trimmed)
          }
        }
      })
      
      // Ordenar alfabeticamente
      const uniqueCategories = allCategoriesFromDB.sort()
      
      setAvailableCategories(uniqueCategories)
      
      // Se formData.category estiver vazio ou não existir nas categorias, usar a primeira disponível
      if (!formData.category || !uniqueCategories.includes(formData.category)) {
        setFormData(prev => ({
          ...prev,
          category: uniqueCategories[0] || ''
        }))
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
      // Em caso de erro, manter array vazio
      setAvailableCategories([])
    }
  }

  async function loadArtworks() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/artworks?type=carousel')
      const data = await res.json()
      setArtworks(data.data || [])
    } catch (error) {
      console.error('Erro ao carregar artworks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function openCreateModal() {
    setEditingArtwork(null)
    setSelectedGalleryImage(null)
    setFormData({
      url: '',
      title: '',
      category: availableCategories[0] || '',
      year: '',
    })
    loadGalleryArtworks() // Recarregar obras da galeria ao abrir modal
    setIsModalOpen(true)
  }

  function openEditModal(artwork: CarouselArtwork) {
    setEditingArtwork(artwork)
    setSelectedGalleryImage(artwork.url)
    setFormData({
      url: artwork.url,
      title: artwork.title,
      category: artwork.category,
      year: artwork.year,
    })
    loadGalleryArtworks() // Recarregar obras da galeria ao abrir modal
    setIsModalOpen(true)
  }

  function handleSelectGalleryImage(galleryArtwork: GalleryArtwork) {
    setSelectedGalleryImage(galleryArtwork.image)
    setFormData({
      ...formData,
      url: galleryArtwork.image,
      title: galleryArtwork.title,
      category: galleryArtwork.category || formData.category,
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    try {
      const url = '/api/artworks'
      const method = editingArtwork ? 'PUT' : 'POST'
      const body = editingArtwork
        ? { type: 'carousel', id: editingArtwork.id, ...formData }
        : { type: 'carousel', ...formData }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error })
        return
      }

      setMessage({ type: 'success', text: editingArtwork ? 'Atualizado com sucesso!' : 'Criado com sucesso!' })
      setIsModalOpen(false)
      await loadArtworks()
      await loadCategories() // Recarregar categorias após salvar
    } catch {
      setMessage({ type: 'error', text: 'Erro ao salvar' })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Tem certeza que deseja deletar?')) return

    try {
      const res = await fetch(`/api/artworks?type=carousel&id=${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Deletado com sucesso!' })
        await loadArtworks()
        await loadCategories() // Recarregar categorias após deletar
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro ao deletar' })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    )
  }

  const getVisibleCards = () => {
    if (artworks.length === 0) return { prev: 0, current: 0, next: 0 }
    const prev = (previewIndex - 1 + artworks.length) % artworks.length
    const next = (previewIndex + 1) % artworks.length
    return { prev, current: previewIndex, next }
  }

  const visible = getVisibleCards()

  return (
    <div className="h-full flex flex-col overflow-hidden" id="carousel-container">
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex justify-between items-center flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Carrossel</h1>
          <p className="text-gray-400">Gerencie as imagens do carrossel</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all"
        >
          <Plus className="w-4 h-4" />
          Adicionar
        </button>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mx-6 mt-4 p-4 rounded-xl flex items-center gap-2 flex-shrink-0 ${
              message.type === 'success'
                ? 'bg-green-500/20 border border-green-500/50 text-green-300'
                : 'bg-red-500/20 border border-red-500/50 text-red-300'
            }`}
          >
            {message.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            {message.text}
            <button onClick={() => setMessage(null)} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Container principal com split */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Área de Edição (Em cima) - 40% fixo */}
        <div 
          className="overflow-y-auto p-4"
          style={{ height: '50%' }}
        >
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {artworks.map((artwork) => (
            <motion.div
              key={artwork.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/5 rounded-xl overflow-hidden border border-white/10 group"
            >
              <div className="relative h-32">
                <img
                  src={artwork.url}
                  alt={artwork.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
                  <div className="flex-1 min-w-0">
                    <span className="text-purple-400 text-[10px] uppercase block truncate">{artwork.category}</span>
                    <h3 className="text-white font-medium text-xs truncate">{artwork.title}</h3>
                    <p className="text-gray-300 text-[10px]">{artwork.year}</p>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => openEditModal(artwork)}
                      className="w-6 h-6 bg-white/20 rounded flex items-center justify-center text-white hover:bg-white/30 transition-colors flex-shrink-0"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(artwork.id)}
                      className="w-6 h-6 bg-red-500/50 rounded flex items-center justify-center text-white hover:bg-red-500/70 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-2">
                <h3 className="text-white font-medium text-xs mb-0.5 truncate">{artwork.title}</h3>
                <p className="text-gray-400 text-[10px] truncate">{artwork.year} • {artwork.category}</p>
              </div>
            </motion.div>
          ))}
        </div>

          {artworks.length === 0 && (
            <div className="text-center py-12">
              <Image className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Nenhum item encontrado</p>
            </div>
          )}
        </div>

        {/* Divisor fixo */}
        <div className="h-1 bg-white/10 flex items-center justify-center">
          <div className="w-20 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Preview do Carrossel (Embaixo) - 60% fixo */}
        <div 
          className="overflow-hidden bg-zinc-950/50 p-6 flex flex-col"
          style={{ height: '70%' }}
        >
          <div className="max-w-7xl mx-auto flex-1 flex flex-col">
            <div className="mb-4 flex items-center justify-between flex-shrink-0">
              <h2 className="text-xl font-bold text-white">Preview do Carrossel</h2>
              <div className="w-px h-8 bg-white/10 mx-4" />
              <motion.button
                onClick={() => setPreviewAutoPlay(!previewAutoPlay)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-400/50 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {previewAutoPlay ? (
                  <Pause className="w-3 h-3 text-purple-400" />
                ) : (
                  <Play className="w-3 h-3 text-purple-400" />
                )}
              </motion.button>
            </div>

            {/* Carrossel Preview - Fiel ao original */}
            <div className="relative flex-1 flex items-center justify-center min-h-0">
              <div className="relative w-full max-w-xl mx-auto">
                <AnimatePresence mode="sync">
                  {artworks.map((artwork, index) => {
                    const isPrev = index === visible.prev
                    const isCurrent = index === visible.current
                    const isNext = index === visible.next
                    if (!(isPrev || isCurrent || isNext)) return null

                    let xOffset = isPrev ? -120 : isNext ? 120 : 0
                    let zIndex = isCurrent ? 3 : 1
                    let scale = isCurrent ? 1 : 0.82
                    let blur = isCurrent ? 0 : 6
                    let opacity = isCurrent ? 1 : 0.45

                    return (
                      <motion.div
                        key={artwork.id}
                        className="absolute left-1/2 top-1/2"
                        initial={{ x: xOffset - 60, y: '-50%', scale: 0.6, opacity: 0 }}
                        animate={{
                          x: xOffset - 60,
                          y: '-50%',
                          scale,
                          opacity,
                          filter: `blur(${blur}px)`,
                        }}
                        exit={{ x: xOffset - 60, opacity: 0, scale: 0.6, transition: { duration: 0.3 } }}
                        transition={{ duration: 0.5 }}
                        style={{ zIndex }}
                      >
                        <div
                          className={`relative w-[110px] h-[180px] md:w-[160px] md:h-[210px] rounded-xl overflow-hidden transition-all duration-700 ${
                            isCurrent
                              ? 'shadow-[0_20px_40px_-6px_rgba(168,85,247,0.32)]'
                              : 'shadow-[0_8px_20px_-8px_rgba(0,0,0,0.7)]'
                          }`}
                        >
                          <ImageWithFallback
                            src={artwork.url}
                            alt={artwork.title}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                          {isCurrent && (
                            <motion.div
                              className="absolute inset-0 pointer-events-none rounded-xl"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: [0.2, 0.35, 0.2] }}
                              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                              style={{ boxShadow: 'inset 0 0 30px rgba(168,85,247,0.2)' }}
                            />
                          )}

                          <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3">
                            <motion.div
                              initial={{ opacity: 0, y: 14 }}
                              animate={{ opacity: isCurrent ? 1 : 0, y: isCurrent ? 0 : 14 }}
                              transition={{ delay: isCurrent ? 0.12 : 0 }}
                            >
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className="px-1.5 py-0.5 bg-purple-500/20 rounded text-purple-200 text-[10px]">
                                  {artwork.category}
                                </span>
                                <span className="text-gray-400 text-[10px]">{artwork.year}</span>
                              </div>
                              <h3 className="text-white text-xs md:text-sm mb-0.5 truncate">{artwork.title}</h3>
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>

              {/* Navigation */}
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3">
                {artworks.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => {
                      setPreviewIndex(index)
                      setPreviewAutoPlay(false)
                    }}
                    className={`transition-all duration-300 rounded-full ${
                      index === previewIndex
                        ? 'w-7 h-2 bg-purple-500'
                        : 'w-2 h-2 bg-white/30 hover:bg-white/50'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  />
                ))}
              </div>
            </div>

            {/* Progress */}
            <div className="text-center mt-7 flex-shrink-0">
              <p className="text-gray-400">
                <span className="text-purple-400">{previewIndex + 1}</span> / {artworks.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-2xl p-6 w-full max-w-lg border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-6">
                {editingArtwork ? 'Editar' : 'Adicionar'} Item do Carrossel
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Selecionar Imagem da Galeria</label>
                  {galleryArtworks.length === 0 ? (
                    <div className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-400 text-sm text-center">
                      Nenhuma imagem na galeria. Crie uma obra na galeria primeiro.
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto bg-white/5 border border-white/10 rounded-xl p-3">
                      <div className="grid grid-cols-3 gap-2">
                        {galleryArtworks.map((galleryArtwork) => (
                          <motion.button
                            key={galleryArtwork.id}
                            type="button"
                            onClick={() => handleSelectGalleryImage(galleryArtwork)}
                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                              selectedGalleryImage === galleryArtwork.image
                                ? 'border-purple-500 ring-2 ring-purple-500/50'
                                : 'border-white/20 hover:border-white/40'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <ImageWithFallback
                              src={galleryArtwork.image}
                              alt={galleryArtwork.title}
                              className="w-full h-full object-cover"
                            />
                            {selectedGalleryImage === galleryArtwork.image && (
                              <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                                <Check className="w-6 h-6 text-purple-400" />
                              </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1">
                              <p className="text-white text-[10px] truncate">{galleryArtwork.title}</p>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedGalleryImage && (
                    <div className="mt-2 text-xs text-gray-400">
                      Imagem selecionada: {formData.title || 'Sem título'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Título</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Categoria</label>
                  <div className="relative">
                    {availableCategories.length > 0 ? (
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 appearance-none"
                        required
                      >
                        {availableCategories.map((cat) => (
                          <option key={cat} value={cat} className="bg-slate-800">
                            {cat}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-400 text-sm">
                        Nenhuma categoria encontrada. Crie uma obra na galeria primeiro.
                      </div>
                    )}
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Ano</label>
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                    placeholder="2024"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || availableCategories.length === 0 || !formData.category || !formData.url}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
