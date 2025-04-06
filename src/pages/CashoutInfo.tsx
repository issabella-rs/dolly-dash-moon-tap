
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Gift, Coins, Wallet } from "lucide-react";

const CashoutInfo = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full p-4 bg-space-gradient overflow-hidden">
      <div className="max-w-md w-full bg-black/50 rounded-2xl p-6 border-2 border-dolly-gold shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-dolly-gold shadow-lg">
            <img 
              src="/lovable-uploads/845d645e-313d-4611-86b6-e22eefb8d3d0.png" 
              alt="Dolly" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center text-dolly-gold mb-6">
          How To Cash Out
        </h1>
        
        <div className="space-y-6 mb-8">
          <div className="flex items-center gap-4 p-3 bg-black/30 rounded-lg">
            <div className="bg-dolly-purple p-2 rounded-full">
              <Coins className="text-white h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-white">Collect 50 $DOLLY</h3>
              <p className="text-gray-300 text-sm">Play the game until you reach at least 50 $DOLLY</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-3 bg-black/30 rounded-lg">
            <div className="bg-dolly-purple p-2 rounded-full">
              <Wallet className="text-white h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-white">Connect Your Wallet</h3>
              <p className="text-gray-300 text-sm">Link a supported crypto wallet to receive your $DOLLY</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-3 bg-black/30 rounded-lg">
            <div className="bg-dolly-purple p-2 rounded-full">
              <Gift className="text-white h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-white">Claim Your Reward</h3>
              <p className="text-gray-300 text-sm">Once eligible, hit the CASH OUT button on your profile</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => navigate("/")}
            className="bg-dolly-gold hover:bg-dolly-gold/80 text-black font-bold py-3 w-full"
          >
            Start Playing <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <p className="text-center text-sm text-gray-400 mt-2">
            Note: $DOLLY rewards are for entertainment purposes only
          </p>
        </div>
      </div>
    </div>
  );
};

export default CashoutInfo;
