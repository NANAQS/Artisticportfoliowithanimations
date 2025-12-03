import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState } from 'react';
import { X, ZoomIn } from 'lucide-react';

interface Artwork {
  id: number;
  title: string;
  category: string;
  image: string;
  description: string;
  gridClass: string;
}

export function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  const categories = ['all', 'illustrations', 'character design', 'landscapes', 'portraits', 'concept art'];

  const artworks: Artwork[] = [
    {
      id: 1,
      title: "Digital Dreams",
      category: "illustrations",
      image: "https://images.unsplash.com/photo-1725347740942-c5306e3c970f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwaWxsdXN0cmF0aW9uJTIwYXJ0fGVufDF8fHx8MTc2MTY2NTg0Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      description: "A vibrant digital illustration exploring color and form",
      gridClass: 'md:col-span-2 md:row-span-2'
    },
    {
      id: 2,
      title: "Watercolor Fantasy",
      category: "landscapes",
      image: "https://images.unsplash.com/photo-1713815539197-78db123d8f3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXRlcmNvbG9yJTIwcGFpbnRpbmd8ZW58MXx8fHwxNzYxNjE0NjE0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      description: "Soft watercolor landscape with dreamy atmosphere",
      gridClass: 'md:col-span-1 md:row-span-1'
    },
    {
      id: 3,
      title: "Character Study",
      category: "character design",
      image: "https://images.unsplash.com/photo-1630207831419-3532bcb828d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGFyYWN0ZXIlMjBkZXNpZ24lMjBza2V0Y2h8ZW58MXx8fHwxNzYxNzA4MzEyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      description: "Detailed character design sketches and concepts",
      gridClass: 'md:col-span-1 md:row-span-1'
    },
    {
      id: 4,
      title: "Concept Vision",
      category: "concept art",
      image: "https://images.unsplash.com/photo-1758973602156-1e3d6473b87d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXB0JTIwYXJ0JTIwaWxsdXN0cmF0aW9ufGVufDF8fHx8MTc2MTcwODMxMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      description: "Environmental concept art for fantasy world",
      gridClass: 'md:col-span-2 md:row-span-1'
    },
    {
      id: 5,
      title: "Fantasy Realm",
      category: "concept art",
      image: "https://images.unsplash.com/photo-1732996909435-f1918cd4bf8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW50YXN5JTIwYXJ0d29ya3xlbnwxfHx8fDE3NjE3MDM5Njd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      description: "Magical fantasy world illustration",
      gridClass: 'md:col-span-2 md:row-span-1'
    },
    {
      id: 6,
      title: "Ink & Emotion",
      category: "illustrations",
      image: "https://images.unsplash.com/photo-1567333860476-cd5fff1d92f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmslMjBkcmF3aW5nJTIwYXJ0fGVufDF8fHx8MTc2MTcwODMxM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      description: "Expressive ink drawing with bold strokes",
      gridClass: 'md:col-span-1 md:row-span-1'
    },
    {
      id: 7,
      title: "Portrait Study",
      category: "portraits",
      image: "https://images.unsplash.com/photo-1701958213864-2307a737e853?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHBhaW50aW5nJTIwYXJ0aXN0aWN8ZW58MXx8fHwxNzYxNzA4MzEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      description: "Artistic portrait with dramatic lighting",
      gridClass: 'md:col-span-1 md:row-span-1'
    },
    {
      id: 8,
      title: "Anime Inspiration",
      category: "character design",
      image: "https://images.unsplash.com/photo-1760113671986-63ccb46ae202?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMG1hbmdhJTIwYXJ0fGVufDF8fHx8MTc2MTcwODMxM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      description: "Character design with anime aesthetics",
      gridClass: 'md:col-span-2 md:row-span-2'
    },
    {
      id: 9,
      title: "Scenic Vista",
      category: "landscapes",
      image: "https://images.unsplash.com/photo-1700404837925-ad013953a624?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW5kc2NhcGUlMjBwYWludGluZyUyMGFydHxlbnwxfHx8fDE3NjE2NjM5ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      description: "Peaceful landscape painting with rich colors",
      gridClass: 'md:col-span-1 md:row-span-1'
    },
    {
      id: 10,
      title: "Urban Expression",
      category: "illustrations",
      image: "https://images.unsplash.com/photo-1581688110074-5c8116f97a63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJlZXQlMjBhcnQlMjBtdXJhbHxlbnwxfHx8fDE3NjE2MzEwNTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      description: "Street art inspired illustration",
      gridClass: 'md:col-span-1 md:row-span-1'
    },
    {
      id: 11,
      title: "Abstract Composition",
      category: "illustrations",
      image: "https://images.unsplash.com/photo-1699568542323-ff98aca8ea6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGNvbG9yZnVsJTIwYXJ0fGVufDF8fHx8MTc2MTY1MjYwMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      description: "Bold abstract digital artwork",
      gridClass: 'md:col-span-2 md:row-span-1'
    },
    {
      id: 12,
      title: "Creative Workflow",
      category: "portraits",
      image: "https://images.unsplash.com/photo-1692859532235-c93fa73bd5d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMGFydGlzdGljJTIwcGFpbnRpbmd8ZW58MXx8fHwxNzYxNzA4NzM3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      description: "Colorful digital portrait exploration",
      gridClass: 'md:col-span-1 md:row-span-1'
    },
    {
      id: 13,
      title: "Modern Illustration",
      category: "illustrations",
      image: "https://images.unsplash.com/photo-1672220377691-336b03b8bb66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBpbGx1c3RyYXRpb24lMjBkZXNpZ258ZW58MXx8fHwxNzYxNzA4NzM4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      description: "Contemporary design aesthetics",
      gridClass: 'md:col-span-1 md:row-span-1'
    },
    {
      id: 14,
      title: "Vibrant Dreams",
      category: "concept art",
      image: "https://images.unsplash.com/photo-1741114056860-8e0e96fa60f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWJyYW50JTIwZGlnaXRhbCUyMGFydHdvcmt8ZW58MXx8fHwxNzYxNzA4NzM4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      description: "Colorful digital art expression",
      gridClass: 'md:col-span-1 md:row-span-1'
    },
    {
      id: 15,
      title: "Artistic Vision",
      category: "portraits",
      image: "https://images.unsplash.com/photo-1741335661631-439871f2b3b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc3RpYyUyMGNvbXBvc2l0aW9uJTIwY29sb3JzfGVufDF8fHx8MTc2MTcwODczOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      description: "Bold artistic composition",
      gridClass: 'md:col-span-2 md:row-span-1'
    }
  ];

  const filteredArtworks = selectedCategory === 'all' 
    ? artworks 
    : artworks.filter(art => art.category === selectedCategory);

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
          {categories.map((category, index) => (
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

        {/* Mosaic Grid Gallery */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 auto-rows-[200px] gap-4"
          >
            {filteredArtworks.slice(0, 4).map((artwork, index) => (
              <motion.div
                key={artwork.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`group relative cursor-pointer overflow-hidden rounded-xl bg-zinc-900 border border-white/10 hover:border-purple-500/50 shadow-md hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 md:${artwork.gridClass} col-span-1 row-span-1`}
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

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />

                  {/* Title - Always visible - Mobile: tags above, Desktop: on hover */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                    <motion.p
                      className="text-purple-400 uppercase tracking-wide mb-1 text-xs md:text-sm md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300"
                      initial={{ y: 10 }}
                      whileHover={{ y: 0 }}
                    >
                      {artwork.category}
                    </motion.p>
                    <h3 className="text-white drop-shadow-lg text-sm md:text-base">{artwork.title}</h3>
                  </div>

                  {/* Hover Details - Hidden on mobile */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex"
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
            ))}
            {/* Show all on desktop */}
            {filteredArtworks.slice(4).map((artwork, index) => (
              <motion.div
                key={artwork.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (index + 4) * 0.05 }}
                className={`hidden md:block group relative cursor-pointer overflow-hidden rounded-xl bg-zinc-900 border border-white/10 hover:border-purple-500/50 shadow-md hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 ${artwork.gridClass}`}
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

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />

                  {/* Title - Always visible */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <motion.p
                      className="text-purple-400 uppercase tracking-wide mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      initial={{ y: 10 }}
                      whileHover={{ y: 0 }}
                    >
                      {artwork.category}
                    </motion.p>
                    <h3 className="text-white drop-shadow-lg">{artwork.title}</h3>
                  </div>

                  {/* Hover Details */}
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
            ))}
          </motion.div>
        </AnimatePresence>

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
                  <div className="relative h-[400px] md:h-auto">
                    <ImageWithFallback
                      src={selectedArtwork.image}
                      alt={selectedArtwork.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-8 flex flex-col justify-center bg-zinc-900">
                    <p className="text-purple-400 uppercase tracking-wide mb-3">
                      {selectedArtwork.category}
                    </p>
                    <h2 className="text-white mb-4">{selectedArtwork.title}</h2>
                    <p className="text-gray-300 mb-6">{selectedArtwork.description}</p>
                    <div className="flex gap-3">
                      <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                        Purchase Print
                      </button>
                      <button className="px-6 py-3 border border-white/20 text-gray-300 rounded-lg hover:bg-white/5 transition-colors">
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
