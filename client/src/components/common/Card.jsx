import React from 'react';

const Card = ({ 
  children, 
  hover = true, 
  padding = true,
  className = '',
  onClick,
  animated = true 
}) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-lg border border-subtle bg-card shadow-card transition-all duration-300 ${
        padding ? 'p-6' : ''
      } 
      ${hover ? `hover:shadow-lg ${animated ? 'hover:-translate-y-0.5' : ''}` : ''}
      ${animated && !hover ? 'animate-fade-in' : ''}
      ${onClick ? 'cursor-pointer' : ''}
      ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
