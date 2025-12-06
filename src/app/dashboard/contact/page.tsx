'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Mail, Phone, MapPin, Plus, Trash2, Edit2, Save, X, Link2, Twitter, Linkedin, Github, Dribbble, Instagram, Facebook, Youtube, ExternalLink } from 'lucide-react'
import { Loader2 } from 'lucide-react'

interface ContactConfig {
  id: number
  email: string
  phone: string | null
  location: string | null
}

interface SocialLink {
  id: number
  name: string
  url: string
  icon: string | null
  order: number
}

const SOCIAL_ICONS = [
  'Twitter', 'LinkedIn', 'GitHub', 'Dribbble', 'Instagram', 
  'Facebook', 'YouTube', 'TikTok'
]

// Helper para obter o ícone baseado no nome da rede social
function getSocialIcon(iconName: string | null, name: string, url: string) {
  const normalizedName = name.toLowerCase().trim()
  const normalizedIcon = iconName?.toLowerCase().trim() || ''
  
  const iconMap: Record<string, React.ReactNode> = {
    twitter: <Twitter className="w-5 h-5" />,
    'x.com': <Twitter className="w-5 h-5" />,
    linkedin: <Linkedin className="w-5 h-5" />,
    github: <Github className="w-5 h-5" />,
    dribbble: <Dribbble className="w-5 h-5" />,
    instagram: <Instagram className="w-5 h-5" />,
    facebook: <Facebook className="w-5 h-5" />,
    youtube: <Youtube className="w-5 h-5" />,
  }

  if (normalizedIcon && iconMap[normalizedIcon]) {
    return iconMap[normalizedIcon]
  }

  if (iconMap[normalizedName]) {
    return iconMap[normalizedName]
  }

  const urlLower = url.toLowerCase()
  if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
    return <Twitter className="w-5 h-5" />
  }
  if (urlLower.includes('linkedin.com')) {
    return <Linkedin className="w-5 h-5" />
  }
  if (urlLower.includes('github.com')) {
    return <Github className="w-5 h-5" />
  }
  if (urlLower.includes('dribbble.com')) {
    return <Dribbble className="w-5 h-5" />
  }
  if (urlLower.includes('instagram.com')) {
    return <Instagram className="w-5 h-5" />
  }
  if (urlLower.includes('facebook.com')) {
    return <Facebook className="w-5 h-5" />
  }
  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
    return <Youtube className="w-5 h-5" />
  }

  return <ExternalLink className="w-5 h-5" />
}

