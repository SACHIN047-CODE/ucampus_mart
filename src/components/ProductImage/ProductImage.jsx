import React, { useState, useEffect } from 'react';
import { getRelevantFallbackImage, getCategorySvgFallback } from '../../utils/imageUtils';

/**
 * ProductImage component:
 * Renders product images safely, handles loading errors gracefully,
 * logs failures for debugging, and seamlessly switches to relevant fallbacks.
 */
export default function ProductImage({
  src,
  alt = '',
  product,
  category,
  className = '',
  style = {},
  loading = 'lazy',
  onClick,
  onLoad,
  ...rest
}) {
  const title = product?.title || alt || '';
  const prodCategory = product?.category || category || '';

  const getInitialSrc = () => {
    if (src && typeof src === 'string' && src.trim() !== '') {
      return src;
    }
    return getRelevantFallbackImage(title, prodCategory);
  };

  const [imgSrc, setImgSrc] = useState(getInitialSrc);
  const [attemptState, setAttemptState] = useState('initial'); // 'initial' | 'fallback' | 'svg'

  useEffect(() => {
    const newSrc = getInitialSrc();
    setImgSrc(newSrc);
    setAttemptState('initial');
  }, [src, product?.id, product?.title, product?.category]);

  const handleError = (e) => {
    const failedUrl = imgSrc;

    if (attemptState === 'initial') {
      console.warn(
        `[ProductImage Error] Failed to load primary image URL for "${title}": ${failedUrl}. Switching to relevant category fallback.`
      );
      const fallbackUrl = getRelevantFallbackImage(title, prodCategory);
      if (fallbackUrl !== failedUrl) {
        setImgSrc(fallbackUrl);
        setAttemptState('fallback');
      } else {
        const svgUrl = getCategorySvgFallback(prodCategory, title);
        setImgSrc(svgUrl);
        setAttemptState('svg');
      }
    } else if (attemptState === 'fallback') {
      console.warn(
        `[ProductImage Error] Category fallback image also failed for "${title}": ${failedUrl}. Switching to inline SVG fallback.`
      );
      const svgUrl = getCategorySvgFallback(prodCategory, title);
      setImgSrc(svgUrl);
      setAttemptState('svg');
    } else {
      console.warn(`[ProductImage Error] SVG fallback failed to render for "${title}".`);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt || title}
      className={className}
      style={{ objectFit: 'cover', ...style }}
      loading={loading}
      onClick={onClick}
      onLoad={onLoad}
      onError={handleError}
      {...rest}
    />
  );
}
