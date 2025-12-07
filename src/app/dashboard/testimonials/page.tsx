'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Plus, Trash2, Edit, Users, Loader2, Check, X, Star, ChevronDown
} from 'lucide-react'

interface Testimonial {
  id: number
  name: string
  role: string
  image: string
  text: string
  rating: number
  skillsHighlighted: string[]
}

interface Skill {
  id: number
  name: string
  level: number
  mentions: number
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingSkill, setIsSavingSkill] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [selectedSkills, setSelectedSkills] = useState<Array<{ name: string; level: number }>>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    image: '',
    text: '',
    rating: 5,
  })

  const [skillFormData, setSkillFormData] = useState({
    name: '',
  })

  useEffect(() => {
    loadTestimonials()
    loadSkills()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function loadTestimonials() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/testimonials?type=testimonials')
      const data = await res.json()
      setTestimonials(data.data || [])
    } catch (error) {
      console.error('Erro ao carregar depoimentos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function loadSkills() {
    try {
      const res = await fetch('/api/testimonials?type=skills')
      const data = await res.json()
      setSkills(data.data || [])
    } catch (error) {
      console.error('Erro ao carregar skills:', error)
    }
  }

  function openCreateModal() {
    setEditingTestimonial(null)
    setFormData({
      name: '',
      role: '',
      image: '',
      text: '',
      rating: 5,
    })
    setSelectedSkills([])
    setIsModalOpen(true)
  }

  function openEditModal(testimonial: Testimonial) {
    setEditingTestimonial(testimonial)
    setFormData({
      name: testimonial.name,
      role: testimonial.role,
      image: testimonial.image,
      text: testimonial.text,
      rating: testimonial.rating,
    })
    // Converter skillsHighlighted (string[]) para formato com nível
    // Buscar níveis atuais das skills
    const skillsWithLevel = testimonial.skillsHighlighted.map(skillName => {
      const skill = skills.find(s => s.name === skillName)
      return { name: skillName, level: skill?.level || 50 }
    })
    setSelectedSkills(skillsWithLevel)
    setIsModalOpen(true)
  }

  function toggleSkill(skillName: string) {
    setSelectedSkills(prev => {
      const exists = prev.find(s => s.name === skillName)
      if (exists) {
        return prev.filter(s => s.name !== skillName)
      } else {
        // Buscar nível atual da skill ou usar 50 como padrão
        const skill = skills.find(s => s.name === skillName)
        return [...prev, { name: skillName, level: skill?.level || 50 }]
      }
    })
  }

  function updateSkillLevel(skillName: string, level: number) {
    setSelectedSkills(prev =>
      prev.map(s => s.name === skillName ? { ...s, level } : s)
    )
  }

  async function handleCreateSkill(e: React.FormEvent) {
    e.preventDefault()
    setIsSavingSkill(true)
    setMessage(null)

    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'skills',
          name: skillFormData.name,
          // level e mentions serão calculados automaticamente
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error })
        return
      }

      const newSkillName = skillFormData.name
      setMessage({ type: 'success', text: 'Skill criada com sucesso! Defina o nível no depoimento.' })
      setIsSkillModalOpen(false)
      setSkillFormData({ name: '' })
      await loadSkills()
      
      // Adicionar a nova skill automaticamente aos selecionados com nível padrão
      setSelectedSkills(prev => [...prev, { name: newSkillName, level: 50 }])
    } catch {
      setMessage({ type: 'error', text: 'Erro ao criar skill' })
    } finally {
      setIsSavingSkill(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    try {
      if (selectedSkills.length === 0) {
        setMessage({ type: 'error', text: 'Selecione pelo menos uma skill' })
        setIsSaving(false)
        return
      }

      const url = '/api/testimonials'
      const method = editingTestimonial ? 'PUT' : 'POST'
      const body = editingTestimonial
        ? {
            type: 'testimonials',
            id: editingTestimonial.id,
            name: formData.name,
            role: formData.role,
            image: formData.image,
            text: formData.text,
            rating: formData.rating,
            skillsHighlighted: selectedSkills.map(s => s.name),
            skillLevels: selectedSkills.reduce((acc, s) => {
              acc[s.name] = s.level
              return acc
            }, {} as Record<string, number>),
          }
        : {
            type: 'testimonials',
            name: formData.name,
            role: formData.role,
            image: formData.image,
            text: formData.text,
            rating: formData.rating,
            skillsHighlighted: selectedSkills.map(s => s.name),
            skillLevels: selectedSkills.reduce((acc, s) => {
              acc[s.name] = s.level
              return acc
            }, {} as Record<string, number>),
          }

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

      setMessage({ type: 'success', text: editingTestimonial ? 'Atualizado com sucesso!' : 'Criado com sucesso!' })
      setIsModalOpen(false)
      await loadTestimonials()
      await loadSkills()
    } catch {
      setMessage({ type: 'error', text: 'Erro ao salvar' })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Tem certeza que deseja deletar?')) return

    try {
      const res = await fetch(`/api/testimonials?type=testimonials&id=${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Deletado com sucesso!' })
        loadTestimonials()
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
          <h1 className="text-3xl font-bold text-white mb-2">Depoimentos</h1>
          <p className="text-gray-400">Gerencie os depoimentos dos clientes</p>
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
        {testimonials.map((testimonial) => (
          <motion.div
            key={testimonial.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 group"
          >
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-white font-medium">{testimonial.name}</h3>
                  <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  <div className="flex gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-3 line-clamp-3">{testimonial.text}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {testimonial.skillsHighlighted.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-lg"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditModal(testimonial)}
                  className="flex-1 px-3 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(testimonial.id)}
                  className="px-3 py-2 bg-red-500/50 rounded-lg text-white hover:bg-red-500/70 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {testimonials.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Nenhum depoimento encontrado</p>
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
              className="bg-slate-800 rounded-2xl p-6 w-full max-w-lg border border-white/10 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-6">
                {editingTestimonial ? 'Editar' : 'Adicionar'} Depoimento
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
                  <label className="block text-gray-300 text-sm mb-2">Cargo</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

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
                  <label className="block text-gray-300 text-sm mb-2">Avaliação (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Texto do Depoimento</label>
                  <textarea
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 resize-none"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Skills Destacadas</label>
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 flex items-center justify-between"
                    >
                      <span className={selectedSkills.length > 0 ? 'text-white' : 'text-gray-500'}>
                        {selectedSkills.length > 0 
                          ? `${selectedSkills.length} skill(s) selecionada(s)`
                          : 'Selecione as skills'}
                      </span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isDropdownOpen && (
                      <div className="absolute z-10 w-full mt-2 bg-slate-800 border border-white/10 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                        <div className="p-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsSkillModalOpen(true)
                              setIsDropdownOpen(false)
                            }}
                            className="w-full px-3 py-2 text-left text-purple-400 hover:bg-white/5 rounded-lg flex items-center gap-2 text-sm"
                          >
                            <Plus className="w-4 h-4" />
                            Adicionar Nova Skill
                          </button>
                          <div className="border-t border-white/10 my-2" />
                          {skills.length === 0 ? (
                            <div className="px-3 py-2 text-gray-400 text-sm text-center">
                              Nenhuma skill disponível
                            </div>
                          ) : (
                            skills.map((skill) => (
                              <label
                                key={skill.id}
                                className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedSkills.some(s => s.name === skill.name)}
                                  onChange={() => toggleSkill(skill.name)}
                                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500"
                                />
                                <span className="text-white text-sm flex-1">{skill.name}</span>
                                <span className="text-gray-400 text-xs">{skill.mentions} menções</span>
                              </label>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {selectedSkills.length > 0 && (
                    <div className="space-y-3 mt-3">
                      {selectedSkills.map((skill) => (
                        <div
                          key={skill.name}
                          className="p-3 bg-white/5 border border-white/10 rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white text-sm font-medium">{skill.name}</span>
                            <button
                              type="button"
                              onClick={() => toggleSkill(skill.name)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div>
                            <label className="block text-gray-300 text-xs mb-1">
                              Nível: {skill.level}%
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={skill.level}
                              onChange={(e) => updateSkillLevel(skill.name, parseInt(e.target.value))}
                              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                              <span>0%</span>
                              <span>100%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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

      {/* Modal de Nova Skill */}
      <AnimatePresence>
        {isSkillModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsSkillModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-2xl p-6 w-full max-w-lg border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-6">Adicionar Nova Skill</h2>

              <form onSubmit={handleCreateSkill} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Nome da Skill</label>
                  <input
                    type="text"
                    value={skillFormData.name}
                    onChange={(e) => setSkillFormData({ ...skillFormData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                    placeholder="Ex: React, TypeScript, Design..."
                    required
                  />
                  <p className="mt-2 text-xs text-gray-400">
                    O nível e as menções serão calculados automaticamente baseado nos depoimentos.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsSkillModalOpen(false)}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingSkill}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSavingSkill ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      'Criar Skill'
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
