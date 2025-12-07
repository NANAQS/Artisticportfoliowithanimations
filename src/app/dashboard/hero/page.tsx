'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Sparkles, Loader2, Check, X, Plus, Trash2 } from 'lucide-react'

interface HeroConfig {
  id?: number
  subtitle: string
  title: string
  titleHighlight: string
  description: string
  stats: Array<{ number: string; label: string }>
  button1Text: string
  button2Text: string
}

export default function HeroPage() {
  const [config, setConfig] = useState<HeroConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [formData, setFormData] = useState<HeroConfig>({
    subtitle: '',
    title: '',
    titleHighlight: '',
    description: '',
    stats: [],
    button1Text: '',
    button2Text: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/hero')
      const data = await res.json()
      setConfig(data)
      setFormData({
        subtitle: data.subtitle || '',
        title: data.title || '',
        titleHighlight: data.titleHighlight || '',
        description: data.description || '',
        stats: Array.isArray(data.stats) ? data.stats : [],
        button1Text: data.button1Text || '',
        button2Text: data.button2Text || '',
      })
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
      setMessage({ type: 'error', text: 'Erro ao carregar dados' })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSave() {
    setIsSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/hero', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const data = await res.json()
        setConfig(data.data)
        setMessage({ type: 'success', text: 'Salvo com sucesso!' })
        setTimeout(() => setMessage(null), 3000)
      } else {
        const error = await res.json()
        setMessage({ type: 'error', text: error.error || 'Erro ao salvar' })
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      setMessage({ type: 'error', text: 'Erro ao salvar' })
    } finally {
      setIsSaving(false)
    }
  }

  function handleAddStat() {
    setFormData({
      ...formData,
      stats: [...formData.stats, { number: '', label: '' }],
    })
  }

  function handleRemoveStat(index: number) {
    setFormData({
      ...formData,
      stats: formData.stats.filter((_, i) => i !== index),
    })
  }

  function handleStatChange(index: number, field: 'number' | 'label', value: string) {
    const newStats = [...formData.stats]
    newStats[index] = { ...newStats[index], [field]: value }
    setFormData({ ...formData, stats: newStats })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Hero Section</h1>
          <p className="text-gray-400">Edite o conteúdo da seção principal</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Salvar
            </>
          )}
        </button>
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

      <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-6">
        <div>
          <label className="block text-gray-300 text-sm mb-2">Subtítulo</label>
          <input
            type="text"
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
            placeholder="2D Artist & Illustrator"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm mb-2">Título Principal</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
            placeholder="Bringing Stories to Life"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm mb-2">Título Destacado</label>
          <input
            type="text"
            value={formData.titleHighlight}
            onChange={(e) => setFormData({ ...formData, titleHighlight: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
            placeholder="Through Art"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm mb-2">Descrição</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 min-h-[100px]"
            placeholder="Creating vibrant illustrations, character designs, and digital paintings that capture emotion and imagination"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-gray-300 text-sm">Estatísticas</label>
            <button
              onClick={handleAddStat}
              className="flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          </div>
          <div className="space-y-3">
            {formData.stats.map((stat, index) => (
              <div key={index} className="flex gap-3 items-center">
                <input
                  type="text"
                  value={stat.number}
                  onChange={(e) => handleStatChange(index, 'number', e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  placeholder="500+"
                />
                <input
                  type="text"
                  value={stat.label}
                  onChange={(e) => handleStatChange(index, 'label', e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  placeholder="Artworks"
                />
                <button
                  onClick={() => handleRemoveStat(index)}
                  className="p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 text-sm mb-2">Texto Botão 1</label>
            <input
              type="text"
              value={formData.button1Text}
              onChange={(e) => setFormData({ ...formData, button1Text: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              placeholder="View Gallery"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-2">Texto Botão 2</label>
            <input
              type="text"
              value={formData.button2Text}
              onChange={(e) => setFormData({ ...formData, button2Text: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              placeholder="Commission Work"
            />
          </div>
        </div>
      </div>
    </div>
  )
}


