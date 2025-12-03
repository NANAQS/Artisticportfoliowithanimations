import { motion, AnimatePresence } from 'motion/react';
import { Star, Quote, TrendingUp, Award, Pause, Play } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState, useEffect } from 'react';

interface Testimonial {
  name: string;
  role: string;
  image: string;
  text: string;
  rating: number;
  skillsHighlighted: string[];
}

export function SkillsTestimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const testimonials: Testimonial[] = [
    {
      name: "Sarah Johnson",
      role: "Game Developer",
      image: "https://images.unsplash.com/photo-1701958213864-2307a737e853?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHBhaW50aW5nJTIwYXJ0aXN0aWN8ZW58MXx8fHwxNzYxNzA4MzEzfDA&ixlib=rb-4.1.0&q=80&w=1080",
      text: "The character designs exceeded all expectations. The attention to detail, anatomy knowledge, and unique artistic style brought our game to life!",
      rating: 5,
      skillsHighlighted: ["Character Design", "Digital Painting", "Anatomy & Form"]
    },
    {
      name: "Marcus Chen",
      role: "Author & Publisher",
      image: "https://images.unsplash.com/photo-1630207831419-3532bcb828d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGFyYWN0ZXIlMjBkZXNpZ24lMjBza2V0Y2h8ZW58MXx8fHwxNzYxNzA4MzEyfDA&ixlib=rb-4.1.0&q=80&w=1080",
      text: "Beautiful book cover illustrations with exceptional composition and color theory. The visual storytelling perfectly captured the essence of my story!",
      rating: 5,
      skillsHighlighted: ["Illustration Styles", "Composition", "Color Theory"]
    },
    {
      name: "Emily Rodriguez",
      role: "Animation Studio Director",
      image: "https://images.unsplash.com/photo-1725347740942-c5306e3c970f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwaWxsdXN0cmF0aW9uJTIwYXJ0fGVufDF8fHx8MTc2MTY2NTg0Mnww&ixlib=rb-4.1.0&q=80&w=1080",
      text: "Outstanding concept art and storyboarding that helped us visualize our animated series. Professional workflow with amazing background art!",
      rating: 5,
      skillsHighlighted: ["Concept Art", "Storyboarding", "Background Art"]
    }
  ];

  // Auto-play testimonials
  useEffect(() => {
    if (autoPlay) {
      const interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % testimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [autoPlay, testimonials.length]);

  // Aggregate skills from all testimonials with ratings
  const aggregatedSkills = [
    { name: 'Character Design', level: 95, mentions: 2 },
    { name: 'Digital Painting', level: 98, mentions: 3 },
    { name: 'Color Theory', level: 90, mentions: 2 },
    { name: 'Composition', level: 92, mentions: 2 },
    { name: 'Anatomy & Form', level: 88, mentions: 2 },
    { name: 'Concept Art', level: 93, mentions: 2 },
    { name: 'Illustration Styles', level: 94, mentions: 3 },
    { name: 'Background Art', level: 87, mentions: 1 },
    { name: 'Storyboarding', level: 85, mentions: 1 }
  ];

  const currentTestimonial = testimonials[activeIndex];

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.div 
            className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-purple-500/20 rounded-full"
            whileHover={{ scale: 1.05 }}
          >
            <Award className="w-4 h-4 text-purple-400" />
            <p className="text-purple-400 tracking-widest uppercase text-sm">
              Validado por Clientes
            </p>
          </motion.div>
          <h2 className="mb-4">Habilidades Reconhecidas</h2>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Minhas competências artísticas avaliadas e validadas por clientes satisfeitos ao redor do mundo
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Side: Testimonials */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <div className="flex items-center gap-2 mb-4">
                <Quote className="w-6 h-6 text-purple-400" />
                <h3 className="text-white">Avaliações dos Clientes</h3>
              </div>
              <p className="text-slate-400 text-sm">
                Feedback real que fundamenta minhas habilidades
              </p>
            </motion.div>

            {/* Main Testimonial Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                  {/* Quote decoration */}
                  <motion.div
                    className="absolute -top-4 -right-4 text-purple-400/20"
                    animate={{ rotate: [0, 10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <Quote size={80} />
                  </motion.div>

                  {/* Rating stars */}
                  <div className="flex gap-1 mb-6">
                    {[...Array(currentTestimonial.rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: i * 0.1, type: "spring" }}
                      >
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      </motion.div>
                    ))}
                  </div>

                  {/* Testimonial text */}
                  <p className="text-slate-100 mb-8 leading-relaxed italic">
                    "{currentTestimonial.text}"
                  </p>

                  {/* Skills highlighted in this testimonial */}
                  <div className="mb-6">
                    <p className="text-sm text-purple-400 mb-3">Habilidades destacadas:</p>
                    <div className="flex flex-wrap gap-2">
                      {currentTestimonial.skillsHighlighted.map((skill, idx) => (
                        <motion.span
                          key={idx}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 + idx * 0.1 }}
                          className="px-3 py-1 bg-purple-500/30 border border-purple-400/30 rounded-full text-sm text-purple-200"
                        >
                          {skill}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  {/* Client info */}
                  <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-purple-400/50">
                        <ImageWithFallback
                          src={currentTestimonial.image}
                          alt={currentTestimonial.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                        <Star className="w-3 h-3 fill-white text-white" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-white">{currentTestimonial.name}</h4>
                      <p className="text-purple-400 text-sm">{currentTestimonial.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-center items-center gap-4 mt-8">
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => {
                      setActiveIndex(index);
                      setAutoPlay(false);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === activeIndex
                        ? 'w-8 bg-purple-400'
                        : 'w-2 bg-white/30 hover:bg-white/50'
                    }`}
                    whileHover={{ scale: 1.3 }}
                    whileTap={{ scale: 0.9 }}
                  />
                ))}
              </div>
              <motion.button
                onClick={() => setAutoPlay(!autoPlay)}
                className="ml-4 flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-400/50 transition-all duration-300 group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {autoPlay ? (
                  <>
                    <Pause className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
                    <span className="text-sm text-slate-400 group-hover:text-purple-300">Pausar</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
                    <span className="text-sm text-slate-400 group-hover:text-purple-300">Continuar</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Right Side: Skills based on testimonials */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-6 h-6 text-purple-400" />
                <h3 className="text-white">Habilidades Validadas</h3>
              </div>
              <p className="text-slate-400 text-sm">
                Níveis de proficiência baseados em avaliações reais
              </p>
            </motion.div>

            {/* Skills list - Two columns */}
            <div className="grid grid-cols-2 gap-4">
              {aggregatedSkills.map((skill, index) => {
                const isHighlighted = currentTestimonial.skillsHighlighted.includes(skill.name);
                
                return (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.03 }}
                    className={`p-3 rounded-xl transition-all duration-500 ${
                      isHighlighted 
                        ? 'bg-purple-500/20 border border-purple-400/50 shadow-lg shadow-purple-500/20' 
                        : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-col gap-1 flex-1 min-w-0">
                        <span className={`transition-colors text-sm truncate ${
                          isHighlighted ? 'text-white' : 'text-slate-200'
                        }`}>
                          {skill.name}
                        </span>
                        {isHighlighted && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="px-2 py-0.5 bg-purple-500 rounded-full text-xs text-white w-fit"
                          >
                            Destacado
                          </motion.span>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-0.5 ml-2">
                        <span className="text-purple-400 text-sm whitespace-nowrap">{skill.level}%</span>
                        {skill.mentions > 1 && (
                          <span className="text-xs text-slate-400 whitespace-nowrap">
                            ({skill.mentions}x)
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="h-1.5 bg-slate-800/50 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${
                          isHighlighted
                            ? 'bg-gradient-to-r from-purple-400 to-pink-400'
                            : 'bg-gradient-to-r from-purple-600 to-blue-500'
                        }`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: index * 0.03, ease: "easeOut" }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Stats summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-8 grid grid-cols-3 gap-4"
            >
              <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-2xl text-purple-400 mb-1">9+</div>
                <div className="text-xs text-slate-400">Habilidades</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-2xl text-purple-400 mb-1">92%</div>
                <div className="text-xs text-slate-400">Média Geral</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-2xl text-purple-400 mb-1">5★</div>
                <div className="text-xs text-slate-400">Avaliação</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