export default function ContactPage() {
  const [contactConfig, setContactConfig] = useState<ContactConfig | null>(null)
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingContact, setEditingContact] = useState(false)
  const [editingSocial, setEditingSocial] = useState<number | null>(null)
  const [newSocial, setNewSocial] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    location: '',
  })

  const [socialForm, setSocialForm] = useState({
    name: '',
    url: '',
    icon: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const res = await fetch('/api/contact')
      const data = await res.json()
      
      setContactConfig(data.contact)
      setSocialLinks(data.socialLinks || [])
      setFormData({
        email: data.contact?.email || '',
        phone: data.contact?.phone || '',
        location: data.contact?.location || '',
      })
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSaveContact() {
    setIsSaving(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const data = await res.json()
        setContactConfig(data.contact)
        setEditingContact(false)
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleSaveSocial() {
    setIsSaving(true)
    try {
      if (editingSocial) {
        // Atualizar
        const res = await fetch('/api/social-links', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingSocial,
            ...socialForm,
          }),
        })

        if (res.ok) {
          await fetchData()
          setEditingSocial(null)
          setSocialForm({ name: '', url: '', icon: '' })
        }
      } else {
        // Criar
        const res = await fetch('/api/social-links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...socialForm,
            order: socialLinks.length,
          }),
        })

        if (res.ok) {
          await fetchData()
          setNewSocial(false)
          setSocialForm({ name: '', url: '', icon: '' })
        }
      }
    } catch (error) {
      console.error('Erro ao salvar rede social:', error)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteSocial(id: number) {
    if (!confirm('Tem certeza que deseja deletar esta rede social?')) return

    try {
      const res = await fetch(`/api/social-links?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error('Erro ao deletar:', error)
    }
  }

  // Função para detectar automaticamente o ícone baseado no nome
  function detectIconFromName(name: string): string {
    const normalizedName = name.toLowerCase().trim()
    const iconMap: Record<string, string> = {
      twitter: 'Twitter',
      'x.com': 'Twitter',
      linkedin: 'LinkedIn',
      github: 'GitHub',
      dribbble: 'Dribbble',
      instagram: 'Instagram',
      facebook: 'Facebook',
      youtube: 'YouTube',
      tiktok: 'TikTok',
    }
    return iconMap[normalizedName] || ''
  }

  // Função para detectar automaticamente o ícone baseado na URL
  function detectIconFromUrl(url: string): string {
    const urlLower = url.toLowerCase()
    if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) return 'Twitter'
    if (urlLower.includes('linkedin.com')) return 'LinkedIn'
    if (urlLower.includes('github.com')) return 'GitHub'
    if (urlLower.includes('dribbble.com')) return 'Dribbble'
    if (urlLower.includes('instagram.com')) return 'Instagram'
    if (urlLower.includes('facebook.com')) return 'Facebook'
    if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) return 'YouTube'
    if (urlLower.includes('tiktok.com')) return 'TikTok'
    return ''
  }

  function startEditSocial(social: SocialLink) {
    setEditingSocial(social.id)
    // Se não tiver ícone, tentar detectar automaticamente
    const detectedIcon = social.icon || detectIconFromName(social.name) || detectIconFromUrl(social.url)
    setSocialForm({
      name: social.name,
      url: social.url,
      icon: detectedIcon,
    })
    setNewSocial(false)
  }

  function startNewSocial() {
    setNewSocial(true)
    setEditingSocial(null)
    setSocialForm({ name: '', url: '', icon: '' })
  }

  // Handler para quando o nome muda - detectar ícone automaticamente
  function handleNameChange(name: string) {
    const detectedIcon = detectIconFromName(name) || detectIconFromUrl(socialForm.url)
    setSocialForm({ ...socialForm, name, icon: detectedIcon || socialForm.icon })
  }

  // Handler para quando a URL muda - detectar ícone automaticamente
  function handleUrlChange(url: string) {
    const detectedIcon = detectIconFromUrl(url) || detectIconFromName(socialForm.name)
    setSocialForm({ ...socialForm, url, icon: detectedIcon || socialForm.icon })
  }

  function cancelEdit() {
    setEditingContact(false)
    setEditingSocial(null)
    setNewSocial(false)
    setSocialForm({ name: '', url: '', icon: '' })
    if (contactConfig) {
      setFormData({
        email: contactConfig.email,
        phone: contactConfig.phone || '',
        location: contactConfig.location || '',
      })
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
        <h1 className="text-3xl font-bold text-white mb-2">Configurações de Contato</h1>
        <p className="text-gray-400">Gerencie suas informações de contato e redes sociais</p>
      </div>

      {/* Informações de Contato */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <Mail className="w-5 h-5 text-purple-400" />
            Informações de Contato
          </h2>
          {!editingContact ? (
            <button
              onClick={() => setEditingContact(true)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Editar
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={cancelEdit}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={handleSaveContact}
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
            <label className="block text-gray-300 text-sm mb-2">Email</label>
            {editingContact ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                placeholder="seu@email.com"
              />
            ) : (
              <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-lg">
                <Mail className="w-5 h-5 text-purple-400" />
                <a
                  href={`mailto:${contactConfig?.email}`}
                  className="text-white hover:text-purple-400 transition-colors"
                >
                  {contactConfig?.email}
                </a>
              </div>
            )}
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2">Telefone</label>
            {editingContact ? (
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                placeholder="+1 (555) 123-4567"
              />
            ) : (
              <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-lg">
                <Phone className="w-5 h-5 text-purple-400" />
                <span className="text-white">{contactConfig?.phone || 'Não informado'}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2">Localização</label>
            {editingContact ? (
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                placeholder="Cidade, Estado"
              />
            ) : (
              <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-lg">
                <MapPin className="w-5 h-5 text-purple-400" />
                <span className="text-white">{contactConfig?.location || 'Não informado'}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Redes Sociais */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <Link2 className="w-5 h-5 text-purple-400" />
            Redes Sociais
          </h2>
          {!newSocial && (
            <button
              onClick={startNewSocial}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg text-white transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          )}
        </div>

        <div className="space-y-3">
          {socialLinks.map((social) => (
            <div
              key={social.id}
              className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10"
            >
              {editingSocial === social.id ? (
                <>
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={socialForm.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                      placeholder="Nome"
                    />
                    <input
                      type="url"
                      value={socialForm.url}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                      placeholder="URL"
                    />
                    <select
                      value={socialForm.icon}
                      onChange={(e) => setSocialForm({ ...socialForm, icon: e.target.value })}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                    >
                      <option value="">Sem ícone</option>
                      {SOCIAL_ICONS.map((icon) => (
                        <option key={icon} value={icon} className="bg-slate-800">
                          {icon}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={cancelEdit}
                      className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleSaveSocial}
                      disabled={isSaving}
                      className="p-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white transition-colors disabled:opacity-50"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400">
                        {getSocialIcon(social.icon, social.name, social.url)}
                      </div>
                      <div>
                        <p className="text-white font-medium">{social.name}</p>
                        <a
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 text-sm hover:text-purple-400 transition-colors"
                        >
                          {social.url}
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditSocial(social)}
                      className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSocial(social.id)}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {newSocial && (
            <div className="p-4 bg-white/5 rounded-lg border border-purple-500/50">
              <div className="grid grid-cols-3 gap-3 mb-3">
                <input
                  type="text"
                  value={socialForm.name}
                  onChange={(e) => setSocialForm({ ...socialForm, name: e.target.value })}
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                  placeholder="Nome"
                />
                <input
                  type="url"
                  value={socialForm.url}
                  onChange={(e) => setSocialForm({ ...socialForm, url: e.target.value })}
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                  placeholder="URL"
                />
                <select
                  value={socialForm.icon}
                  onChange={(e) => setSocialForm({ ...socialForm, icon: e.target.value })}
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value="">Sem ícone</option>
                  {SOCIAL_ICONS.map((icon) => (
                    <option key={icon} value={icon} className="bg-slate-800">
                      {icon}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveSocial}
                  disabled={isSaving || !socialForm.name || !socialForm.url}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg text-white transition-colors text-sm disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

