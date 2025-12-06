'use client'

import { motion } from 'motion/react'
import { ImageWithFallback } from '@/components/common/ImageWithFallback'
import { useState, useEffect } from 'react'
import { Code, Palette, Sparkles, Brush, Layers, Zap, Star, Heart, Loader2 } from 'lucide-react'

const iconMap: Record<string, React.ReactNode> = {
  Palette: <Palette className="w-6 h-6" />,
  Code: <Code className="w-6 h-6" />,
  Sparkles: <Sparkles className="w-6 h-6" />,
  Brush: <Brush className="w-6 h-6" />,
  Layers: <Layers className="w-6 h-6" />,
  Zap: <Zap className="w-6 h-6" />,
  Star: <Star className="w-6 h-6" />,
  Heart: <Heart className="w-6 h-6" />,
}

interface AboutConfig {
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

export function About() {
  const [aboutConfig, setAboutConfig] = useState<AboutConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchAbout() {
      try {
        const res = await fetch('/api/about')
        const data = await res.json()
        setAboutConfig(data.about)
      } catch (error) {
        console.error('Erro ao carregar About:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAbout()
  }, [])

  if (isLoading) {
    return (
      <section className="py-24 px-4 bg-gradient-to-b from-black via-zinc-950 to-black">
        <div className="max-w-7xl mx-auto flex items-center justify-center h-[500px]">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      </section>
    )
  }

  if (!aboutConfig) {
    return null
  }

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-black via-zinc-950 to-black">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden">
              <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.4 }}>
                <ImageWithFallback
                  src={aboutConfig.image}
                  alt="Creative workspace"
                  className="w-full h-[500px] object-cover"
                />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/30 to-transparent" />
            </div>
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-purple-900/30 rounded-2xl -z-10 blur-xl" />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-purple-400 tracking-wide uppercase mb-4">{aboutConfig.subtitle}</p>
            <h2 className="mb-6 text-white">{aboutConfig.title}</h2>
            <p className="text-gray-300 mb-6">{aboutConfig.description}</p>
            {aboutConfig.paragraph2 && (
              <p className="text-gray-300 mb-8">{aboutConfig.paragraph2}</p>
            )}

            {/* Skills */}
            {aboutConfig.skills && Array.isArray(aboutConfig.skills) && aboutConfig.skills.length > 0 && (
              <div className="space-y-4">
                {aboutConfig.skills.map((skill, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-4 p-4 rounded-xl bg-white/5 hover:bg-purple-900/20 border border-white/10 hover:border-purple-500/30 transition-all duration-300"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400">
                      {iconMap[skill.icon] || <Palette className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="text-white mb-1">{skill.title}</h3>
                      <p className="text-gray-400">{skill.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
