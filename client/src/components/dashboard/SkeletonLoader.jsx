import React from 'react';

const SkeletonLoader = ({ count = 3, type = 'card' }) => {
  const skeletonClass = 'bg-[color:var(--app-accent-soft)]';

  if (type === 'table-row') {
    return (
      <>
        {[...Array(count)].map((_, i) => (
          <tr key={i}>
            <td className="px-6 py-4">
              <div
                className={`h-4 rounded animate-pulse ${skeletonClass}`}
              />
            </td>
            <td className="px-6 py-4">
              <div
                className={`h-4 rounded animate-pulse ${skeletonClass}`}
              />
            </td>
            <td className="px-6 py-4">
              <div
                className={`h-4 rounded animate-pulse ${skeletonClass}`}
              />
            </td>
            <td className="px-6 py-4">
              <div
                className={`h-4 rounded animate-pulse ${skeletonClass}`}
              />
            </td>
          </tr>
        ))}
      </>
    );
  }

  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className={`h-32 rounded-lg animate-pulse ${skeletonClass}`}
        />
      ))}
    </>
  );
};

export default SkeletonLoader;
