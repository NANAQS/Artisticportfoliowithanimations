import { useState } from 'react';
import { LoadingScreen } from './components/LoadingScreen';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { ImageCarousel } from './components/ImageCarousel';
import { About } from './components/About';
import { ScrollImageSection } from './components/ScrollImageSection';
import { Gallery } from './components/Gallery';
import { ArtProcess } from './components/ArtProcess';
import { SkillsTestimonials } from './components/SkillsTestimonials';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <section id="home">
          <Hero />
        </section>
        <ImageCarousel />
        <section id="about">
          <About />
        </section>
        <ScrollImageSection />
        <section id="gallery">
          <Gallery />
        </section>
        <ArtProcess />
        <section id="skills">
          <SkillsTestimonials />
        </section>
        <section id="contact">
          <Contact />
        </section>
      </main>
      <Footer />
    </div>
  );
}
