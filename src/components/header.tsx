import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-4 px-8">
      {/* Content */}
      <div className="relative z-10 flex justify-end items-center max-w-7xl mx-auto">
        {/* Navigation with glassmorphism background */}
        <nav className="relative">
          {/* Glassmorphism background only for nav */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-md border border-white/10 rounded-full" />
          
          <ul className="relative z-10 flex space-x-12 px-10 py-4">
            {['Home', 'Projects', 'Contact'].map((item) => (
              <li key={item}>
                <a
                  href="#"
                  className="text-white/90 hover:text-white transition-all duration-300 font-medium tracking-wide relative group text-sm"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full" />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;