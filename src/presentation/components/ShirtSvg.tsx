import { useId } from 'react';
import { SHIRT_SILHOUETTE, type Shirt } from '../../domain/entities/shirts';

function Pattern({ shirt, clipId }: { shirt: Shirt; clipId: string }) {
  const { base, accent, accent2, pattern } = shirt;
  return (
    <g clipPath={`url(#${clipId})`}>
      <rect x="0" y="0" width="100" height="96" fill={base} />
      {pattern === 'stripes-v' && (
        <>
          {[12, 32, 52, 72].map((x) => (
            <rect key={x} x={x} y="0" width="10" height="96" fill={accent} />
          ))}
        </>
      )}
      {pattern === 'hoops' && (
        <>
          {[10, 30, 50, 70].map((y) => (
            <rect key={y} x="0" y={y} width="100" height="9" fill={accent} />
          ))}
        </>
      )}
      {pattern === 'halves' && <rect x="50" y="0" width="50" height="96" fill={accent} />}
      {pattern === 'band-h' && <rect x="0" y="39" width="100" height="18" fill={accent} />}
      {pattern === 'sash' && (
        <g transform="rotate(28 50 48)">
          <rect x="41" y="-20" width="18" height="140" fill={accent} />
        </g>
      )}
      {pattern === 'center' && (
        <>
          <rect x="37" y="0" width="26" height="96" fill={accent} />
          {accent2 && (
            <>
              <rect x="32" y="0" width="4" height="96" fill={accent2} />
              <rect x="64" y="0" width="4" height="96" fill={accent2} />
            </>
          )}
        </>
      )}
      {pattern === 'sleeves' && (
        <>
          <polygon points="20,15 10,34 23,41 29,31" fill={accent} />
          <polygon points="80,15 90,34 77,41 71,31" fill={accent} />
        </>
      )}
    </g>
  );
}

export function ShirtSvg({ shirt, className }: { shirt: Shirt; className?: string }) {
  const rawId = useId();
  const clipId = `shirt-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <svg viewBox="0 0 100 96" className={className} role="img" aria-label={shirt.name}>
      <defs>
        <clipPath id={clipId}>
          <path d={SHIRT_SILHOUETTE} />
        </clipPath>
      </defs>
      <Pattern shirt={shirt} clipId={clipId} />
      <path d={SHIRT_SILHOUETTE} fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="2" />
      <path d="M43 9 Q50 17 57 9" fill="none" stroke={shirt.trim} strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
