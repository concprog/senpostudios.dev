'use client';
import { Pixelify_Sans } from 'next/font/google';
import { Instagram, MessageCircle, Youtube, Linkedin } from 'lucide-react';
import { OptimizedParticleSystem } from './OptimizedParticleSystem';

const pixelifySans = Pixelify_Sans({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
});

export const Contact = () => {
  return (
    <div className="relative min-h-screen w-full contact-section overflow-hidden">
      <OptimizedParticleSystem 
        imagePath="/image17.png" 
        sectionClassName="contact-section"
        intensity={0.5}
      />
      
      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col justify-end pointer-events-none ">
        <footer className="p-8  backdrop-blur-lg bg-purple-900/20 border border-purple-400/20 shadow-2xl pointer-events-auto pb-60 pt-12 ">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between ">
            {/* Studio Name */}
            <div className="text-white text-center lg:text-left">
              <h1 className="text-5xl  font-bold text-purple-100 mb-4">Senpo</h1>
              <p className="text-5xl  font-bold text-purple-100">Studios</p>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col items-center gap-4">
              <a 
                href="#home" 
                className="text-purple-100 hover:text-purple-200 transition-colors text-3xl font-medium hover:scale-105 transform duration-200 "
              >
                Home
              </a>
              <a 
                href="#projects" 
                className="text-purple-100 hover:text-purple-200 transition-colors text-3xl font-medium hover:scale-105 transform duration-200"
              >
                Projects
              </a>
              <a 
                href="#contact" 
                className="text-purple-100 hover:text-purple-200 transition-colors text-3xl font-medium hover:scale-105 transform duration-200"
              >
                Contact
              </a>
            </nav>

            {/* Social Icons */}
            <div className="flex flex-row items-center gap-20">
              <a 
                href="#" 
                className="text-purple-100 hover:text-purple-200 transition-all duration-200 hover:scale-110 transform"
                aria-label="Instagram"
              >
                <Instagram size={60} />
              </a>
              <a 
                href="#" 
                className="text-purple-100 hover:text-purple-200 transition-all duration-200 hover:scale-110 transform"
                aria-label="WhatsApp"
              >
                <MessageCircle size={60} />
              </a>
              <a 
                href="#" 
                className="text-purple-100 hover:text-purple-200 transition-all duration-200 hover:scale-110 transform"
                aria-label="YouTube"
              >
                <Youtube size={60} />
              </a>
              <a 
                href="#" 
                className="text-purple-100 hover:text-purple-200 transition-all duration-200 hover:scale-110 transform"
                aria-label="LinkedIn"
              >
                <Linkedin size={60} />
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};