'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pixelify_Sans } from 'next/font/google';
import { OptimizedParticleSystem } from './OptimizedParticleSystem';

const pixelifySans = Pixelify_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
});

export const MailBackground = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Email:', email, 'Name:', name);
    // Add your email submission logic here
  };

  return (
    <div className="relative min-h-screen w-full mail-section overflow-hidden flex items-center justify-center bg-black">
      <OptimizedParticleSystem 
        imagePath="/image18.png" 
        sectionClassName="mail-section"
        intensity={0.6}
      />

      {/* Email Signup Form */}
      <div className="relative z-10 text-center max-w-2xl mx-auto px-8 py-14 pointer-events-auto">
        {/* Glass morphed card with purple shade */}
        <motion.div
          className="bg-purple-900/30 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            className='text-4xl font-bold text-orange-400 mb-14'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Be the first to support us!
          </motion.h1>

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-6 py-4 bg-white text-gray-800 rounded-full border-none outline-none text-lg placeholder-gray-500 shadow-md"
              required
            />

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-6 py-4 bg-white text-gray-800 rounded-full border-none outline-none text-lg placeholder-gray-500 shadow-md mb-8"
              required
            />

            <motion.button
              type="submit"
              className="w-full px-6 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-semibold text-lg transition-colors duration-200 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Join the Waitlist
            </motion.button>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
};