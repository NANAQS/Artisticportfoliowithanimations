'use client'

import { motion, AnimatePresence } from 'motion/react'
import { ImageWithFallback } from '@/components/common/ImageWithFallback'
import { useEffect, useState } from 'react'
import { Pause, Play, Loader2 } from 'lucide-react'
import { fetchCarouselArtworks, type CarouselArtwork } from '@/data/artworks'

export function ImageCarousel() {
  const [artworks, setArtworks] = useState<CarouselArtwork[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)

  useEffect(() => {
    async function loadArtworks() {
      try {
        const data = await fetchCarouselArtworks()
        setArtworks(data)
      } catch (error) {
        console.error('Erro ao carregar artworks do carrossel:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadArtworks()
  }, [])

  useEffect(() => {
    if (autoPlay && artworks.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % artworks.length)
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [autoPlay, artworks.length])

  const getVisibleCards = () => {
    if (artworks.length === 0) return { prev: 0, current: 0, next: 0 }
    const prev = (currentIndex - 1 + artworks.length) % artworks.length
    const next = (currentIndex + 1) % artworks.length
    return { prev, current: currentIndex, next }
  }

  const visible = getVisibleCards()

  if (isLoading) {
    return (
      <section className="py-20 px-4 bg-gradient-to-b from-black via-zinc-950 to-black flex items-center justify-center min-h-[600px]">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </section>
    )
  }

  if (artworks.length === 0) return null

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-black via-zinc-950 to-black overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-purple-400 tracking-widest uppercase mb-2">Featured Works</p>
          <h2 className="text-white">Selected Portfolio</h2>
        </motion.div>

        {/* Cards Carousel */}
        <div className="relative h-[500px] md:h-[500px] flex items-center justify-center px-4 md:px-0">
          <div className="relative w-full max-w-6xl mx-auto">
            <AnimatePresence mode="sync">
              {artworks.map((artwork, index) => {
                const isPrev = index === visible.prev
                const isCurrent = index === visible.current
                const isNext = index === visible.next
                const isVisible = isPrev || isCurrent || isNext

                if (!isVisible) return null

                let xOffset = 0
                let zIndex = 0
                let scale = 0.75
                let blur = 8
                let opacity = 0.4

                if (isPrev) {
                  xOffset = -400
                  zIndex = 1
                  scale = 0.8
                  blur = 8
                  opacity = 0.5
                } else if (isCurrent) {
                  xOffset = 0
                  zIndex = 3
                  scale = 1
                  blur = 0
                  opacity = 1
                } else if (isNext) {
                  xOffset = 400
                  zIndex = 1
                  scale = 0.8
                  blur = 8
                  opacity = 0.5
                }

                return (
                  <motion.div
                    key={artwork.id}
                    className="absolute left-1/2 top-1/2"
                    initial={{ x: xOffset - 200, y: '-50%', scale: 0.5, opacity: 0 }}
                    animate={{
                      x: xOffset - 200,
                      y: '-50%',
                      scale,
                      opacity,
                      filter: `blur(${blur}px)`,
                    }}
                    exit={{ x: xOffset - 200, opacity: 0, scale: 0.5, transition: { duration: 0.3 } }}
                    transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
                    style={{ zIndex }}
                  >
                    <div
                      className={`relative w-[280px] md:w-[400px] h-[380px] md:h-[480px] rounded-2xl overflow-hidden transition-all duration-700 ${
                        isCurrent
                          ? 'shadow-[0_35px_80px_-15px_rgba(168,85,247,0.4)]'
                          : 'shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)]'
                      }`}
                    >
                      <div className="absolute inset-0">
                        <ImageWithFallback
                          src={artwork.url}
                          alt={artwork.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                      <div className="absolute bottom-0 left-0 right-0 p-8">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: isCurrent ? 1 : 0, y: isCurrent ? 0 : 20 }}
                          transition={{ delay: isCurrent ? 0.2 : 0 }}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 bg-purple-500/30 backdrop-blur-sm rounded-full text-purple-200 text-sm">
                              {artwork.category}
                            </span>
                            <span className="text-gray-400 text-sm">{artwork.year}</span>
                          </div>
                          <h3 className="text-white mb-2">{artwork.title}</h3>
                          <div className="flex items-center gap-2">
                            <div className="h-1 w-12 bg-purple-500 rounded-full" />
                          </div>
                        </motion.div>
                      </div>

                      {isCurrent && (
                        <motion.div
                          className="absolute inset-0 rounded-2xl pointer-events-none"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0.3, 0.5, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                          style={{ boxShadow: 'inset 0 0 60px rgba(168, 85, 247, 0.3)' }}
                        />
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4">
            <div className="flex gap-3">
              {artworks.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index)
                    setAutoPlay(false)
                  }}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentIndex
                      ? 'w-12 h-3 bg-purple-500'
                      : 'w-3 h-3 bg-white/30 hover:bg-white/50'
                  }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
            <motion.button
              onClick={() => setAutoPlay(!autoPlay)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-400/50 transition-all duration-300 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {autoPlay ? (
                <Pause className="w-3 h-3 text-purple-400 group-hover:text-purple-300" />
              ) : (
                <Play className="w-3 h-3 text-purple-400 group-hover:text-purple-300" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Progress */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-400">
            <span className="text-purple-400">{currentIndex + 1}</span> / {artworks.length}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            {autoPlay ? 'Auto-play active • 4s per artwork' : 'Auto-play paused'}
          </p>
        </motion.div>
      </div>
    </section>
  )
}
