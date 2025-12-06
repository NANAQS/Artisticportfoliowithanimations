'use client'

import { motion } from 'motion/react'
import { Lightbulb, Pencil, Palette, Sparkles } from 'lucide-react'
import { Router } from 'next/router'

const PROCESS_STEPS = [
  {
    icon: <Lightbulb className="w-8 h-8" />,
    title: 'Concept',
    description: 'Every piece starts with inspiration and careful planning',
  },
  {
    icon: <Pencil className="w-8 h-8" />,
    title: 'Sketch',
    description: 'Rough sketches bring ideas to life on the canvas',
  },
  {
    icon: <Palette className="w-8 h-8" />,
    title: 'Color',
    description: 'Adding vibrant colors and depth to create mood',
  },
  {
    icon: <Sparkles className="w-8 h-8" />,
    title: 'Final Touch',
    description: 'Refining details and adding the finishing touches',
  },
]

export function ArtProcess() {
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-black via-zinc-950 to-black relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl -z-0" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -z-0" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-purple-400 tracking-widest uppercase mb-4">My Process</p>
          <h2 className="text-white mb-4">From Idea to Artwork</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Every piece I create follows a thoughtful journey from initial concept to final
            masterpiece
          </p>
        </motion.div>

        {/* Process Steps */}
        <div className="relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-blue-600/30 -translate-y-1/2 hidden lg:block" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {PROCESS_STEPS.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <motion.div
                  whileHover={{ y: -10 }}
                  className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 relative z-10"
                >
                  {/* Number badge */}
                  <motion.div
                    className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white shadow-lg"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                  >
                    {index + 1}
                  </motion.div>

                  {/* Icon */}
                  <motion.div
                    className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center text-purple-400 mb-6 border border-purple-500/20"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    {step.icon}
                  </motion.div>

                  <h3 className="text-white mb-3">{step.title}</h3>
                  <p className="text-gray-400">{step.description}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <motion.button
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Your Commission
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
