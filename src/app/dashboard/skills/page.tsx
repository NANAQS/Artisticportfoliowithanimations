'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Trash2, Star, Loader2, Check, X
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
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

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
          <p className="text-gray-400">Visualize e gerencie suas habilidades. Para editar níveis, use a página de Depoimentos.</p>
        </div>
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
                onClick={() => handleDelete(skill.id)}
                className="w-full px-3 py-2 bg-red-500/50 rounded-lg text-white hover:bg-red-500/70 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Deletar
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

    </div>
  )
}
