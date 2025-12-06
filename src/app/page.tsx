'use client'

import { useState } from 'react'
import {
  LoadingScreen,
  Navigation,
  Hero,
  ImageCarousel,
  About,
  ScrollImageSection,
  Gallery,
  ArtProcess,
  SkillsTestimonials,
  Contact,
  Footer,
} from '@/components'
import { AdBanners } from '@/components/sections/AdBanners'
import VisitTracker from '@/components/common/VisitTracker'

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />
  }

  return (
    <div className="min-h-screen">
      <VisitTracker />
      <Navigation />
      <main>
        <AdBanners targetElement="hero" position="before" />
        <section id="home">
          <Hero />
        </section>
        <AdBanners targetElement="hero" position="after" />
        <AdBanners targetElement="carousel" position="before" />
        <ImageCarousel />
        <AdBanners targetElement="carousel" position="after" />
        <AdBanners targetElement="about" position="before" />
        <section id="about">
          <About />
        </section>
        <AdBanners targetElement="about" position="after" />
        <AdBanners targetElement="scroll" position="before" />
        <ScrollImageSection />
        <AdBanners targetElement="scroll" position="after" />
        <AdBanners targetElement="gallery" position="before" />
        <section id="gallery">
          <Gallery />
        </section>
        <AdBanners targetElement="gallery" position="after" />
        <AdBanners targetElement="art-process" position="before" />
        <ArtProcess />
        <AdBanners targetElement="art-process" position="after" />
        <AdBanners targetElement="skills" position="before" />
        <section id="skills">
          <SkillsTestimonials />
        </section>
        <AdBanners targetElement="skills" position="after" />
        <AdBanners targetElement="contact" position="before" />
        <section id="contact">
          <Contact />
        </section>
        <AdBanners targetElement="contact" position="after" />
      </main>
      <Footer />
    </div>
  )
}
