'use client'

import { motion, useScroll, useTransform } from 'motion/react'
import { ArrowDown, Palette, Sparkles, Heart } from 'lucide-react'
import { useRef, useMemo } from 'react'
import { ImageWithFallback } from '@/components/common/ImageWithFallback'

const HERO_STATS = [
  { number: '500+', label: 'Artworks' },
  { number: '200+', label: 'Happy Clients' },
  { number: '5+', label: 'Years' },
]

export function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2])

  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        duration: Math.random() * 10 + 10,
      })),
    []
  )

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900"
    >
      {/* Animated background elements */}
      <motion.div style={{ y }} className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"
          style={{ scale }}
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          style={{ scale }}
          animate={{ scale: [1, 1.3, 1], x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl"
          style={{ scale }}
          animate={{ scale: [1, 1.4, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        />

        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute bg-white/20 rounded-full"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{ y: [-20, 20, -20], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: particle.duration, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </motion.div>

      {/* Decorative elements */}
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], ['0%', '30%']) }}
        className="absolute top-20 right-40 text-purple-400/20"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <Palette size={60} />
        </motion.div>
      </motion.div>
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], ['0%', '-20%']) }}
        className="absolute bottom-40 left-20 text-blue-400/20 hidden lg:block"
      >
        <motion.div
          animate={{ rotate: [0, 10, 0, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Sparkles size={50} />
        </motion.div>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center min-h-screen py-20">
          {/* Character */}
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="relative order-2 lg:order-1 -ml-4 lg:-ml-8"
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />

              <motion.div className="relative w-full">
                <div className="relative overflow-hidden">
                  <ImageWithFallback
                    src="https://lh3.googleusercontent.com/d/1ul-n2KW50Y6QkDy0MSENg39dr9H__bJR"
                    alt="Artist Character"
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 via-transparent to-transparent" />
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 1, type: 'spring' }}
                  className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10"
                >
                  <div className="relative bg-white text-slate-900 px-6 py-3 rounded-2xl shadow-xl">
                    <p className="whitespace-nowrap">Hello! Welcome! ✨</p>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45" />
                  </div>
                </motion.div>
              </motion.div>

              <motion.div
                className="absolute top-1/4 -right-8 text-pink-400"
                animate={{ y: [-10, -30, -10], opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Heart className="fill-current" size={24} />
              </motion.div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div style={{ opacity }} className="order-1 lg:order-2 text-left lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <motion.div
                className="flex items-center gap-2 mb-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, type: 'spring' }}
              >
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Palette className="text-purple-400" size={20} />
                </motion.div>
                <p className="text-purple-400 tracking-widest uppercase text-sm">
                  2D Artist & Illustrator
                </p>
              </motion.div>

              <motion.h1
                className="text-white mb-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                Bringing Stories to Life
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
                  Through Art
                </span>
              </motion.h1>

              <motion.p
                className="text-slate-300 mb-10 max-w-xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                Creating vibrant illustrations, character designs, and digital paintings that
                capture emotion and imagination
              </motion.p>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="flex flex-col sm:flex-row gap-4 mb-12"
              >
                <motion.a
                  href="#gallery"
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 text-center"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Gallery
                </motion.a>
                <motion.a
                  href="#contact"
                  className="px-8 py-4 border-2 border-purple-400/50 text-white rounded-full hover:bg-purple-500/10 hover:border-purple-400 transition-all duration-300 text-center backdrop-blur-sm"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Commission Work
                </motion.a>
              </motion.div>

              {/* Stats */}
              <motion.div
                className="flex gap-3 md:gap-8 justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
              >
                {HERO_STATS.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.4 + index * 0.1, type: 'spring' }}
                    whileHover={{ y: -5 }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-purple-500/20 rounded-lg blur-xl group-hover:blur-2xl transition-all" />
                    <div className="relative bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2 md:px-6 md:py-4 border border-white/10">
                      <motion.div className="text-white mb-0 md:mb-1 text-sm md:text-base">
                        {stat.number}
                      </motion.div>
                      <p className="text-slate-400 text-xs md:text-sm whitespace-nowrap">
                        {stat.label}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ArrowDown className="text-white/50" size={24} />
      </motion.div>
    </section>
  )
}
