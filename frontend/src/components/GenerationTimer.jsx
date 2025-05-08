import React from 'react';
import { COLORS } from '../lib/constants';

//logic for setting up timer
const GenerationTimer = ({ nextTime, type }) => {
  const formatTimeRemaining = (nextTime) => {
    if (!nextTime) return "No previous generation";
    
    const now = new Date();
    const diff = nextTime - now;
    
    if (diff <= 0) return "Available now!";
    
    //sets hours minutes and seconds for timer
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours}h ${minutes}m ${seconds}s remaining`;
  };

  return (
    <div className="w-full sm:w-auto">
      <div className="text-center p-4 rounded-lg border transition-all duration-300 hover:scale-105"
           style={{ 
             backgroundColor: COLORS.BLACK,
             borderColor: `${COLORS.NEON_GREEN}40`,
             boxShadow: `0 0 8px ${COLORS.NEON_GREEN}20`
           }}>
        <h3 className="text-sm font-medium mb-2" style={{ color: `${COLORS.NEON_GREEN}CC` }}>
          Next {type} Generation
        </h3>
        <p className="text-lg font-bold" style={{ color: COLORS.WHITE }}>
          {formatTimeRemaining(nextTime)}
        </p>
      </div>
    </div>
  );
};

export default GenerationTimer;
