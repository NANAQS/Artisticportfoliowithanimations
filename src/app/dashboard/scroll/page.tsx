'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Plus, Trash2, Edit, Image, Loader2, Check, X
} from 'lucide-react'
import { ImageWithFallback } from '@/components/common/ImageWithFallback'

interface ScrollContent {
  id: number
  image: string
  title: string
  description: string
}

export default function ScrollPage() {
  const [contents, setContents] = useState<ScrollContent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingContent, setEditingContent] = useState<ScrollContent | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [previewIndex, setPreviewIndex] = useState(0)
  const [typingText, setTypingText] = useState('')
  const [isTypingComplete, setIsTypingComplete] = useState(false)
  const previewContainerRef = useRef<HTMLDivElement>(null)

  const [formData, setFormData] = useState({
    image: '',
    title: '',
    description: '',
  })

  useEffect(() => {
    loadContents()
  }, [])

  // Auto-advance preview
  useEffect(() => {
    if (contents.length === 0) return
    
    const interval = setInterval(() => {
      setPreviewIndex((prev) => (prev + 1) % contents.length)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [contents.length])

  // Typing effect for preview
  useEffect(() => {
    if (contents.length === 0) return
    
    const currentContent = contents[previewIndex]
    if (!currentContent) return
    
    setTypingText('')
    setIsTypingComplete(false)
    let currentChar = 0
    const fullText = currentContent.description

    const typingInterval = setInterval(() => {
      if (currentChar < fullText.length) {
        setTypingText(fullText.substring(0, currentChar + 1))
        currentChar++
      } else {
        setIsTypingComplete(true)
        clearInterval(typingInterval)
      }
    }, 20)

    return () => clearInterval(typingInterval)
  }, [previewIndex, contents])

  async function loadContents() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/artworks?type=scroll')
      const data = await res.json()
      setContents(data.data || [])
    } catch (error) {
      console.error('Erro ao carregar conteúdos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function openCreateModal() {
    setEditingContent(null)
    setFormData({ image: '', title: '', description: '' })
    setIsModalOpen(true)
  }

  function openEditModal(content: ScrollContent) {
    setEditingContent(content)
    setFormData({
      image: content.image,
      title: content.title,
      description: content.description,
    })
    setIsModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    try {
      const url = '/api/artworks'
      const method = editingContent ? 'PUT' : 'POST'
      const body = editingContent
        ? { type: 'scroll', id: editingContent.id, ...formData }
        : { type: 'scroll', ...formData }

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

      setMessage({ type: 'success', text: editingContent ? 'Atualizado com sucesso!' : 'Criado com sucesso!' })
      setIsModalOpen(false)
      loadContents()
    } catch {
      setMessage({ type: 'error', text: 'Erro ao salvar' })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Tem certeza que deseja deletar?')) return

    try {
      const res = await fetch(`/api/artworks?type=scroll&id=${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Deletado com sucesso!' })
        loadContents()
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

  const currentPreviewContent = contents[previewIndex]

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex justify-between items-center flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Scroll</h1>
          <p className="text-gray-400">Gerencie o conteúdo da seção scroll</p>
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
      <div className="flex-1 flex overflow-hidden">
        {/* Área de Edição (Esquerda) - 50% */}
        <div className="w-1/2 overflow-y-auto p-6 border-r border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contents.map((content) => (
              <motion.div
                key={content.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 group"
              >
                <div className="relative h-32">
                  <img
                    src={content.image}
                    alt={content.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-2 gap-2">
                    <button
                      onClick={() => openEditModal(content)}
                      className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(content.id)}
                      className="w-7 h-7 bg-red-500/50 rounded-lg flex items-center justify-center text-white hover:bg-red-500/70 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-white font-medium text-sm mb-1 line-clamp-1">{content.title}</h3>
                  <p className="text-gray-400 text-xs line-clamp-2">{content.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {contents.length === 0 && (
            <div className="text-center py-12">
              <Image className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Nenhum item encontrado</p>
            </div>
          )}
        </div>

        {/* Preview (Direita) - 50% */}
        <div className="w-1/2 overflow-hidden bg-black relative">
          {contents.length > 0 && currentPreviewContent ? (
            <div ref={previewContainerRef} className="h-full flex items-center px-6 bg-gradient-to-b from-black via-zinc-950 to-black">
              <div className="w-full">
                <div className="grid md:grid-cols-1 gap-8 items-center">
                  {/* Image */}
                  <div className="relative h-[300px] overflow-hidden rounded-2xl">
                    <AnimatePresence initial={false}>
                      <motion.div
                        key={previewIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-0"
                      >
                        <ImageWithFallback
                          src={currentPreviewContent.image}
                          alt={currentPreviewContent.title}
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      </motion.div>
                    </AnimatePresence>

                    {/* Progress indicators */}
                    <div className="absolute bottom-4 left-4 flex gap-2 z-10">
                      {contents.map((_, index) => (
                        <motion.div
                          key={index}
                          className={`h-1 rounded-full transition-all duration-500 ${
                            index === previewIndex ? 'w-8 bg-white' : 'w-4 bg-white/30'
                          }`}
                          initial={{ scale: 0.8 }}
                          animate={{ scale: index === previewIndex ? 1 : 0.8 }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Text */}
                  <div className="space-y-4">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={previewIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                      >
                        <h2 className="text-white text-2xl mb-4">
                          {currentPreviewContent.title}
                        </h2>
                      </motion.div>
                    </AnimatePresence>

                    <div className="text-gray-300 text-sm leading-relaxed min-h-[80px]">
                      <span className="inline-block">
                        {typingText}
                        {!isTypingComplete && (
                          <motion.span
                            className="inline-block w-[2px] h-4 bg-purple-500 ml-1"
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                          />
                        )}
                      </span>
                    </div>

                    {/* Progress indicator */}
                    <motion.div
                      className="flex items-center gap-3 pt-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-purple-500"
                          initial={{ width: '0%' }}
                          animate={{
                            width: `${((previewIndex + 1) / contents.length) * 100}%`,
                          }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      <span className="text-gray-500 text-xs">
                        {previewIndex + 1} / {contents.length}
                      </span>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Image className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Adicione conteúdo para ver o preview</p>
              </div>
            </div>
          )}
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
                {editingContent ? 'Editar' : 'Adicionar'} Conteúdo
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">URL da Imagem</label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                    placeholder="https://..."
                    required
                  />
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
                  <label className="block text-gray-300 text-sm mb-2">Descrição</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 resize-none"
                    rows={4}
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
                    disabled={isSaving}
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
