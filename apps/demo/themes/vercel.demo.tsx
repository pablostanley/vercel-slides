import { type DesignSystem, type Page, useSlidePageNumber } from '@open-slide/core';
import type { ReactNode } from 'react';

export const design: DesignSystem = {
  palette: { bg: '#000000', text: '#FFFFFF', accent: '#0070F3' },
  fonts: {
    display: "'Geist Sans', 'Geist', -apple-system, BlinkMacSystemFont, sans-serif",
    body: "'Geist Sans', 'Geist', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  typeScale: { hero: 152, body: 34 },
  radius: 8,
};

const styles = `
@keyframes vercel-enter {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .vercel-enter { animation-duration: 1ms !important; transform: none !important; }
}
`;

const page: React.CSSProperties = {
  width: '100%',
  height: '100%',
  boxSizing: 'border-box',
  position: 'relative',
  overflow: 'hidden',
  background: 'var(--osd-bg)',
  color: 'var(--osd-text)',
  fontFamily: 'var(--osd-font-body)',
};

const Title = ({ children }: { children: ReactNode }) => (
  <h1
    style={{
      margin: 0,
      maxWidth: 1500,
      color: '#FFFFFF',
      fontFamily: "'Geist Sans', 'Geist', -apple-system, BlinkMacSystemFont, sans-serif",
      fontSize: 152,
      fontWeight: 600,
      lineHeight: 0.96,
      letterSpacing: '-0.055em',
    }}
  >
    {children}
  </h1>
);

const Footer = ({ label = 'Vercel' }: { label?: string }) => {
  const { current, total } = useSlidePageNumber();
  return (
    <div
      style={{
        position: 'absolute',
        left: 120,
        right: 120,
        bottom: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: '#666666',
        fontFamily: "'Geist Mono', 'SFMono-Regular', Consolas, monospace",
        fontSize: 18,
        lineHeight: 1,
        letterSpacing: '0.04em',
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
        <span style={{ color: '#FFFFFF', fontSize: 14 }}>▲</span>
        {label}
      </span>
      <span>
        {String(current).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </span>
    </div>
  );
};

const Eyebrow = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      color: '#A1A1A1',
      fontFamily: "'Geist Mono', 'SFMono-Regular', Consolas, monospace",
      fontSize: 18,
      fontWeight: 500,
      lineHeight: 1.2,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
    }}
  >
    {children}
  </div>
);

const Cover: Page = () => (
  <div
    style={{
      ...page,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 40,
      padding: '96px 120px',
    }}
  >
    <style>{styles}</style>
    <div className="vercel-enter" style={{ display: 'contents' }}>
      <Eyebrow>Internal · 2026</Eyebrow>
      <Title>Build what comes next.</Title>
      <p
        style={{
          maxWidth: 1120,
          margin: 0,
          color: '#A1A1A1',
          fontSize: 34,
          lineHeight: 1.45,
          letterSpacing: '-0.02em',
        }}
      >
        A presentation system for clear ideas, strong evidence, and Vercel products.
      </p>
    </div>
    <Footer label="Vercel presentation" />
  </div>
);

const Content: Page = () => (
  <div style={{ ...page, padding: '96px 120px' }}>
    <style>{styles}</style>
    <div className="vercel-enter">
      <Eyebrow>One idea per slide</Eyebrow>
      <h2
        style={{
          maxWidth: 1220,
          margin: '40px 0 0',
          fontSize: 72,
          fontWeight: 600,
          lineHeight: 1.08,
          letterSpacing: '-0.04em',
        }}
      >
        Let the hierarchy do the work.
      </h2>
      <div
        style={{
          width: '100%',
          height: 1,
          marginTop: 72,
          background: '#333333',
        }}
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 96,
          marginTop: 56,
        }}
      >
        <p style={{ margin: 0, fontSize: 34, lineHeight: 1.45, letterSpacing: '-0.02em' }}>
          Lead with the claim. Keep the title direct enough to say out loud.
        </p>
        <p
          style={{
            margin: 0,
            color: '#A1A1A1',
            fontSize: 34,
            lineHeight: 1.45,
            letterSpacing: '-0.02em',
          }}
        >
          Use muted text for context, not for the point the audience needs to remember.
        </p>
      </div>
    </div>
    <Footer label="Vercel presentation" />
  </div>
);

const Closer: Page = () => (
  <div
    style={{
      ...page,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '96px 120px',
      textAlign: 'center',
    }}
  >
    <style>{styles}</style>
    <div className="vercel-enter">
      <div style={{ fontSize: 64, lineHeight: 1, marginBottom: 48 }}>▲</div>
      <h2
        style={{
          maxWidth: 1320,
          margin: 0,
          fontSize: 96,
          fontWeight: 600,
          lineHeight: 1.02,
          letterSpacing: '-0.05em',
        }}
      >
        Ship the clearest version.
      </h2>
    </div>
    <Footer label="Vercel presentation" />
  </div>
);

export default [Cover, Content, Closer] satisfies Page[];
