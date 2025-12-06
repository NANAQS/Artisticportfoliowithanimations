'use client'

import { motion } from 'motion/react'
import { Mail, MapPin, Phone, Send, Twitter, Linkedin, Github, Dribbble, Instagram, Facebook, Youtube, ExternalLink } from 'lucide-react'
import { useState, useEffect } from 'react'

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

// Helper para obter o ícone baseado no nome da rede social
function getSocialIcon(iconName: string | null, name: string, url: string) {
  // Normalizar o nome para minúsculas e remover espaços
  const normalizedName = name.toLowerCase().trim()
  const normalizedIcon = iconName?.toLowerCase().trim() || ''
  
  // Mapeamento completo de redes sociais para ícones
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

  // Tentar encontrar pelo ícone salvo primeiro
  if (normalizedIcon && iconMap[normalizedIcon]) {
    return iconMap[normalizedIcon]
  }

  // Tentar encontrar pelo nome da rede
  if (iconMap[normalizedName]) {
    return iconMap[normalizedName]
  }

  // Tentar detectar pela URL
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

  // Fallback para ícone genérico
  return <ExternalLink className="w-5 h-5" />
}

export function Contact() {
  const [contactConfig, setContactConfig] = useState<ContactConfig | null>(null)
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    async function fetchContactData() {
      try {
        const res = await fetch('/api/contact')
        const data = await res.json()
        setContactConfig(data.contact)
        setSocialLinks(data.socialLinks || [])
      } catch (error) {
        console.error('Erro ao buscar dados de contato:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchContactData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      // Criar link mailto com assunto e corpo
      const subject = encodeURIComponent(`Contact from ${formData.name}`)
      const body = encodeURIComponent(
        `Hello,\n\nMy name is ${formData.name} (${formData.email}).\n\n${formData.message}\n\nBest regards,\n${formData.name}`
      )
      const mailtoLink = `mailto:${contactConfig?.email}?subject=${subject}&body=${body}`
      
      // Abrir cliente de email
      window.location.href = mailtoLink
      
      // Limpar formulário após um delay
      setTimeout(() => {
        setFormData({ name: '', email: '', message: '' })
        setSubmitStatus('success')
        setTimeout(() => setSubmitStatus('idle'), 3000)
      }, 500)
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      setSubmitStatus('error')
      setTimeout(() => setSubmitStatus('idle'), 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <section className="py-24 px-4 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </section>
    )
  }

  const contactInfo = [
    { 
      icon: <Mail className="w-5 h-5" />, 
      label: 'Email', 
      value: contactConfig?.email || 'hello@portfolio.com',
      link: contactConfig?.email ? `mailto:${contactConfig.email}` : undefined
    },
    { 
      icon: <Phone className="w-5 h-5" />, 
      label: 'Phone', 
      value: contactConfig?.phone || 'Not provided',
      link: contactConfig?.phone ? `tel:${contactConfig.phone.replace(/\s/g, '')}` : undefined
    },
    { 
      icon: <MapPin className="w-5 h-5" />, 
      label: 'Location', 
      value: contactConfig?.location || 'Not provided',
      link: contactConfig?.location ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactConfig.location)}` : undefined
    },
  ]

  return (
    <section className="py-24 px-4 bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-purple-400 tracking-wide uppercase mb-4">Get In Touch</p>
          <h2 className="mb-4">Let's Create Together</h2>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Interested in commissioning artwork or collaborating on a project? Let's create
            something amazing together!
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="mb-8">Contact Information</h3>
            <div className="space-y-6 mb-8">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={info.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center text-purple-400 flex-shrink-0">
                    {info.icon}
                  </div>
                  <div>
                    <p className="text-slate-400 mb-1">{info.label}</p>
                    {info.link ? (
                      <a
                        href={info.link}
                        className="text-white hover:text-purple-400 transition-colors"
                      >
                        {info.value}
                      </a>
                    ) : (
                      <p className="text-white">{info.value}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div>
                <p className="text-slate-400 mb-4">Follow Me</p>
                <div className="flex gap-4 flex-wrap">
                  {socialLinks.map((social) => (
                    <motion.a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-purple-600 transition-colors duration-300 text-white"
                      title={social.name}
                    >
                      {getSocialIcon(social.icon, social.name, social.url)}
                    </motion.a>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-slate-300 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400 transition-colors text-white placeholder-slate-400"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-slate-300 mb-2">
                  Your Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400 transition-colors text-white placeholder-slate-400"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-slate-300 mb-2">
                  Your Message
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-purple-400 transition-colors text-white placeholder-slate-400 resize-none"
                  placeholder="Tell me about your project..."
                  required
                />
              </div>

              {submitStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm"
                >
                  Message prepared! Your email client will be opened.
                </motion.div>
              )}

              {submitStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm"
                >
                  Error preparing message. Please try again.
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                className="w-full px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Preparing...
                  </>
                ) : (
                  <>
                    Send Message
                    <Send size={18} />
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
