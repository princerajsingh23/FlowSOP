import { useState } from 'react';
import { Layers } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function ResilientImage({
  src,
  alt,
  className = '',
  fallbackTitle = 'FlowSOP Operations',
}: ResilientImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-slate-200 p-8 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Layers className="w-8 h-8 text-blue-400 mb-3" aria-hidden="true" />
        <p className="font-display text-sm font-semibold tracking-tight text-white">{fallbackTitle}</p>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">{alt}</p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
