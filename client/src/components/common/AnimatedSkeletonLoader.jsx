import React from 'react';

const AnimatedSkeletonLoader = ({ count = 1, type = 'card', className = '' }) => {
  const bgColor = 'bg-[color:var(--app-accent-soft)]';

  if (type === 'card') {
    return (
      <>
        {[...Array(count)].map((_, i) => (
          <div
            key={i}
            className={`h-32 rounded-lg ${bgColor} animate-pulse ${className}`}
            style={{
              animation: `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
              animationDelay: `${i * 100}ms`,
            }}
          />
        ))}
      </>
    );
  }

  if (type === 'table-row') {
    return (
      <>
        {[...Array(count)].map((_, i) => (
          <tr key={i} className="border-b border-subtle">
            <td className="px-6 py-4">
              <div
                className={`h-4 w-24 rounded ${bgColor} animate-pulse`}
                style={{
                  animation: `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
                  animationDelay: `${i * 100}ms`,
                }}
              />
            </td>
            <td className="px-6 py-4">
              <div
                className={`h-4 w-32 rounded ${bgColor} animate-pulse`}
                style={{
                  animation: `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
                  animationDelay: `${i * 100}ms`,
                }}
              />
            </td>
            <td className="px-6 py-4">
              <div
                className={`h-4 w-20 rounded ${bgColor} animate-pulse`}
                style={{
                  animation: `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
                  animationDelay: `${i * 100}ms`,
                }}
              />
            </td>
            <td className="px-6 py-4">
              <div
                className={`h-4 w-24 rounded ${bgColor} animate-pulse`}
                style={{
                  animation: `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
                  animationDelay: `${i * 100}ms`,
                }}
              />
            </td>
          </tr>
        ))}
      </>
    );
  }

  if (type === 'line') {
    return (
      <div className="space-y-3">
        {[...Array(count)].map((_, i) => (
          <div
            key={i}
            className={`h-3 rounded ${bgColor} animate-pulse`}
            style={{
              animation: `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
              animationDelay: `${i * 100}ms`,
              width: `${80 - (i % 4) * 10}%`,
            }}
          />
        ))}
      </div>
    );
  }

  return null;
};

export default AnimatedSkeletonLoader;
