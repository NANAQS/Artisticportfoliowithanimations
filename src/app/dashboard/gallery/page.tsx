'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Plus, Trash2, Edit, Image, Loader2, Check, X, ChevronDown, Eye, GripVertical, Maximize2, ZoomIn
} from 'lucide-react'
import { ImageWithFallback } from '@/components/common/ImageWithFallback'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface GalleryArtwork {
  id: number
  title: string
  category: string
  image: string
  description: string
  gridClass: string
  order?: number
  youtubeUrl?: string | null
}

const CATEGORIES = [
  'illustrations',
  'character design',
  'landscapes',
  'portraits',
  'concept art',
]

const GRID_CLASSES = [
  { value: 'md:col-span-1 md:row-span-1', label: '1x1 (Pequeno)', cols: 1, rows: 1 },
  { value: 'md:col-span-2 md:row-span-1', label: '2x1 (Largo)', cols: 2, rows: 1 },
  { value: 'md:col-span-1 md:row-span-2', label: '1x2 (Alto)', cols: 1, rows: 2 },
  { value: 'md:col-span-2 md:row-span-2', label: '2x2 (Grande)', cols: 2, rows: 2 },
]

// Componente Sortable para os itens do preview
function SortablePreviewItem({ artwork, onResize }: { artwork: GalleryArtwork, onResize: (id: number, gridClass: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: artwork.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const [isResizing, setIsResizing] = useState(false)
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, cols: 1, rows: 1 })

  // Usar as classes exatamente como no site público
  // gridClass já vem no formato: "md:col-span-1 md:row-span-1", etc.

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsResizing(true)
    const currentClass = GRID_CLASSES.find(gc => gc.value === artwork.gridClass) || GRID_CLASSES[0]
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      cols: currentClass.cols,
      rows: currentClass.rows,
    })
  }

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStart.x
      const deltaY = e.clientY - resizeStart.y
      
      // Calcular novo tamanho baseado no movimento (snap)
      // Threshold de 30px para mudar de tamanho (snap mais preciso)
      const threshold = 30
      let newCols = resizeStart.cols
      let newRows = resizeStart.rows
      
      if (Math.abs(deltaX) > threshold) {
        newCols = deltaX > 0 
          ? Math.min(2, resizeStart.cols + 1)
          : Math.max(1, resizeStart.cols - 1)
      }
      
      if (Math.abs(deltaY) > threshold) {
        newRows = deltaY > 0 
          ? Math.min(2, resizeStart.rows + 1)
          : Math.max(1, resizeStart.rows - 1)
      }
      
      // Encontrar a classe correspondente
      const newClass = GRID_CLASSES.find(gc => gc.cols === newCols && gc.rows === newRows)
      if (newClass && newClass.value !== artwork.gridClass) {
        onResize(artwork.id, newClass.value)
        // Atualizar o estado local para evitar recálculos
        setResizeStart(prev => ({ ...prev, cols: newCols, rows: newRows }))
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = 'nwse-resize'
    document.body.style.userSelect = 'none'

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing, resizeStart, artwork.gridClass, artwork.id, onResize])

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative cursor-pointer overflow-hidden rounded-xl bg-zinc-900 border border-white/10 hover:border-purple-500/50 shadow-md hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 ${artwork.gridClass}`}
      title={artwork.title}
    >
      <div className="relative w-full h-full overflow-hidden">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 w-6 h-6 bg-white/20 backdrop-blur-sm rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20"
        >
          <GripVertical className="w-4 h-4 text-white" />
        </div>

        {/* Resize Handle */}
        <div
          onMouseDown={handleResizeStart}
          className="absolute bottom-2 right-2 w-6 h-6 bg-purple-500/70 backdrop-blur-sm rounded cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20"
        >
          <Maximize2 className="w-4 h-4 text-white" />
        </div>

        <motion.div
          className="w-full h-full"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.4 }}
        >
          <ImageWithFallback
            src={artwork.image}
            alt={artwork.title}
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Gradient Overlay - igual ao site público */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />

        {/* Title - igual ao site público */}
        <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
          <motion.p
            className="text-purple-400 uppercase tracking-wide mb-1 text-xs md:text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            initial={{ y: 10 }}
            whileHover={{ y: 0 }}
          >
            {artwork.category}
          </motion.p>
          <h3 className="text-white drop-shadow-lg text-sm md:text-base">{artwork.title}</h3>
        </div>

        {/* Hover Details - ícone de zoom - igual ao site público */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileHover={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring" }}
            className="bg-white/20 backdrop-blur-sm rounded-full p-4"
          >
            <ZoomIn className="text-white" size={32} />
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default function GalleryPage() {
  const [artworks, setArtworks] = useState<GalleryArtwork[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingArtwork, setEditingArtwork] = useState<GalleryArtwork | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [splitPosition, setSplitPosition] = useState(60) // Porcentagem da largura para a seção de imagens
  const [isDragging, setIsDragging] = useState(false)
  const [orderedArtworks, setOrderedArtworks] = useState<GalleryArtwork[]>([])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const [formData, setFormData] = useState({
    title: '',
    category: CATEGORIES[0],
    image: '',
    description: '',
    gridClass: GRID_CLASSES[0].value,
    youtubeUrl: '',
  })
  const [newCategoryInput, setNewCategoryInput] = useState('')
  const [availableCategories, setAvailableCategories] = useState<string[]>(CATEGORIES)

  useEffect(() => {
    loadArtworks()
  }, [])

  async function loadArtworks() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/artworks?type=gallery')
      const data = await res.json()
      const loadedArtworks = data.data || []
      setArtworks(loadedArtworks)
      setOrderedArtworks(loadedArtworks)
      
      // Coletar categorias únicas das obras e adicionar às categorias disponíveis
      const artworkCategories = Array.from(
        new Set(loadedArtworks.map((a: GalleryArtwork) => a.category).filter(Boolean) as string[])
      )
      const allCategories = Array.from(new Set([...CATEGORIES, ...artworkCategories])) as string[]
      setAvailableCategories(allCategories)
    } catch (error) {
      console.error('Erro ao carregar artworks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const newOrdered = arrayMove(
        orderedArtworks,
        orderedArtworks.findIndex(item => item.id === active.id),
        orderedArtworks.findIndex(item => item.id === over.id)
      )
      
      // Atualizar estado local imediatamente
      setOrderedArtworks(newOrdered)
      
      // Salvar a nova ordem no banco de dados
      try {
        const itemsToUpdate = newOrdered.map((item, index) => ({
          id: item.id,
          order: index
        }))
        
        const res = await fetch('/api/artworks', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'gallery',
            items: itemsToUpdate
          })
        })
        
        if (res.ok) {
          // Atualizar também a lista principal
          setArtworks(newOrdered)
        } else {
          // Reverter em caso de erro
          setOrderedArtworks(orderedArtworks)
          console.error('Erro ao salvar ordem')
        }
      } catch (error) {
        console.error('Erro ao salvar ordem:', error)
        // Reverter em caso de erro
        setOrderedArtworks(orderedArtworks)
      }
    }
  }

  async function handleResize(id: number, newGridClass: string) {
    try {
      const res = await fetch('/api/artworks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'gallery',
          id,
          gridClass: newGridClass,
        })
      })

      if (res.ok) {
        const updatedArtwork = orderedArtworks.find(a => a.id === id)
        if (updatedArtwork) {
          updatedArtwork.gridClass = newGridClass
          setOrderedArtworks([...orderedArtworks])
          setArtworks(artworks.map(a => a.id === id ? { ...a, gridClass: newGridClass } : a))
        }
      }
    } catch (error) {
      console.error('Erro ao redimensionar:', error)
    }
  }

  function openCreateModal() {
    setEditingArtwork(null)
    setFormData({
      title: '',
      category: CATEGORIES[0],
      image: '',
      description: '',
      gridClass: GRID_CLASSES[0].value,
      youtubeUrl: '',
    })
    setNewCategoryInput('')
    setIsModalOpen(true)
  }

  function openEditModal(artwork: GalleryArtwork) {
    setEditingArtwork(artwork)
    setFormData({
      title: artwork.title,
      category: artwork.category,
      image: artwork.image,
      description: artwork.description,
      gridClass: artwork.gridClass,
      youtubeUrl: artwork.youtubeUrl || '',
    })
    setNewCategoryInput('')
    setIsModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    try {
      const url = '/api/artworks'
      const method = editingArtwork ? 'PUT' : 'POST'
      const body = editingArtwork
        ? { type: 'gallery', id: editingArtwork.id, ...formData }
        : { type: 'gallery', ...formData }

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
      loadArtworks()
    } catch {
      setMessage({ type: 'error', text: 'Erro ao salvar' })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Tem certeza que deseja deletar?')) return

    try {
      const res = await fetch(`/api/artworks?type=gallery&id=${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Deletado com sucesso!' })
        loadArtworks()
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro ao deletar' })
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    e.preventDefault()
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      
      const container = document.getElementById('gallery-container')
      if (!container) return
      
      const containerRect = container.getBoundingClientRect()
      const relativeX = e.clientX - containerRect.left
      const percentage = (relativeX / containerRect.width) * 100
      
      // Limitar entre 30% e 80%
      const clampedPercentage = Math.max(30, Math.min(80, percentage))
      setSplitPosition(clampedPercentage)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isDragging])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden" id="gallery-container">
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Galeria</h1>
          <p className="text-gray-400">Gerencie suas obras de arte</p>
        </div>
        
      </div>

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mx-6 mt-4 p-4 rounded-xl flex items-center gap-2 ${
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

      {/* Main Content Area - 3 Columns */}
      <div className="flex-1 flex overflow-hidden">
        {/* Images Section */}
        
        <div 
          className="overflow-y-auto p-6"
          style={{ width: `${splitPosition}%` }}
        >
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-6 py-3 font-semibold bg-gradient-to-r from-purple-600 via-pink-500 to-pink-600 text-white rounded-2xl shadow-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-pink-500/30 transform hover:-translate-y-1 hover:scale-105 active:scale-100 transition-all duration-200 border border-white/10"
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 shadow mr-2">
                <Plus className="w-5 h-5" />
              </span>
              <span className="tracking-wide text-base">Adicionar nova obra</span>
            </button>
            {/* (você pode adicionar outros controles ou filtros aqui futuramente) */}
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {artworks.map((artwork) => (
              <motion.div
                key={artwork.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/5 rounded-xl overflow-hidden border border-white/10 group aspect-square"
              >
                <div className="relative w-full h-full">
                  <img
                    src={artwork.image}
                    alt={artwork.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                    <span className="text-purple-400 text-[10px] uppercase mb-1">{artwork.category}</span>
                    <h3 className="text-white font-medium text-xs mb-2 line-clamp-1">{artwork.title}</h3>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(artwork)}
                        className="flex-1 px-2 py-1 bg-white/20 rounded text-white hover:bg-white/30 transition-colors text-[10px] flex items-center justify-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(artwork.id)}
                        className="px-2 py-1 bg-red-500/50 rounded text-white hover:bg-red-500/70 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
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

        {/* Resizer */}
        <div
          className={`w-1 bg-white/10 hover:bg-purple-500/50 cursor-col-resize transition-colors ${
            isDragging ? 'bg-purple-500' : ''
          }`}
          onMouseDown={handleMouseDown}
        />

        {/* Preview Section */}
        <div 
          className="flex flex-col bg-slate-800/30"
          style={{ width: `${100 - splitPosition}%` }}
        >
          <div className="p-4 border-b border-white/10 bg-slate-800/90 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-1">Preview da Disposição</h3>
            <p className="text-gray-400 text-xs">Arraste para reorganizar • Arraste o canto para redimensionar</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={orderedArtworks.map(a => a.id)}
              >
                {/* Grid exatamente igual ao site público */}
                <div 
                  className="grid grid-cols-2 md:grid-cols-4 auto-rows-[200px] gap-4"
                  style={{ gridAutoFlow: 'dense' }}
                >
                  {orderedArtworks.map((artwork) => (
                    <SortablePreviewItem
                      key={artwork.id}
                      artwork={artwork}
                      onResize={handleResize}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            
            {artworks.length === 0 && (
              <div className="text-center py-12">
                <Eye className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Adicione itens para ver o preview</p>
              </div>
            )}
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
              className="bg-slate-800 rounded-2xl p-5 w-full max-w-4xl border border-white/10 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold text-white mb-4">
                {editingArtwork ? 'Editar' : 'Adicionar'} Artwork
              </h2>

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Grid de 2 colunas para campos principais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 text-xs mb-1.5">Título</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-xs mb-1.5">Tamanho no Grid</label>
                    <div className="relative">
                      <select
                        value={formData.gridClass}
                        onChange={(e) => setFormData({ ...formData, gridClass: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 appearance-none"
                      >
                        {GRID_CLASSES.map((gc) => (
                          <option key={gc.value} value={gc.value} className="bg-slate-800">
                            {gc.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Categoria - Ocupa linha inteira */}
                <div>
                  <label className="block text-gray-300 text-xs mb-1.5">Categoria</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="relative md:col-span-2">
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 appearance-none"
                      >
                        {availableCategories.map((cat) => (
                          <option key={cat} value={cat} className="bg-slate-800">
                            {cat}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategoryInput}
                        onChange={(e) => setNewCategoryInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            if (newCategoryInput.trim() && !availableCategories.includes(newCategoryInput.trim().toLowerCase())) {
                              const newCat = newCategoryInput.trim().toLowerCase()
                              setAvailableCategories([...availableCategories, newCat])
                              setFormData({ ...formData, category: newCat })
                              setNewCategoryInput('')
                            }
                          }
                        }}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500"
                        placeholder="Nova categoria..."
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newCategoryInput.trim() && !availableCategories.includes(newCategoryInput.trim().toLowerCase())) {
                            const newCat = newCategoryInput.trim().toLowerCase()
                            setAvailableCategories([...availableCategories, newCat])
                            setFormData({ ...formData, category: newCat })
                            setNewCategoryInput('')
                          }
                        }}
                        className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs whitespace-nowrap"
                      >
                        Criar
                      </button>
                    </div>
                  </div>
                </div>

                {/* URL da Imagem - Ocupa linha inteira */}
                <div>
                  <label className="block text-gray-300 text-xs mb-1.5">URL da Imagem</label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                    placeholder="https://..."
                    required
                  />
                </div>

                {/* Grid de 2 colunas para Descrição e YouTube */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 text-xs mb-1.5">Descrição</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 resize-none"
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-xs mb-1.5">YouTube Timelapse</label>
                    <input
                      type="url"
                      value={formData.youtubeUrl}
                      onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                      placeholder="https://youtube.com/..."
                    />
                    <p className="text-gray-500 text-[10px] mt-1">Opcional</p>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-gray-300 rounded-lg hover:bg-white/10 transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
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

