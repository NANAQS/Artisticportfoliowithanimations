'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { User, Edit2, Save, X, Loader2, Plus, Trash2 } from 'lucide-react'

interface AboutConfig {
  id: number
  title: string
  subtitle: string
  description: string
  paragraph2: string | null
  image: string
  skills: Array<{
    icon: string
    title: string
    description: string
  }>
}

const AVAILABLE_ICONS = ['Palette', 'Code', 'Sparkles', 'Brush', 'Layers', 'Zap', 'Star', 'Heart']

export default function AboutPage() {
  const [aboutConfig, setAboutConfig] = useState<AboutConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    paragraph2: '',
    image: '',
    skills: [] as Array<{ icon: string; title: string; description: string }>,
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/about')
      const data = await res.json()
      setAboutConfig(data.about)
      setFormData({
        title: data.about.title || '',
        subtitle: data.about.subtitle || '',
        description: data.about.description || '',
        paragraph2: data.about.paragraph2 || '',
        image: data.about.image || '',
        skills: Array.isArray(data.about.skills) ? data.about.skills : [],
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
      const res = await fetch('/api/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          paragraph2: formData.paragraph2 || null,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setAboutConfig(data.about)
        setEditing(false)
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

  function handleAddSkill() {
    setFormData({
      ...formData,
      skills: [...formData.skills, { icon: 'Palette', title: '', description: '' }],
    })
  }

  function handleRemoveSkill(index: number) {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, i) => i !== index),
    })
  }

  function handleSkillChange(index: number, field: string, value: string) {
    setFormData({
      ...formData,
      skills: formData.skills.map((skill, i) =>
        i === index ? { ...skill, [field]: value } : skill
      ),
    })
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
        <h1 className="text-3xl font-bold text-white mb-2">Sobre Mim</h1>
        <p className="text-gray-400">Gerencie as informações da seção About Me</p>
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
            {message.type === 'success' ? <Save className="w-4 h-4" /> : <X className="w-4 h-4" />}
            {message.text}
            <button onClick={() => setMessage(null)} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <User className="w-5 h-5 text-purple-400" />
            Informações do About Me
          </h2>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Editar
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditing(false)
                  fetchData() // Recarregar dados originais
                }}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg text-white transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Salvar
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm mb-2">Subtítulo</label>
            {editing ? (
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                placeholder="About Me"
              />
            ) : (
              <div className="px-4 py-3 bg-white/5 rounded-lg text-white">
                {aboutConfig?.subtitle || 'Não definido'}
              </div>
            )}
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2">Título</label>
            {editing ? (
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                placeholder="Passion for Visual Storytelling"
              />
            ) : (
              <div className="px-4 py-3 bg-white/5 rounded-lg text-white">
                {aboutConfig?.title || 'Não definido'}
              </div>
            )}
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2">Descrição (Primeiro Parágrafo)</label>
            {editing ? (
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 resize-none"
                placeholder="Descrição principal..."
              />
            ) : (
              <div className="px-4 py-3 bg-white/5 rounded-lg text-white whitespace-pre-wrap">
                {aboutConfig?.description || 'Não definido'}
              </div>
            )}
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2">Descrição (Segundo Parágrafo - Opcional)</label>
            {editing ? (
              <textarea
                value={formData.paragraph2}
                onChange={(e) => setFormData({ ...formData, paragraph2: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 resize-none"
                placeholder="Segundo parágrafo (opcional)..."
              />
            ) : (
              <div className="px-4 py-3 bg-white/5 rounded-lg text-white whitespace-pre-wrap">
                {aboutConfig?.paragraph2 || 'Não definido'}
              </div>
            )}
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2">URL da Imagem</label>
            {editing ? (
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                placeholder="https://..."
              />
            ) : (
              <div className="px-4 py-3 bg-white/5 rounded-lg text-white truncate">
                {aboutConfig?.image || 'Não definido'}
              </div>
            )}
          </div>

          {/* Skills */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-gray-300 text-sm">Skills</label>
              {editing && (
                <button
                  onClick={handleAddSkill}
                  className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-300 text-sm flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Skill
                </button>
              )}
            </div>
            {editing ? (
              <div className="space-y-3">
                {formData.skills.map((skill, index) => (
                  <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Skill {index + 1}</span>
                      <button
                        onClick={() => handleRemoveSkill(index)}
                        className="p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-gray-400 text-xs mb-1">Ícone</label>
                        <select
                          value={skill.icon}
                          onChange={(e) => handleSkillChange(index, 'icon', e.target.value)}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                        >
                          {AVAILABLE_ICONS.map((icon) => (
                            <option key={icon} value={icon} className="bg-slate-800">
                              {icon}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-400 text-xs mb-1">Título</label>
                        <input
                          type="text"
                          value={skill.title}
                          onChange={(e) => handleSkillChange(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                          placeholder="Título"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-xs mb-1">Descrição</label>
                        <input
                          type="text"
                          value={skill.description}
                          onChange={(e) => handleSkillChange(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                          placeholder="Descrição"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {formData.skills.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    Nenhuma skill adicionada. Clique em "Adicionar Skill" para começar.
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {aboutConfig?.skills && Array.isArray(aboutConfig.skills) && aboutConfig.skills.length > 0 ? (
                  aboutConfig.skills.map((skill: any, index: number) => (
                    <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400">
                          <span className="text-xs font-medium">{skill.icon || 'Icon'}</span>
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{skill.title || 'Sem título'}</h3>
                          <p className="text-gray-400 text-sm">{skill.description || 'Sem descrição'}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm">Nenhuma skill definida</div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

