
import React, { useState, useEffect } from 'react';
import { Book } from 'lucide-react';

interface BookLoaderProps {
  onLoadComplete: () => void;
}

const BookLoader: React.FC<BookLoaderProps> = ({ onLoadComplete }) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [bookOpen, setBookOpen] = useState(false);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        const newProgress = Math.min(prev + Math.random() * 15, 100);
        if (newProgress === 100) {
          clearInterval(interval);
          setBookOpen(true);
          setTimeout(() => {
            onLoadComplete();
          }, 1500); // Wait for book animation to complete before transitioning
        }
        return newProgress;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [onLoadComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black transition-opacity duration-1000">
      <div className="mb-8 relative">
        <div 
          className={`book-left absolute top-0 left-0 w-[100px] h-[150px] bg-dolly-purple rounded-l-md transition-transform duration-1000 origin-right transform ${
            bookOpen ? 'rotate-[-90deg]' : ''
          }`}
        />
        <div 
          className={`book-right absolute top-0 left-[100px] w-[100px] h-[150px] bg-dolly-gold rounded-r-md transition-transform duration-1000 origin-left transform ${
            bookOpen ? 'rotate-90' : ''
          }`}
        />
        <div className="book-spine absolute top-0 left-[98px] w-4 h-[150px] bg-white z-10"></div>
        <Book size={80} className="text-white relative z-20 animate-pulse-scale" />
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-4">Loading Dolly Dash</h2>
      
      <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden mb-2">
        <div 
          className="h-full bg-dolly-gold rounded-full transition-all duration-300"
          style={{ width: `${loadingProgress}%` }}
        />
      </div>
      
      <p className="text-white/70">{Math.round(loadingProgress)}%</p>
      
      <div className={`mt-8 transition-opacity duration-700 ${bookOpen ? 'opacity-100' : 'opacity-0'}`}>
        <img 
          src="/lovable-uploads/845d645e-313d-4611-86b6-e22eefb8d3d0.png" 
          alt="Dolly" 
          className="w-20 h-20 rounded-full border-2 border-dolly-gold animate-float"
        />
      </div>
    </div>
  );
};

export default BookLoader;
