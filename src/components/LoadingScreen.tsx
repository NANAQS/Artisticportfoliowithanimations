import { motion, useAnimation } from 'motion/react';
import { useEffect, useState } from 'react';
import { Palette } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const controls = useAnimation();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const sequence = async () => {
      // Simular progresso de carregamento
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 2;
        });
      }, 30);

      // Esperar até 100%
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Animar janela se aproximando
      await controls.start({
        scale: 1.5,
        opacity: 1,
        transition: { duration: 0.8, ease: "easeInOut" }
      });

      // Fade out
      await controls.start({
        opacity: 0,
        scale: 2,
        transition: { duration: 0.5, ease: "easeIn" }
      });

      onComplete();
    };

    sequence();
  }, [controls, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={controls}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900"
    >
      {/* Partículas de fundo */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: Math.random() * 0.5 + 0.2
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              opacity: [null, 0, Math.random() * 0.5 + 0.2]
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Janela central */}
      <motion.div
        initial={{ scale: 0.3, opacity: 0.5 }}
        animate={{ 
          scale: 1,
          opacity: 1,
          transition: { duration: 0.8, ease: "easeOut" }
        }}
        className="relative z-10 text-center"
      >
        {/* Frame da janela */}
        <motion.div
          animate={{
            boxShadow: [
              "0 0 20px rgba(168, 85, 247, 0.4)",
              "0 0 40px rgba(168, 85, 247, 0.6)",
              "0 0 20px rgba(168, 85, 247, 0.4)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12 w-[400px]"
        >
          {/* Ícone */}
          <motion.div
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
            className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center mb-6"
          >
            <Palette className="text-white" size={40} />
          </motion.div>

          {/* Texto */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white mb-2"
          >
            Portfolio
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-purple-300 mb-8"
          >
            2D Artist & Illustrator
          </motion.p>

          {/* Barra de progresso */}
          <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-400 to-pink-400"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut" }}
            />
          </div>
          
          <motion.p
            className="text-white/60 mt-4"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {progress}%
          </motion.p>
        </motion.div>

        {/* Decorações */}
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-10 -right-10 w-20 h-20 border-2 border-purple-400/30 rounded-full"
        />
        <motion.div
          animate={{
            rotate: -360,
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-10 -left-10 w-16 h-16 border-2 border-pink-400/30 rounded-full"
        />
      </motion.div>
    </motion.div>
  );
}
