'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ImageWithFallback } from '@/components/common/ImageWithFallback'
import { Loader2 } from 'lucide-react'
import { fetchScrollContent, type ScrollContent } from '@/data/artworks'

export function ScrollImageSection() {
  const [scrollContent, setScrollContent] = useState<ScrollContent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [typingText, setTypingText] = useState('')
  const [isTypingComplete, setIsTypingComplete] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isSticky, setIsSticky] = useState(false)

  useEffect(() => {
    async function loadContent() {
      try {
        const data = await fetchScrollContent()
        setScrollContent(data)
      } catch (error) {
        console.error('Erro ao carregar scroll content:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadContent()
  }, [])

  const currentContent = scrollContent[currentIndex]

  // Typing effect
  useEffect(() => {
    if (!currentContent) return
    
    setTypingText('')
    setIsTypingComplete(false)
    let currentChar = 0
    const fullText = currentContent.description

    const typingInterval = setInterval(() => {
      if (currentChar < fullText.length) {
        setTypingText(fullText.substring(0, currentChar + 1))
        currentChar++
      } else {
        setIsTypingComplete(true)
        clearInterval(typingInterval)
      }
    }, 30)

    return () => clearInterval(typingInterval)
  }, [currentContent?.description])

  // Scroll-based slide change
  useEffect(() => {
    if (scrollContent.length === 0) return
    
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!containerRef.current) return

          const containerTop = containerRef.current.offsetTop
          const containerHeight = containerRef.current.offsetHeight
          const viewportHeight = window.innerHeight
          const scrollProgress = window.scrollY - containerTop

          if (scrollProgress >= 0 && scrollProgress <= containerHeight - viewportHeight) {
            setIsSticky(true)
            const slideHeight = (containerHeight - viewportHeight) / scrollContent.length
            const newIndex = Math.min(
              Math.floor(scrollProgress / slideHeight),
              scrollContent.length - 1
            )
            if (newIndex !== currentIndex) {
              setCurrentIndex(newIndex)
            }
          } else {
            setIsSticky(false)
          }

          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [currentIndex, scrollContent.length])

  if (isLoading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    )
  }

  if (scrollContent.length === 0 || !currentContent) return null

  const containerHeight = `${scrollContent.length * 100}vh`

  return (
    <div ref={containerRef} style={{ height: containerHeight }} className="relative bg-black">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={`${isSticky ? 'fixed top-0 left-0 right-0' : 'absolute bottom-0 left-0 right-0'} h-screen`}
      >
        <section className="h-full flex items-center px-6 md:px-12 lg:px-24 bg-gradient-to-b from-black via-zinc-950 to-black">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Image */}
              <div className="relative h-[400px] md:h-[500px] overflow-hidden rounded-2xl">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: 'easeInOut' }}
                    className="absolute inset-0"
                  >
                    <ImageWithFallback
                      src={currentContent.image}
                      alt={currentContent.title}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </motion.div>
                </AnimatePresence>

                {/* Progress indicators */}
                <div className="absolute bottom-6 left-6 flex gap-2 z-10">
                  {scrollContent.map((_, index) => (
                    <motion.div
                      key={index}
                      className={`h-1 rounded-full transition-all duration-500 ${
                        index === currentIndex ? 'w-12 bg-white' : 'w-6 bg-white/30'
                      }`}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: index === currentIndex ? 1 : 0.8 }}
                    />
                  ))}
                </div>
              </div>

              {/* Text */}
              <div className="space-y-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.h2
                      className="text-white mb-6"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    >
                      {currentContent.title}
                    </motion.h2>
                  </motion.div>
                </AnimatePresence>

                <div className="text-gray-300 leading-relaxed min-h-[120px]">
                  <span className="inline-block">
                    {typingText}
                    {!isTypingComplete && (
                      <motion.span
                        className="inline-block w-[2px] h-5 bg-purple-500 ml-1"
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                    )}
                  </span>
                </div>

                {/* Progress indicator */}
                <motion.div
                  className="flex items-center gap-4 pt-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                    <span>
                      {currentIndex < scrollContent.length - 1
                        ? 'Scroll to see more artworks'
                        : 'Continue scrolling to next section'}
                    </span>
                  </div>
                  <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-purple-500"
                      initial={{ width: '0%' }}
                      animate={{
                        width: `${((currentIndex + 1) / scrollContent.length) * 100}%`,
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </motion.div>
    </div>
  )
}
