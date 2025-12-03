import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ContentItem {
  image: string;
  title: string;
  description: string;
}

const contentItems: ContentItem[] = [
   {
    image: "https://lh3.googleusercontent.com/d/1PPYfshmd73_aDD63TCDGsUt2O6rkX5ps",
    title: "Design de Personagens",
    description: "Criando personagens únicos e memoráveis que ganham vida através de formas expressivas, cores marcantes e personalidades distintas."
  },
  {
    image: "https://lh3.googleusercontent.com/d/1AV_2nQBMXqAvNz8UfVG8E_EJaRuZBI3j",
    title: "Arte Abstrata",
    description: "Mergulhando em texturas, formas e cores para criar experiências visuais que transcendem a representação literal e despertam emoções profundas."
  },
  {
    image: "https://lh3.googleusercontent.com/d/1jlDfdj1NeW5u9rdgzxnWtFP_ZbrTudy8",
    title: "Arte Digital Contemporânea",
    description: "Explorando as fronteiras da criatividade digital através de composições vibrantes e narrativas visuais que capturam a essência da arte moderna."
  }
];

export function ScrollImageSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typingText, setTypingText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);

  const currentContent = contentItems[currentIndex];

  // Typing effect
  useEffect(() => {
    setTypingText('');
    setIsTypingComplete(false);
    let currentChar = 0;
    const fullText = currentContent.description;

    const typingInterval = setInterval(() => {
      if (currentChar < fullText.length) {
        setTypingText(fullText.substring(0, currentChar + 1));
        currentChar++;
      } else {
        setIsTypingComplete(true);
        clearInterval(typingInterval);
      }
    }, 30);

    return () => clearInterval(typingInterval);
  }, [currentContent.description]);

  // Scroll-based slide change
  useEffect(() => {
    let ticking = false;
    let lastKnownScrollPosition = 0;

    const handleScroll = () => {
      lastKnownScrollPosition = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!containerRef.current) return;

          const containerTop = containerRef.current.offsetTop;
          const containerHeight = containerRef.current.offsetHeight;
          const viewportHeight = window.innerHeight;
          const scrollProgress = lastKnownScrollPosition - containerTop;

          // Check if we're in the sticky zone
          if (scrollProgress >= 0 && scrollProgress <= containerHeight - viewportHeight) {
            setIsSticky(true);
            
            // Calculate which slide should be shown based on scroll progress
            const slideHeight = (containerHeight - viewportHeight) / contentItems.length;
            const newIndex = Math.min(
              Math.floor(scrollProgress / slideHeight),
              contentItems.length - 1
            );
            
            if (newIndex !== currentIndex) {
              setCurrentIndex(newIndex);
            }
          } else {
            setIsSticky(false);
          }

          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentIndex]);

  // Calculate container height: viewport height * number of slides
  const containerHeight = `${contentItems.length * 100}vh`;

  return (
    <div 
      ref={containerRef} 
      style={{ height: containerHeight }}
      className="relative bg-black"
    >
      <motion.div 
        ref={contentRef}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`${isSticky ? 'fixed top-0 left-0 right-0' : 'absolute bottom-0 left-0 right-0'} h-screen`}
      >
        <section className="h-full flex items-center px-6 md:px-12 lg:px-24 bg-gradient-to-b from-black via-zinc-950 to-black">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Image Section */}
              <div className="relative h-[400px] md:h-[500px] overflow-hidden rounded-2xl">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={currentIndex}
                    initial={{ 
                      opacity: 0, 
                    }}
                    animate={{ 
                      opacity: 1, 
                    }}
                    exit={{ 
                      opacity: 0, 
                    }}
                    transition={{ 
                      duration: 1.2,
                      ease: "easeInOut"
                    }}
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

                {/* Image counter indicator */}
                <div className="absolute bottom-6 left-6 flex gap-2 z-10">
                  {contentItems.map((_, index) => (
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

              {/* Text Section */}
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
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    <span>
                      {currentIndex < contentItems.length - 1 
                        ? 'Role para ver mais obras' 
                        : 'Continue rolando para próxima seção'}
                    </span>
                  </div>
                  <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-purple-500"
                      initial={{ width: '0%' }}
                      animate={{ width: `${((currentIndex + 1) / contentItems.length) * 100}%` }}
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
  );
}