'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Sparkles, Loader2, Check, X, Plus, Trash2 } from 'lucide-react'

interface ArtProcessConfig {
  id?: number
  subtitle: string
  title: string
  description: string
  steps: Array<{ icon: string; title: string; description: string }>
  ctaText: string
}

const AVAILABLE_ICONS = ['Lightbulb', 'Pencil', 'Palette', 'Sparkles', 'Brush', 'Layers', 'Zap', 'Star', 'Heart', 'Code', 'Camera', 'PenTool']

export default function ArtProcessPage() {
  const [config, setConfig] = useState<ArtProcessConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [formData, setFormData] = useState<ArtProcessConfig>({
    subtitle: '',
    title: '',
    description: '',
    steps: [],
    ctaText: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/art-process')
      const data = await res.json()
      setConfig(data)
      setFormData({
        subtitle: data.subtitle || '',
        title: data.title || '',
        description: data.description || '',
        steps: Array.isArray(data.steps) ? data.steps : [],
        ctaText: data.ctaText || '',
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
      const res = await fetch('/api/art-process', {
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

  function handleAddStep() {
    setFormData({
      ...formData,
      steps: [...formData.steps, { icon: 'Palette', title: '', description: '' }],
    })
  }

  function handleRemoveStep(index: number) {
    setFormData({
      ...formData,
      steps: formData.steps.filter((_, i) => i !== index),
    })
  }

  function handleStepChange(index: number, field: 'icon' | 'title' | 'description', value: string) {
    const newSteps = [...formData.steps]
    newSteps[index] = { ...newSteps[index], [field]: value }
    setFormData({ ...formData, steps: newSteps })
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
          <h1 className="text-3xl font-bold text-white mb-2">Art Process</h1>
          <p className="text-gray-400">Edite o conteúdo da seção de processo</p>
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
            placeholder="My Process"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm mb-2">Título</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
            placeholder="From Idea to Artwork"
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm mb-2">Descrição</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 min-h-[100px]"
            placeholder="Every piece I create follows a thoughtful journey from initial concept to final masterpiece"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-gray-300 text-sm">Passos do Processo</label>
            <button
              onClick={handleAddStep}
              className="flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          </div>
          <div className="space-y-4">
            {formData.steps.map((step, index) => (
              <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-purple-400 text-sm font-medium">Passo {index + 1}</span>
                  <button
                    onClick={() => handleRemoveStep(index)}
                    className="p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <label className="block text-gray-300 text-xs mb-1">Ícone</label>
                  <select
                    value={step.icon}
                    onChange={(e) => handleStepChange(index, 'icon', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    {AVAILABLE_ICONS.map((icon) => (
                      <option key={icon} value={icon} className="bg-slate-800">
                        {icon}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 text-xs mb-1">Título</label>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => handleStepChange(index, 'title', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                    placeholder="Concept"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-xs mb-1">Descrição</label>
                  <textarea
                    value={step.description}
                    onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500 min-h-[60px]"
                    placeholder="Every piece starts with inspiration and careful planning"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-gray-300 text-sm mb-2">Texto do CTA</label>
          <input
            type="text"
            value={formData.ctaText}
            onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
            placeholder="Start Your Commission"
          />
        </div>
      </div>
    </div>
  )
}


