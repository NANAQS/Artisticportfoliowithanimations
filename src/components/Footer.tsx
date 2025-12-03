import { motion } from 'motion/react';
import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-950 text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 text-slate-400"
          >
            <span>Made with</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Heart className="text-red-500 fill-red-500" size={16} />
            </motion.div>
            <span>by Creative Portfolio</span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-slate-500"
          >
            © 2025 Artist Portfolio. All rights reserved
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex gap-6 mt-4"
          >
            {['Instagram', 'Twitter', 'ArtStation', 'Behance'].map((social, index) => (
              <motion.a
                key={social}
                href="#"
                className="text-slate-500 hover:text-purple-400 transition-colors"
                whileHover={{ y: -3 }}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                {social}
              </motion.a>
            ))}
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
