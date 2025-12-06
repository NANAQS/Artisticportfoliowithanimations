'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Trash2, Edit2, Save, X, Loader2, Check, Eye, EyeOff, ArrowUp, ArrowDown, Image as ImageIcon } from 'lucide-react'

interface AdBanner {
  id: number
  imageUrl: string
  href: string | null
  position: 'before' | 'after'
  targetElement: string
  order: number
  isActive: boolean
}

const TARGET_ELEMENTS = [
  { value: 'hero', label: 'Hero' },
  { value: 'carousel', label: 'Carrossel' },
  { value: 'about', label: 'Sobre Mim' },
  { value: 'scroll', label: 'Scroll' },
  { value: 'gallery', label: 'Galeria' },
  { value: 'art-process', label: 'Processo Artístico' },
  { value: 'skills', label: 'Skills' },
  { value: 'contact', label: 'Contato' },
]

export default function AdBannersPage() {
  const [banners, setBanners] = useState<AdBanner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<AdBanner | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [formData, setFormData] = useState({
    imageUrl: '',
    href: '',
    position: 'before' as 'before' | 'after',
    targetElement: 'hero',
    order: 0,
    isActive: true,
  })

  useEffect(() => {
    loadBanners()
  }, [])

  async function loadBanners() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/ad-banners')
      const data = await res.json()
      setBanners(data.banners || [])
    } catch (error) {
      console.error('Erro ao carregar anúncios:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function openCreateModal() {
    setEditingBanner(null)
    setFormData({
      imageUrl: '',
      href: '',
      position: 'before',
      targetElement: 'hero',
      order: 0,
      isActive: true,
    })
    setIsModalOpen(true)
  }

  function openEditModal(banner: AdBanner) {
    setEditingBanner(banner)
    setFormData({
      imageUrl: banner.imageUrl,
      href: banner.href || '',
      position: banner.position,
      targetElement: banner.targetElement,
      order: banner.order,
      isActive: banner.isActive,
    })
    setIsModalOpen(true)
  }

  async function handleSave() {
    setIsSaving(true)
    setMessage(null)

    try {
      const url = editingBanner ? '/api/ad-banners' : '/api/ad-banners'
      const method = editingBanner ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingBanner
          ? { id: editingBanner.id, ...formData }
          : formData
        ),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Erro ao salvar' })
        return
      }

      setMessage({ type: 'success', text: editingBanner ? 'Atualizado com sucesso!' : 'Criado com sucesso!' })
      await loadBanners()
      setIsModalOpen(false)
    } catch (error) {
      console.error('Erro ao salvar:', error)
      setMessage({ type: 'error', text: 'Erro ao salvar' })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Tem certeza que deseja deletar este anúncio?')) return

    try {
      const res = await fetch(`/api/ad-banners?id=${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Deletado com sucesso!' })
        loadBanners()
      }
    } catch (error) {
      console.error('Erro ao deletar:', error)
      setMessage({ type: 'error', text: 'Erro ao deletar' })
    }
  }

  async function handleToggleActive(id: number, currentStatus: boolean) {
    try {
      const banner = banners.find(b => b.id === id)
      if (!banner) return

      const res = await fetch('/api/ad-banners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          isActive: !currentStatus
        })
      })

      if (res.ok) {
        await loadBanners()
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-8 overflow-y-auto h-full">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Anúncios</h1>
        <p className="text-gray-400">Gerencie os banners de anúncios do site</p>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-xl flex items-center gap-2 ${
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

      <div className="flex justify-end mb-6">
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all"
        >
          <Plus className="w-4 h-4" />
          Adicionar Anúncio
        </button>
      </div>

      <div className="space-y-4">
        {banners.map((banner) => (
          <motion.div
            key={banner.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-start gap-6">
              {/* Preview da Imagem */}
              <div className="flex-shrink-0">
                <div className="w-48 h-32 bg-slate-900 rounded-lg overflow-hidden border border-white/10">
                  <img
                    src={banner.imageUrl}
                    alt="Banner preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="100"%3E%3Crect fill="%23334155" width="200" height="100"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="14"%3EImagem não encontrada%3C/text%3E%3C/svg%3E'
                    }}
                  />
                </div>
              </div>

              {/* Informações */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-white font-medium">
                        {TARGET_ELEMENTS.find(e => e.value === banner.targetElement)?.label || banner.targetElement}
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        banner.isActive 
                          ? 'bg-green-500/20 text-green-300' 
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {banner.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs bg-purple-500/20 text-purple-300">
                        {banner.position === 'before' ? 'Antes' : 'Depois'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 space-y-1">
                      <p>URL da Imagem: <span className="text-gray-300 text-xs break-all">{banner.imageUrl}</span></p>
                      {banner.href && (
                        <p>Link: <span className="text-gray-300 text-xs break-all">{banner.href}</span></p>
                      )}
                      <p>Ordem: {banner.order}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(banner.id, banner.isActive)}
                      className={`p-2 rounded-lg transition-colors ${
                        banner.isActive
                          ? 'bg-green-500/20 hover:bg-green-500/30 text-green-300'
                          : 'bg-gray-500/20 hover:bg-gray-500/30 text-gray-400'
                      }`}
                      title={banner.isActive ? 'Desativar' : 'Ativar'}
                    >
                      {banner.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => openEditModal(banner)}
                      className="p-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-300 transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300 transition-colors"
                      title="Deletar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {banners.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Nenhum anúncio criado</p>
        </div>
      )}

      {/* Modal de Edição/Criação */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/10"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {editingBanner ? 'Editar Anúncio' : 'Novo Anúncio'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    URL da Imagem *
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                  {formData.imageUrl && (
                    <div className="mt-3 w-full h-48 bg-slate-900 rounded-lg overflow-hidden border border-white/10">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200"%3E%3Crect fill="%23334155" width="400" height="200"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImagem não encontrada%3C/text%3E%3C/svg%3E'
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Link (Href) - Opcional
                  </label>
                  <input
                    type="url"
                    value={formData.href}
                    onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="https://exemplo.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Elemento Alvo *
                    </label>
                    <select
                      value={formData.targetElement}
                      onChange={(e) => setFormData({ ...formData, targetElement: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      {TARGET_ELEMENTS.map((el) => (
                        <option key={el.value} value={el.value}>
                          {el.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Posição *
                    </label>
                    <select
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value as 'before' | 'after' })}
                      className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="before">Antes</option>
                      <option value="after">Depois</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ordem
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    min="0"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded bg-slate-900 border-white/10 text-purple-500 focus:ring-purple-500"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-300 cursor-pointer">
                    Ativo
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !formData.imageUrl}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Salvar
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}




