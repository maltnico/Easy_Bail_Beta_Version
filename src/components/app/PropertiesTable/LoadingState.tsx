import React from 'react';

export const LoadingState: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="animate-pulse">
        <div className="h-12 bg-gray-100 border-b border-gray-200"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-50 border-b border-gray-100"></div>
        ))}
      </div>
    </div>
  );
};
