import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Code, Palette, Sparkles } from 'lucide-react';

export function About() {
  const skills = [
    {
      icon: <Palette className="w-6 h-6" />,
      title: "Digital Illustration",
      description: "Creating vibrant digital artwork with depth and emotion"
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: "Character Design",
      description: "Bringing unique characters to life with personality and detail"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Concept Art",
      description: "Developing visual concepts for games, films, and stories"
    }
  ];

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-black via-zinc-950 to-black">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4 }}
              >
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1610206349499-c932c3b3aacb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMHdvcmtzcGFjZSUyMHN0dWRpb3xlbnwxfHx8fDE3NjE2NzkyMzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Creative workspace"
                  className="w-full h-[500px] object-cover"
                />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/30 to-transparent" />
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-purple-900/30 rounded-2xl -z-10 blur-xl" />
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-purple-400 tracking-wide uppercase mb-4">About Me</p>
            <h2 className="mb-6 text-white">
              Passion for Visual Storytelling
            </h2>
            <p className="text-gray-300 mb-6">
              I'm a professional 2D artist and illustrator with over 5 years of experience creating captivating 
              artwork across various styles and mediums. From character design to landscapes, my work brings 
              stories and emotions to life through color, composition, and creativity.
            </p>
            <p className="text-gray-300 mb-8">
              Every piece I create is a journey of imagination and technique. I specialize in digital illustration, 
              concept art, and character design, working with clients worldwide to transform their visions into 
              stunning visual narratives.
            </p>

            {/* Skills Grid */}
            <div className="space-y-4">
              {skills.map((skill, index) => (
                <motion.div
                  key={skill.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4 p-4 rounded-xl bg-white/5 hover:bg-purple-900/20 border border-white/10 hover:border-purple-500/30 transition-all duration-300"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400">
                    {skill.icon}
                  </div>
                  <div>
                    <h3 className="text-white mb-1">{skill.title}</h3>
                    <p className="text-gray-400">{skill.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
