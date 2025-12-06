'use client'

import { motion } from 'motion/react'
import { Heart } from 'lucide-react'

const SOCIAL_LINKS = ['Instagram', 'Twitter', 'ArtStation', 'Behance']

export function Footer() {
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
            <span>by Nanak</span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-slate-500"
          >
            © 2025 Artist Portfolio. All rights reserved
          </motion.p>

        </div>
      </div>
    </footer>
  )
}
