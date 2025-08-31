import React, { useState, useEffect } from 'react';
import { Package, Loader2 } from 'lucide-react';

interface ImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  showLoading?: boolean;
  loadingClassName?: string;
  errorClassName?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const ImageComponent: React.FC<ImageProps> = ({
  src,
  alt,
  className = '',
  fallbackSrc = '/image/placeholder.svg',
  showLoading = true,
  loadingClassName = 'flex items-center justify-center bg-gray-100',
  errorClassName = 'flex items-center justify-center bg-gray-200',
  onLoad,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    if (!hasError) {
      setHasError(true);
      setCurrentSrc(fallbackSrc);
    }
    onError?.();
  };

  if (isLoading && showLoading) {
    return (
      <div className={`${loadingClassName} ${className}`}>
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={`${errorClassName} ${className}`}>
        <Package className="h-8 w-8 text-gray-400" />
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onLoad={handleLoad}
      onError={handleError}
      style={{ display: isLoading ? 'none' : 'block' }}
    />
  );
};

export const Image = React.memo(ImageComponent);
