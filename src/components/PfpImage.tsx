import React, { useState, useEffect, memo } from "react";
import { GLOBAL_PFP, PFP_CANDIDATES, cn } from "../constants";

export interface PfpImageProps {
  src?: string;
  alt?: string;
  className?: string;
  fallbackSvg?: string;
  candidateUrls?: string[];
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  [key: string]: any;
}

export const PfpImage = memo(({
  src = GLOBAL_PFP,
  alt = "virex",
  className,
  fallbackSvg = "/favicon.svg",
  candidateUrls = PFP_CANDIDATES,
  onError,
  ...props
}: PfpImageProps) => {
  // Start with preferred/resolved source
  const [currentSrc, setCurrentSrc] = useState(src);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [hasFailedAll, setHasFailedAll] = useState(false);

  // Sync if src changes
  useEffect(() => {
    setCurrentSrc(src);
    setCandidateIndex(0);
    setHasFailedAll(false);
  }, [src]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // Try next candidate
    const remainingCandidates = candidateUrls.filter(url => url !== currentSrc);
    if (candidateIndex < remainingCandidates.length) {
      const nextCandidate = remainingCandidates[candidateIndex];
      setCandidateIndex(prev => prev + 1);
      setCurrentSrc(nextCandidate);
    } else {
      setHasFailedAll(true);
      onError?.(e);
    }
  };

  if (hasFailedAll) {
    return (
      <img
        src={fallbackSvg}
        alt={alt}
        className={cn("w-10 h-10 p-1 transition-transform group-hover/pfp:scale-110", className)}
        referrerPolicy="no-referrer"
        {...props}
      />
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      onError={handleError}
      className={className}
      referrerPolicy="no-referrer"
      {...props}
    />
  );
});

export default PfpImage;
