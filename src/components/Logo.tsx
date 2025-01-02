import { Brain } from "lucide-react";

export const Logo = () => {
  return (
    <div className="relative inline-flex items-center">
      {/* Hedgehog shape using CSS */}
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 bg-secondary rounded-full"></div>
        {/* Spikes */}
        <div className="absolute -top-1 -left-1 w-2 h-2 bg-secondary transform rotate-45"></div>
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-secondary transform rotate-45"></div>
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-secondary transform rotate-45"></div>
        {/* Face */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="flex space-x-2">
            <div className="w-1 h-1 bg-black rounded-full"></div>
            <div className="w-1 h-1 bg-black rounded-full"></div>
          </div>
        </div>
      </div>
      {/* Brain icon overlapping */}
      <Brain 
        className="ml-4 text-accent" 
        size={24}
      />
      <span className="ml-2 text-lg font-bold text-secondary">HedgehogAI</span>
    </div>
  );
};