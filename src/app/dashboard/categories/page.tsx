'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Loader2, Check, X, Plus, Pencil, Trash2 } from 'lucide-react'

interface Category {
  id: number
  name: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      setCategories(data.data || [])
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreate() {
    const name = newName.trim()
    if (!name) return

    setIsSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Erro ao criar categoria' })
        return
      }
      setCategories((prev) => [...prev, data.data].sort((a, b) => a.name.localeCompare(b.name)))
      setNewName('')
      setMessage({ type: 'success', text: 'Categoria criada com sucesso!' })
    } catch (error) {
      console.error('Erro ao criar categoria:', error)
      setMessage({ type: 'error', text: 'Erro ao criar categoria' })
    } finally {
      setIsSaving(false)
    }
  }

  function startEdit(category: Category) {
    setEditingId(category.id)
    setEditingName(category.name)
  }

  async function handleUpdate() {
    if (!editingId) return
    const name = editingName.trim()
    if (!name) return

    setIsSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, name }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Erro ao atualizar categoria' })
        return
      }
      setCategories((prev) =>
        prev.map((category) => (category.id === editingId ? data.data : category))
          .sort((a, b) => a.name.localeCompare(b.name))
      )
      setEditingId(null)
      setEditingName('')
      setMessage({ type: 'success', text: 'Categoria atualizada!' })
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error)
      setMessage({ type: 'error', text: 'Erro ao atualizar categoria' })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Tem certeza que deseja deletar?')) return

    setIsSaving(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/categories?id=${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Erro ao deletar categoria' })
        return
      }
      setCategories((prev) => prev.filter((category) => category.id !== id))
      setMessage({ type: 'success', text: 'Categoria deletada!' })
    } catch (error) {
      console.error('Erro ao deletar categoria:', error)
      setMessage({ type: 'error', text: 'Erro ao deletar categoria' })
    } finally {
      setIsSaving(false)
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
          <h1 className="text-3xl font-bold text-white mb-2">Categorias</h1>
          <p className="text-gray-400">Crie e organize as categorias usadas em obras.</p>
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

      <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4">
        <h2 className="text-white font-semibold">Nova categoria</h2>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
            placeholder="Nome da categoria"
          />
          <button
            onClick={handleCreate}
            disabled={isSaving || !newName.trim()}
            className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Criar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 rounded-2xl p-6 border border-white/10 flex flex-col gap-4"
          >
            {editingId === category.id ? (
              <>
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdate}
                    disabled={isSaving || !editingName.trim()}
                    className="flex-1 px-3 py-2 bg-green-500/30 text-green-200 rounded-lg hover:bg-green-500/40 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    Salvar
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null)
                      setEditingName('')
                    }}
                    className="flex-1 px-3 py-2 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h3 className="text-white font-medium">{category.name}</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(category)}
                    className="flex-1 px-3 py-2 bg-white/10 text-gray-200 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <Pencil className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="flex-1 px-3 py-2 bg-red-500/30 text-red-200 rounded-lg hover:bg-red-500/40 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </button>
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">Nenhuma categoria encontrada.</p>
        </div>
      )}
    </div>
  )
}
