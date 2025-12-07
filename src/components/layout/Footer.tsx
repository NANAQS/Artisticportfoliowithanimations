'use client'

import { motion } from 'motion/react'
import { Heart } from 'lucide-react'
import { useState, useEffect } from 'react'

interface FooterConfig {
  authorName: string
  copyrightText: string
  href?: string | null
}

const DEFAULT_CONFIG: FooterConfig = {
  authorName: 'Nanak',
  copyrightText: '© 2025 Artist Portfolio. All rights reserved',
  href: null,
}

export function Footer() {
  const [config, setConfig] = useState<FooterConfig>(DEFAULT_CONFIG)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch('/api/footer')
        const data = await res.json()
        setConfig(data)
      } catch (error) {
        console.error('Erro ao carregar configuração do Footer:', error)
        // Manter valores padrão em caso de erro
        setConfig(DEFAULT_CONFIG)
      } finally {
        setIsLoading(false)
      }
    }
    fetchConfig()
  }, [])
  return (
    <footer className="bg-slate-950 text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 text-slate-400"
          >
            <span>Made with</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Heart className="text-red-500 fill-red-500" size={16} />
            </motion.div>
            <span>by </span>
            {config.href ? (
              <a
                href={config.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                {config.authorName}
              </a>
            ) : (
              <span>{config.authorName}</span>
            )}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-slate-500"
          >
            {config.copyrightText}
          </motion.p>

        </div>
      </div>
    </footer>
  )
}
