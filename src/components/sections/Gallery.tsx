'use client'

import { motion, AnimatePresence } from 'motion/react'
import { ImageWithFallback } from '@/components/common/ImageWithFallback'
import { useState, useEffect } from 'react'
import { X, ZoomIn, ZoomOut, Loader2, Image as ImageIcon, Play, Maximize, Minimize, RotateCcw } from 'lucide-react'
import { 
  fetchGalleryArtworks, 
  type GalleryArtwork 
} from '@/data/artworks'

// Função helper para extrair ID do YouTube
function getYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? match[2] : null
}

export function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedArtwork, setSelectedArtwork] = useState<GalleryArtwork | null>(null)
  const [artworks, setArtworks] = useState<GalleryArtwork[]>([])
  const [categories, setCategories] = useState<string[]>(['all'])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Estados para zoom, pan e fullscreen
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    async function loadArtworks() {
      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchGalleryArtworks()
        // Garantir que data é um array válido
        if (Array.isArray(data)) {
          setArtworks(data)
          // Coletar categorias únicas do banco de dados
          const uniqueCategories = Array.from(
            new Set(data.map((art: GalleryArtwork) => art.category).filter(Boolean))
          ).sort()
          setCategories(['all', ...uniqueCategories])
        } else {
          setArtworks([])
          setError('Formato de dados inválido')
        }
      } catch (error) {
        console.error('Erro ao carregar artworks:', error)
        setError('Error loading gallery. Please try again later.')
        setArtworks([])
      } finally {
        setIsLoading(false)
      }
    }
    loadArtworks()
  }, [])

  // Garantir que filteredArtworks sempre seja um array válido
  const filteredArtworks = Array.isArray(artworks)
    ? (selectedCategory === 'all'
        ? artworks
        : artworks.filter((art) => art && art.category === selectedCategory))
    : []

  // Reset zoom e pan quando mudar de artwork
  useEffect(() => {
    if (selectedArtwork) {
      setZoom(1)
      setPan({ x: 0, y: 0 })
      setIsFullscreen(false)
    }
  }, [selectedArtwork])

  // Handlers para zoom (apenas em fullscreen)
  const handleZoomIn = () => {
    if (!isFullscreen) return
    setZoom(prev => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    if (!isFullscreen) return
    setZoom(prev => {
      const newZoom = Math.max(prev - 0.25, 1)
      if (newZoom === 1) {
        setPan({ x: 0, y: 0 })
      }
      return newZoom
    })
  }

  const handleResetZoom = () => {
    if (!isFullscreen) return
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  // Handler para zoom com scroll (apenas em fullscreen)
  const handleWheel = (e: React.WheelEvent) => {
    if (!isFullscreen) return
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      setZoom(prev => {
        const newZoom = Math.max(1, Math.min(3, prev + delta))
        if (newZoom === 1) {
          setPan({ x: 0, y: 0 })
        }
        return newZoom
      })
    }
  }

  // Handlers para pan (arrastar) - botão esquerdo ou botão do meio
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isFullscreen || zoom <= 1) return
    
    // Botão esquerdo (0) ou botão do meio (1)
    if (e.button === 0 || e.button === 1) {
      e.preventDefault()
      setIsPanning(true)
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isFullscreen || !isPanning || zoom <= 1) return
    e.preventDefault()
    const newX = e.clientX - panStart.x
    const newY = e.clientY - panStart.y
    
    // Limitar o pan baseado no zoom
    const maxPan = 300 * (zoom - 1)
    setPan({
      x: Math.max(-maxPan, Math.min(maxPan, newX)),
      y: Math.max(-maxPan, Math.min(maxPan, newY))
    })
  }

  const handleMouseUp = (e?: React.MouseEvent) => {
    setIsPanning(false)
    // Prevenir comportamento padrão do botão do meio (abrir em nova aba)
    if (e && e.button === 1) {
      e.preventDefault()
    }
  }

  // Handlers para touch (mobile) - apenas em fullscreen
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isFullscreen || zoom <= 1 || e.touches.length !== 1) return
    const touch = e.touches[0]
    setIsPanning(true)
    setPanStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isFullscreen || !isPanning || zoom <= 1 || e.touches.length !== 1) return
    e.preventDefault()
    const touch = e.touches[0]
    const newX = touch.clientX - panStart.x
    const newY = touch.clientY - panStart.y
    
    const maxPan = 300 * (zoom - 1)
    setPan({
      x: Math.max(-maxPan, Math.min(maxPan, newX)),
      y: Math.max(-maxPan, Math.min(maxPan, newY))
    })
  }

  const handleTouchEnd = () => {
    setIsPanning(false)
  }

  // Handler para fullscreen
  const handleFullscreen = async () => {
    const container = document.getElementById('image-fullscreen-container')
    if (!container) return

    try {
      if (!isFullscreen) {
        if (container.requestFullscreen) {
          await container.requestFullscreen()
        } else if ((container as any).webkitRequestFullscreen) {
          await (container as any).webkitRequestFullscreen()
        } else if ((container as any).msRequestFullscreen) {
          await (container as any).msRequestFullscreen()
        }
        setIsFullscreen(true)
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen()
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen()
        }
        setIsFullscreen(false)
      }
    } catch (error) {
      console.error('Erro ao alternar fullscreen:', error)
    }
  }

  // Listener para mudanças de fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement
      )
      setIsFullscreen(isCurrentlyFullscreen)
      // Reset zoom ao sair do fullscreen
      if (!isCurrentlyFullscreen) {
        setZoom(1)
        setPan({ x: 0, y: 0 })
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('msfullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('msfullscreenchange', handleFullscreenChange)
    }
  }, [])

  // Prevenir comportamento padrão do botão do meio do mouse globalmente quando em fullscreen
  useEffect(() => {
    if (!isFullscreen) return

    const handleContextMenu = (e: MouseEvent) => {
      if (e.button === 1) {
        e.preventDefault()
      }
    }

    const handleMouseDownGlobal = (e: MouseEvent) => {
      if (e.button === 1) {
        e.preventDefault()
      }
    }

    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('mousedown', handleMouseDownGlobal)

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('mousedown', handleMouseDownGlobal)
    }
  }, [isFullscreen])

  if (isLoading) {
    return (
      <section className="py-24 px-4 bg-gradient-to-b from-black via-zinc-950 to-black flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading gallery...</p>
        </div>
      </section>
    )
  }

  // Estado vazio - sem dados no banco
  if (!error && (!Array.isArray(artworks) || artworks.length === 0)) {
    return (
      <section className="py-24 px-4 bg-gradient-to-b from-black via-zinc-950 to-black">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-purple-500/10 mb-6">
              <ImageIcon className="w-12 h-12 text-purple-400 opacity-50" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Empty Gallery</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              No artworks have been added yet. Add some artworks through the dashboard to get started.
            </p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap justify-center gap-3"
            >
              {categories.map((category) => (
                <motion.button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full capitalize transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/50'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {category}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>
    )
  }

  // Estado de erro
  if (error) {
    return (
      <section className="py-24 px-4 bg-gradient-to-b from-black via-zinc-950 to-black">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/10 mb-6">
              <X className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Error Loading Gallery</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">{error}</p>
            <motion.button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Try Again
            </motion.button>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-black via-zinc-950 to-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <motion.p
            className="text-purple-400 tracking-widest uppercase mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Gallery
          </motion.p>
          <motion.h2
            className="text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            My Artwork Collection
          </motion.h2>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category: string, index: number) => (
            <motion.button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full capitalize transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/50'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
              }`}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {category}
            </motion.button>
          ))}
        </motion.div>

        {/* Mosaic Grid Gallery - Igual ao preview do dashboard em escala 1:1 */}
        {filteredArtworks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <p className="text-gray-400 text-lg mb-4">
              No artworks found in category "{selectedCategory}"
            </p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              View All Categories
            </button>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 auto-rows-[400px] gap-6"
              style={{ gridAutoFlow: 'dense' }}
            >
              {filteredArtworks.map((artwork, index) => {
                // Verificação adicional de segurança
                if (!artwork || !artwork.id) return null
                
                return (
              <motion.div
                key={artwork.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`group relative cursor-pointer overflow-hidden rounded-xl bg-zinc-900 border border-white/10 hover:border-purple-500/50 shadow-md hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 ${artwork.gridClass}`}
                onClick={() => setSelectedArtwork(artwork)}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="relative w-full h-full overflow-hidden">
                  <motion.div
                    className="w-full h-full"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <ImageWithFallback
                      src={artwork.image}
                      alt={artwork.title}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>

                  {/* Gradient Overlay - igual ao preview do dashboard */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />

                  {/* Title - igual ao preview do dashboard */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                    <motion.p
                      className="text-purple-400 uppercase tracking-wide mb-1 text-xs md:text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      initial={{ y: 10 }}
                      whileHover={{ y: 0 }}
                    >
                      {artwork.category}
                    </motion.p>
                    <h3 className="text-white drop-shadow-lg text-sm md:text-base">{artwork.title}</h3>
                  </div>

                  {/* Hover Details - ícone de zoom */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      whileHover={{ scale: 1 }}
                      transition={{ delay: 0.1, type: "spring" }}
                      className="bg-white/20 backdrop-blur-sm rounded-full p-4"
                    >
                      <ZoomIn className="text-white" size={32} />
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
                )
              })}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Lightbox Modal */}
        <AnimatePresence>
          {selectedArtwork && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
              onClick={() => setSelectedArtwork(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="relative max-w-5xl w-full bg-zinc-900 border border-white/20 rounded-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedArtwork(null)}
                  className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                  <X size={24} />
                </button>

                <div className="grid md:grid-cols-2">
                  <div 
                    id="image-fullscreen-container"
                    className="relative min-h-[400px] md:min-h-[600px] flex items-center justify-center bg-zinc-950/50 p-4 overflow-hidden"
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    style={{ cursor: zoom > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default', touchAction: 'none' }}
                  >
                    {/* Controles de zoom e fullscreen */}
                    <div className="absolute top-4 left-4 z-20 flex gap-2">
                      <button
                        onClick={handleZoomIn}
                        className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                        title="Zoom In (Ctrl + Scroll)"
                      >
                        <ZoomIn size={20} />
                      </button>
                      <button
                        onClick={handleZoomOut}
                        disabled={zoom <= 1}
                        className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Zoom Out"
                      >
                        <ZoomOut size={20} />
                      </button>
                      <button
                        onClick={handleResetZoom}
                        disabled={zoom === 1}
                        className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Reset Zoom"
                      >
                        <RotateCcw size={20} />
                      </button>
                      <button
                        onClick={handleFullscreen}
                        className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                        title="Fullscreen"
                      >
                        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                      </button>
                    </div>

                    {/* Indicador de zoom */}
                    {zoom > 1 && (
                      <div className="absolute top-4 right-4 z-20 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-white text-sm">
                        {Math.round(zoom * 100)}%
                      </div>
                    )}

                    {/* Container da imagem com transformações */}
                    <div 
                      className="relative w-full h-full max-h-[600px] flex items-center justify-center transition-transform duration-200"
                      style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                        transformOrigin: 'center center'
                      }}
                    >
                      <ImageWithFallback
                        src={selectedArtwork.image}
                        alt={selectedArtwork.title}
                        className="max-w-full max-h-full w-auto h-auto object-contain select-none"
                        draggable={false}
                      />
                    </div>
                  </div>
                  <div className="p-8 flex flex-col justify-center bg-zinc-900 min-h-[400px] md:min-h-[600px] overflow-y-auto">
                    <p className="text-purple-400 uppercase tracking-wide mb-3">
                      {selectedArtwork.category}
                    </p>
                    <h2 className="text-white mb-4 text-2xl">{selectedArtwork.title}</h2>
                    <p className="text-gray-300 mb-6">{selectedArtwork.description}</p>
                    
                    {/* YouTube Player - Timelapse */}
                    {selectedArtwork.youtubeUrl && getYouTubeId(selectedArtwork.youtubeUrl) && (
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                          <Play className="w-4 h-4 text-purple-400" />
                          <h3 className="text-white font-medium">Creation Timelapse</h3>
                        </div>
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
                          <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${getYouTubeId(selectedArtwork.youtubeUrl)}?rel=0&modestbranding=1`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="absolute inset-0"
                          />
                        </div>
                      </div>
                    )}

                    
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
