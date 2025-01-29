import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-[200px]">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-12 h-12 rounded-full border-4 border-black/10 border-t-black animate-spin"></div>
        {/* Inner ring */}
        <div className="absolute top-1 left-1 w-10 h-10 rounded-full border-4 border-black/5 border-t-black animate-spin-reverse"></div>
      </div>
    </div>
  );
};

export default Loader; 