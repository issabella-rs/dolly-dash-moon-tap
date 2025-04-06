
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface IntroScreensProps {
  onComplete: () => void;
}

const IntroScreens: React.FC<IntroScreensProps> = ({ onComplete }) => {
  const [currentScreen, setCurrentScreen] = useState(0);
  
  const screens = [
    {
      title: "Welcome to Dolly Dash!",
      image: "/lovable-uploads/845d645e-313d-4611-86b6-e22eefb8d3d0.png",
      text: "Tap Dolly to make her go to the moon! 🚀",
      bgColor: "bg-gradient-to-br from-dolly-purple to-dolly-pink"
    },
    {
      title: "GETS 6 UPVOTES",
      image: "/lovable-uploads/12effa93-d57b-4fb1-9e9c-16f42a0a3bfd.png",
      text: "bruh you al sleeping on me",
      bgColor: "bg-[#FCCA46]"
    },
    {
      title: "Don't Tap Too Fast!",
      image: "/lovable-uploads/845d645e-313d-4611-86b6-e22eefb8d3d0.png",
      text: "Or you'll get RUGGED 💀",
      bgColor: "bg-gradient-to-br from-dolly-gold to-dolly-red"
    }
  ];
  
  const nextScreen = () => {
    if (currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      onComplete();
    }
  };
  
  const currentData = screens[currentScreen];
  
  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center ${currentData.bgColor} p-6 animate-fade-in`}>
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center text-black">
        {currentData.title}
      </h1>
      
      <div className="relative mb-8 w-64 h-64 flex items-center justify-center">
        <img 
          src={currentData.image} 
          alt="Dolly Meme" 
          className="max-w-full max-h-full rounded-full object-cover border-4 border-white shadow-lg animate-scale-in"
        />
      </div>
      
      <p className="text-xl md:text-2xl mb-8 text-center text-black font-bold">
        {currentData.text}
      </p>
      
      <Button
        onClick={nextScreen}
        className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-8 rounded-full text-lg flex items-center"
      >
        {currentScreen < screens.length - 1 ? 'Next' : 'Start Game'}
        <ChevronRight className="ml-1 h-5 w-5" />
      </Button>
      
      <div className="mt-8 flex space-x-2">
        {screens.map((_, index) => (
          <div 
            key={index} 
            className={`w-3 h-3 rounded-full ${currentScreen === index ? 'bg-black' : 'bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default IntroScreens;
