import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Rocket, 
  Trophy, 
  Share2, 
  Sparkles, 
  X, 
  Diamond,
  DollarSign,
  Download,
  Info
} from "lucide-react";
import { Link } from "react-router-dom";
import IntroScreens from "./IntroScreens";
import html2canvas from 'html2canvas';

// Define types for our game
type GameState = 'intro' | 'onboarding' | 'playing' | 'rugged' | 'complete';
type PowerUp = 'disco' | 'rocket' | 'snakeoil' | 'diamond' | 'unicorn' | null;
type MemeGuest = 'doge' | 'pepe' | 'golden' | null;

const DollyDash: React.FC = () => {
  // Game state
  const [gameState, setGameState] = useState<GameState>('intro');
  const [dollyCoins, setDollyCoins] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [currentPrice, setCurrentPrice] = useState(0.0001);
  const [highScore, setHighScore] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [priceDirection, setPriceDirection] = useState<'up' | 'down'>('up');
  const [combo, setCombo] = useState(0);
  const [powerUp, setPowerUp] = useState<PowerUp>(null);
  const [memeGuest, setMemeGuest] = useState<MemeGuest>(null);
  const [dollyPosition, setDollyPosition] = useState({ x: 50, y: 50 });
  const [tapHistory, setTapHistory] = useState<number[]>([]);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [showCoinPopup, setShowCoinPopup] = useState(false);
  const [coinPopupValue, setCoinPopupValue] = useState(0);
  const [coinPopupPosition, setCoinPopupPosition] = useState({ x: 0, y: 0 });
  
  // Refs
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const resultCardRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const powerUpTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const memeGuestTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Hooks
  const { toast } = useToast();
  
  // Initialize game
  const startGame = () => {
    setGameState('playing');
    setDollyCoins(0);
    setTimeLeft(20);
    setCurrentPrice(0.0001);
    setMultiplier(1);
    setPriceDirection('up');
    setCombo(0);
    setPowerUp(null);
    setMemeGuest(null);
    setTapHistory([]);
    
    // Start market fluctuations
    intervalRef.current = setInterval(() => {
      // Update time
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setGameState('complete');
          checkHighScore();
          return 0;
        }
        return prev - 1;
      });
      
      // Random price fluctuations
      const newDirection = Math.random() > 0.5 ? 'up' : 'down';
      setPriceDirection(newDirection);
      
      setCurrentPrice((prev) => {
        const change = Math.random() * 0.2;
        return newDirection === 'up' 
          ? parseFloat((prev * (1 + change)).toFixed(8))
          : parseFloat((prev * (1 - change * 0.7)).toFixed(8));
      });
      
      // Random power-ups and meme guests
      if (Math.random() < 0.1) {
        spawnPowerUp();
      }
      
      if (Math.random() < 0.15) {
        spawnMemeGuest();
      }
      
      // Move Dolly around randomly
      moveDollyRandomly();
      
    }, 1000);
  };
  
  // Complete onboarding
  const completeOnboarding = () => {
    setGameState('intro');
  };
  
  // Check for high score
  const checkHighScore = () => {
    const finalScore = Math.round(dollyCoins * currentPrice * multiplier * 1000) / 1000;
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('dollyDashHighScore', finalScore.toString());
      toast({
        title: "New High Score!",
        description: `You're a true Dolly Degen with ${finalScore} $DOLLY!`,
      });
    }
  };
  
  // Load high score from localStorage on component mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem('dollyDashHighScore');
    if (savedHighScore) {
      setHighScore(parseFloat(savedHighScore));
    }
    
    return () => {
      // Clean up on unmount
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (powerUpTimeoutRef.current) clearTimeout(powerUpTimeoutRef.current);
      if (memeGuestTimeoutRef.current) clearTimeout(memeGuestTimeoutRef.current);
    };
  }, []);
  
  // Handle taps
  const handleTap = (e: React.MouseEvent) => {
    if (gameState !== 'playing' || powerUp === 'snakeoil') return;
    
    // Calculate tap position relative to container
    if (gameContainerRef.current) {
      const rect = gameContainerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Check if tapped on Dolly (proximity check)
      const dollyCenterX = (dollyPosition.x / 100) * rect.width;
      const dollyCenterY = (dollyPosition.y / 100) * rect.height;
      const distance = Math.sqrt(
        Math.pow(x - dollyCenterX, 2) + Math.pow(y - dollyCenterY, 2)
      );
      
      if (distance > 60) return; // Not close enough to Dolly
      
      // Record tap time for detecting tap speed
      const now = Date.now();
      const tapSpeed = now - lastTapTime;
      setLastTapTime(now);
      
      // Check for rug pull (too fast tapping)
      setTapHistory((prev) => {
        const newHistory = [...prev, tapSpeed].slice(-5);
        
        if (
          newHistory.length >= 5 &&
          newHistory.filter((speed) => speed < 100).length >= 3 &&
          powerUp !== 'diamond'
        ) {
          setGameState('rugged');
          clearInterval(intervalRef.current!);
          toast({
            title: "Dolly got rugged!",
            description: "You tapped too fast and scared away all the liquidity!",
            variant: "destructive",
          });
          return newHistory;
        }
        
        return newHistory;
      });
      
      // Apply multipliers
      let tapMultiplier = multiplier;
      if (powerUp === 'disco') tapMultiplier *= 2;
      if (powerUp === 'rocket') tapMultiplier *= 5;
      if (memeGuest === 'golden') tapMultiplier *= 5;
      
      // Calculate coins earned from tap
      const baseCoins = 1;
      let coinsEarned = baseCoins * tapMultiplier;
      
      // Add bonus if tapping during a dip
      if (priceDirection === 'down') {
        coinsEarned *= 1.5;
        setCombo((prev) => prev + 1);
        if (combo > 0 && combo % 3 === 0) {
          coinsEarned *= 1.2;
          toast({
            title: "Combo x" + combo,
            description: "Diamond hands!",
          });
        }
      } else {
        setCombo(0);
      }
      
      // Update the coin count
      setDollyCoins((prev) => prev + coinsEarned);
      
      // Show popup with coins gained
      setCoinPopupValue(Math.round(coinsEarned * 100) / 100);
      setCoinPopupPosition({ x, y });
      setShowCoinPopup(true);
      setTimeout(() => setShowCoinPopup(false), 800);
      
      // Tap logic for power-ups and meme guests
      if (memeGuest === 'golden') {
        activateSuperMoonMode();
      }
    }
  };
  
  // Move Dolly randomly around the screen
  const moveDollyRandomly = () => {
    const newX = Math.max(10, Math.min(90, dollyPosition.x + (Math.random() - 0.5) * 30));
    const newY = Math.max(10, Math.min(90, dollyPosition.y + (Math.random() - 0.5) * 20));
    setDollyPosition({ x: newX, y: newY });
  };
  
  // Spawn power-ups
  const spawnPowerUp = () => {
    if (powerUp !== null) return;
    
    const powerUps: PowerUp[] = ['disco', 'rocket', 'snakeoil', 'diamond', 'unicorn'];
    const randomPowerUp = powerUps[Math.floor(Math.random() * powerUps.length)];
    
    setPowerUp(randomPowerUp);
    
    // Apply power-up effects
    switch (randomPowerUp) {
      case 'disco':
        toast({
          title: "Disco Dolly!",
          description: "Taps are worth double! Party time!",
        });
        break;
      case 'rocket':
        toast({
          title: "Rocket Sheep!",
          description: "Taps are worth 5x! To the moon!",
        });
        break;
      case 'snakeoil':
        toast({
          title: "Snakeoil Scammy!",
          description: "You trusted the wrong dev!",
          variant: "destructive",
        });
        break;
      case 'diamond':
        toast({
          title: "Dolly Hands!",
          description: "Immune to rug pulls for 5 seconds!",
        });
        break;
      case 'unicorn':
        toast({
          title: "Unicorn Market!",
          description: "Charts only go up! Buy buy buy!",
        });
        setPriceDirection('up');
        break;
    }
    
    // Clear power-up after delay
    powerUpTimeoutRef.current = setTimeout(() => {
      setPowerUp(null);
    }, 5000);
  };
  
  // Spawn meme guests
  const spawnMemeGuest = () => {
    if (memeGuest !== null) return;
    
    const guests: MemeGuest[] = ['doge', 'pepe', 'golden'];
    const randomGuest = guests[Math.floor(Math.random() * guests.length)];
    
    setMemeGuest(randomGuest);
    
    // Clear meme guest after delay
    memeGuestTimeoutRef.current = setTimeout(() => {
      setMemeGuest(null);
    }, 3000);
  };
  
  // Activate Super Moon Mode when golden Dolly is tapped
  const activateSuperMoonMode = () => {
    toast({
      title: "🌕 SUPER MOON MODE! 🌕",
      description: "Everything is worth 5x for 5 seconds!",
    });
    
    setMultiplier(5);
    
    setTimeout(() => {
      setMultiplier(1);
    }, 5000);
    
    setMemeGuest(null);
  };
  
  // Create and download shareable image
  const shareResults = () => {
    if (!resultCardRef.current) return;
    
    toast({
      title: "Creating your meme card...",
      description: "Almost there!",
    });
    
    html2canvas(resultCardRef.current).then(canvas => {
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `dolly-dash-score-${calculateScore()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Meme card saved!",
        description: "Share your Dolly Dash score with friends!",
      });
    }).catch(err => {
      console.error("Error generating image:", err);
      toast({
        title: "Oops!",
        description: "Couldn't create your meme card. Try again?",
        variant: "destructive",
      });
    });
  };
  
  // Calculate final score
  const calculateScore = () => {
    return Math.round(dollyCoins * currentPrice * multiplier * 1000) / 1000;
  };
  
  // Get leaderboard title based on score
  const getLeaderboardTitle = () => {
    const score = calculateScore();
    
    if (score > 1000) return "Meme Whale";
    if (score > 500) return "HODL Hero";
    if (score > 250) return "Farmer of the FOMO Fields";
    if (score > 100) return "Dolly Degen";
    return "Exit Liquidity 💀";
  };
  
  // Show onboarding screens
  const showOnboarding = () => {
    setGameState('onboarding');
  };
  
  // Render onboarding screens if in onboarding state
  if (gameState === 'onboarding') {
    return <IntroScreens onComplete={completeOnboarding} />;
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full p-4 bg-space-gradient overflow-hidden">
      {/* Game Header */}
      <div className="w-full flex justify-between items-center mb-4">
        <div className="flex flex-col items-start">
          <h2 className="text-xl font-bold text-white">
            <span className="text-dolly-gold">$DOLLY</span>: {currentPrice.toFixed(8)}
            <span className={priceDirection === 'up' ? 'price-up ml-1' : 'price-down ml-1'}>
              {priceDirection === 'up' ? '↗' : '↘'}
            </span>
          </h2>
          <div className="text-white">
            Score: <span className="text-dolly-gold font-bold">{calculateScore().toFixed(3)}</span>
          </div>
        </div>
        
        <div className="bg-black/30 px-3 py-1 rounded-full flex items-center">
          <span className="text-dolly-gold mr-1">⏱️</span>
          <span className="text-white font-bold">{timeLeft}s</span>
        </div>
        
        <div className="text-right text-white">
          <div>High Score: <span className="text-dolly-gold font-bold">{highScore.toFixed(3)}</span></div>
          <div>
            {multiplier > 1 && (
              <span className="bg-dolly-gold text-black px-2 py-0.5 rounded-full text-xs font-bold animate-pulse-scale">
                {multiplier}x MULTIPLIER
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Game Container */}
      <div
        ref={gameContainerRef}
        className={`relative w-full h-[60vh] bg-black/20 rounded-xl border-2 ${
          gameState === 'playing' ? 'border-dolly-purple cursor-pointer' : 'border-gray-700'
        } overflow-hidden`}
        onClick={gameState === 'playing' ? handleTap : undefined}
      >
        {/* Background Chart Patterns */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-dolly-green/30 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 flex justify-around">
            {[...Array(15)].map((_, i) => (
              <div 
                key={`chart-line-${i}`}
                className="h-full w-1 bg-white/10"
                style={{ 
                  height: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.5 + 0.2
                }}
              ></div>
            ))}
          </div>
        </div>
        
        {/* Intro Screen */}
        {gameState === 'intro' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white z-10 animate-fade-in">
            <h1 className="text-4xl font-bold mb-2 text-dolly-purple dolly-shadow">
              <span className="text-white">Dolly</span> Dash
            </h1>
            <p className="text-xl mb-6">Tap to Moon! 🐑💸</p>
            
            {/* Round Button with Dolly Image */}
            <div className="mb-8 w-40 h-40 rounded-full overflow-hidden border-4 border-dolly-gold shadow-lg hover-scale">
              <img 
                src="/lovable-uploads/845d645e-313d-4611-86b6-e22eefb8d3d0.png" 
                alt="Dolly" 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex flex-col space-y-4 w-full max-w-xs">
              <Button 
                onClick={showOnboarding}
                className="bg-dolly-purple hover:bg-dolly-purple/80 text-white font-bold text-lg py-6 px-8 rounded-full"
              >
                How to Play
              </Button>
              
              <Button 
                onClick={startGame}
                className="bg-dolly-gold hover:bg-dolly-gold/80 text-black font-bold text-lg py-6 px-8 rounded-full animate-pulse-scale"
              >
                Start Game
              </Button>

              <Link to="/cashout" className="mt-4">
                <Button
                  variant="outline" 
                  className="w-full border-dolly-gold text-dolly-gold hover:bg-dolly-gold/10"
                >
                  <Info size={18} className="mr-2" /> 
                  How to Cash Out (50+ $DOLLY)
                </Button>
              </Link>
            </div>
          </div>
        )}
        
        {/* Rugged Screen */}
        {gameState === 'rugged' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white z-10 animate-fade-in">
            <h1 className="text-4xl font-bold mb-2 text-dolly-red">RUGGED! 💀</h1>
            <p className="text-xl mb-6">You tapped too fast and scared away all the liquidity!</p>
            <p className="mb-6">Final Score: <span className="text-dolly-gold font-bold">{calculateScore().toFixed(3)} $DOLLY</span></p>
            
            {/* Result Card for sharing */}
            <div 
              ref={resultCardRef}
              className="bg-gradient-to-br from-dolly-purple to-dolly-pink p-1 rounded-xl mb-6 shadow-lg w-64"
            >
              <div className="bg-black p-4 rounded-lg flex flex-col items-center">
                <img 
                  src="/lovable-uploads/845d645e-313d-4611-86b6-e22eefb8d3d0.png" 
                  alt="Dolly" 
                  className="w-16 h-16 object-cover rounded-full mb-2"
                />
                <p className="text-center font-bold text-white">
                  I YOLO'd {calculateScore().toFixed(3)} $DOLLY and got rugged in 20s 💀
                </p>
                <p className="text-center text-dolly-gold">Can you fare better?</p>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <Button 
                onClick={startGame}
                className="bg-dolly-purple hover:bg-dolly-purple/80 text-white"
              >
                Try Again
              </Button>
              <Button 
                onClick={shareResults}
                className="bg-dolly-gold hover:bg-dolly-gold/80 text-black"
              >
                <Download className="mr-2 h-4 w-4" /> Save Meme
              </Button>
            </div>
          </div>
        )}
        
        {/* Game Complete Screen */}
        {gameState === 'complete' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white z-10 animate-fade-in">
            <h1 className="text-4xl font-bold mb-2 text-dolly-gold">Game Complete!</h1>
            <p className="text-xl mb-2">
              Final Score: <span className="text-dolly-gold font-bold">{calculateScore().toFixed(3)} $DOLLY</span>
            </p>
            <p className="mb-6">Title Earned: <span className="text-dolly-purple font-bold">{getLeaderboardTitle()}</span></p>
            
            {/* Meme Card for sharing */}
            <div 
              ref={resultCardRef}
              className="bg-gradient-to-br from-dolly-purple to-dolly-pink p-1 rounded-xl mb-6 shadow-lg w-64"
            >
              <div className="bg-black p-4 rounded-lg flex flex-col items-center">
                <img 
                  src="/lovable-uploads/845d645e-313d-4611-86b6-e22eefb8d3d0.png" 
                  alt="Dolly" 
                  className="w-16 h-16 object-cover rounded-full mb-2"
                />
                <p className="text-center font-bold text-white">
                  I YOLO'd {calculateScore().toFixed(3)} $DOLLY and made it rain in 20s 🐑💸
                </p>
                <p className="text-center text-dolly-gold">Can you beat me?</p>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <Button 
                onClick={startGame}
                className="bg-dolly-purple hover:bg-dolly-purple/80 text-white"
              >
                Play Again
              </Button>
              <Button 
                onClick={shareResults}
                className="bg-dolly-gold hover:bg-dolly-gold/80 text-black"
              >
                <Download className="mr-2 h-4 w-4" /> Save Meme
              </Button>
            </div>
          </div>
        )}
        
        {/* Game Characters */}
        {gameState === 'playing' && (
          <>
            {/* Dolly Character */}
            <div 
              className={`absolute pointer-events-none transition-all duration-500 ${
                powerUp === 'rocket' ? 'animate-float' : ''
              }`}
              style={{ 
                left: `${dollyPosition.x}%`, 
                top: `${dollyPosition.y}%`, 
                transform: 'translate(-50%, -50%)' 
              }}
            >
              {/* Power-up visual effects */}
              {powerUp === 'disco' && (
                <div className="absolute inset-0 -m-2 rounded-full bg-dolly-purple animate-pulse-scale opacity-50"></div>
              )}
              {powerUp === 'rocket' && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                  <Rocket size={24} className="text-dolly-red animate-pulse-scale" />
                </div>
              )}
              {powerUp === 'diamond' && (
                <div className="absolute inset-0 -m-4 rounded-full border-2 border-dolly-gold animate-spin-slow opacity-50"></div>
              )}
              
              {/* Dolly image instead of emoji */}
              <div className={`w-20 h-20 ${
                memeGuest === 'golden' 
                  ? 'dolly-gold-shadow' 
                  : powerUp ? 'dolly-shadow' : ''
              }`}>
                <img 
                  src="/lovable-uploads/845d645e-313d-4611-86b6-e22eefb8d3d0.png" 
                  alt="Dolly" 
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>
            
            {/* Meme Guests */}
            {memeGuest === 'doge' && (
              <div 
                className="absolute text-4xl animate-bounce-in"
                style={{ 
                  left: `${Math.random() * 80 + 10}%`, 
                  top: `${Math.random() * 80 + 10}%`, 
                  transform: 'translate(-50%, -50%)' 
                }}
              >
                🐕
              </div>
            )}
            
            {memeGuest === 'pepe' && (
              <div 
                className="absolute text-4xl animate-bounce-in"
                style={{ 
                  left: `${Math.random() * 80 + 10}%`, 
                  top: `${Math.random() * 80 + 10}%`, 
                  transform: 'translate(-50%, -50%)' 
                }}
              >
                🐸
              </div>
            )}
            
            {/* Golden Dolly */}
            {memeGuest === 'golden' && (
              <div 
                className="absolute animate-bounce-in"
                style={{ 
                  left: `${Math.random() * 80 + 10}%`, 
                  top: `${Math.random() * 80 + 10}%`, 
                  transform: 'translate(-50%, -50%)' 
                }}
              >
                <div className="w-16 h-16 rounded-full golden-glow">
                  <img 
                    src="/lovable-uploads/12effa93-d57b-4fb1-9e9c-16f42a0a3bfd.png" 
                    alt="Golden Dolly" 
                    className="w-full h-full object-cover rounded-full border-2 border-dolly-gold"
                  />
                </div>
              </div>
            )}
            
            {/* Power-up indicators */}
            {powerUp === 'snakeoil' && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 py-1 px-3 rounded-full">
                <span className="text-dolly-red flex items-center">
                  <X size={16} className="mr-1" /> Taps Disabled
                </span>
              </div>
            )}
            
            {powerUp === 'unicorn' && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 py-1 px-3 rounded-full">
                <span className="text-dolly-green flex items-center">
                  <DollarSign size={16} className="mr-1" /> Unicorn Market
                </span>
              </div>
            )}
            
            {/* Coin popup when tapping */}
            {showCoinPopup && (
              <div 
                className="absolute pointer-events-none font-bold animate-fade-out"
                style={{
                  left: `${coinPopupPosition.x}px`,
                  top: `${coinPopupPosition.y}px`,
                  transform: 'translate(-50%, -100%)'
                }}
              >
                <span className="text-dolly-gold text-xl">
                  +{coinPopupValue.toFixed(2)} $DOLLY
                </span>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Game Info */}
      <div className="w-full mt-4">
        <div className="bg-black/30 rounded-lg p-3 text-white">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-dolly-gold mr-1">$DOLLY:</span>
              <span className="font-bold">{dollyCoins.toFixed(2)}</span>
            </div>
            
            <div className="flex items-center">
              {combo > 1 && (
                <div className="bg-dolly-purple px-2 py-0.5 rounded-full text-xs font-bold mx-2">
                  COMBO x{combo}
                </div>
              )}
              
              {powerUp && (
                <div className={`px-2 py-0.5 rounded-full text-xs font-bold mx-2 ${
                  powerUp === 'snakeoil' ? 'bg-dolly-red' : 'bg-dolly-gold text-black'
                }`}>
                  {powerUp === 'disco' && <span><Sparkles size={12} className="inline mr-1" /> DISCO</span>}
                  {powerUp === 'rocket' && <span><Rocket size={12} className="inline mr-1" /> ROCKET</span>}
                  {powerUp === 'snakeoil' && <span><X size={12} className="inline mr-1" /> SNAKEOIL</span>}
                  {powerUp === 'diamond' && <span><Diamond size={12} className="inline mr-1" /> DIAMOND</span>}
                  {powerUp === 'unicorn' && <span><DollarSign size={12} className="inline mr-1" /> UNICORN</span>}
                </div>
              )}
              
              <div className="flex items-center">
                <Trophy size={16} className="text-dolly-gold mr-1" />
                <span className="font-bold">{getLeaderboardTitle()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DollyDash;
