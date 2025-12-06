'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Plus, Trash2, Edit, Star, Loader2, Check, X
} from 'lucide-react'

interface Skill {
  id: number
  name: string
  level: number
  mentions: number
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    level: 50,
    mentions: 0,
  })

  useEffect(() => {
    loadSkills()
  }, [])

  async function loadSkills() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/testimonials?type=skills')
      const data = await res.json()
      setSkills(data.data || [])
    } catch (error) {
      console.error('Erro ao carregar skills:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function openCreateModal() {
    setEditingSkill(null)
    setFormData({ name: '', level: 50, mentions: 0 })
    setIsModalOpen(true)
  }

  function openEditModal(skill: Skill) {
    setEditingSkill(skill)
    setFormData({
      name: skill.name,
      level: skill.level,
      mentions: skill.mentions,
    })
    setIsModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    try {
      const url = '/api/testimonials'
      const method = editingSkill ? 'PUT' : 'POST'
      const body = editingSkill
        ? { type: 'skills', id: editingSkill.id, ...formData }
        : { type: 'skills', ...formData }

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

      setMessage({ type: 'success', text: editingSkill ? 'Atualizado com sucesso!' : 'Criado com sucesso!' })
      setIsModalOpen(false)
      loadSkills()
    } catch {
      setMessage({ type: 'error', text: 'Erro ao salvar' })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Tem certeza que deseja deletar?')) return

    try {
      const res = await fetch(`/api/testimonials?type=skills&id=${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Deletado com sucesso!' })
        loadSkills()
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Skills</h1>
          <p className="text-gray-400">Gerencie suas habilidades</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill) => (
          <motion.div
            key={skill.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 rounded-2xl p-6 border border-white/10 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-medium">{skill.name}</h3>
                  <p className="text-gray-400 text-sm">{skill.mentions} menções</p>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Nível</span>
                <span className="text-white font-medium">{skill.level}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                  style={{ width: `${skill.level}%` }}
                />
              </div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => openEditModal(skill)}
                className="flex-1 px-3 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Editar
              </button>
              <button
                onClick={() => handleDelete(skill.id)}
                className="px-3 py-2 bg-red-500/50 rounded-lg text-white hover:bg-red-500/70 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {skills.length === 0 && (
        <div className="text-center py-12">
          <Star className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Nenhuma skill encontrada</p>
        </div>
      )}

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
                {editingSkill ? 'Editar' : 'Adicionar'} Skill
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Nome</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Nível (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Menções</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.mentions}
                    onChange={(e) => setFormData({ ...formData, mentions: parseInt(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
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
