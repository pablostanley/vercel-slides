import type { SVGProps } from 'react';

export function VercelMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden {...props}>
      <title>Vercel</title>
      <path fill="currentColor" fillRule="evenodd" d="m8 1 8 14H0z" clipRule="evenodd" />
    </svg>
  );
}
