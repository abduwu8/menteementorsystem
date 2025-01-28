import React, { useMemo } from 'react';

const SquaresBackground: React.FC = () => {
  // Memoize the squares array so it doesn't regenerate on re-renders
  const squares = useMemo(() => 
    [...Array(144)].map((_, i) => ({
      key: i,
      delay: `${Math.random() * 8}s`
    })),
    [] // Empty dependency array means this will only be calculated once
  );

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0">
        {/* Grid container */}
        <div className="h-full w-full grid grid-cols-12 gap-1">
          {squares.map(({ key, delay }) => (
            <div
              key={key}
              className="aspect-square bg-white opacity-0 animate-pulse-fade"
              style={{
                animationDelay: delay,
                animationDuration: '4s',
                animationIterationCount: 'infinite',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Prevent unnecessary re-renders
export default React.memo(SquaresBackground); 