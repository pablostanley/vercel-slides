import geistMonoFont from '@assets/vercel/fonts/GeistMonoVF.woff2';
import geistPixelFont from '@assets/vercel/fonts/GeistPixel-Square.woff2';
import geistSansFont from '@assets/vercel/fonts/GeistVF.woff2';
import lilPixEnter from '@assets/vercel/lil-pix/enter.gif';
import lilPixWaving from '@assets/vercel/lil-pix/waving.gif';
import aiGateway from '@assets/vercel/logos/ai-gateway-dark.svg';
import aiSdk from '@assets/vercel/logos/ai-sdk-dark.svg';
import eve from '@assets/vercel/logos/eve-dark.svg';
import fx from '@assets/vercel/logos/fx-dark.svg';
import geist from '@assets/vercel/logos/geist-dark.svg';
import lilPix from '@assets/vercel/logos/logo-lil-pix-dark.svg';
import v0 from '@assets/vercel/logos/logo-v0-wide-dark.svg';
import vercelMark from '@assets/vercel/logos/logo-vercel-dark.svg';
import nextjs from '@assets/vercel/logos/nextjs-logotype-dark.svg';
import turbo from '@assets/vercel/logos/turbo-logotype-dark.svg';
import turbopack from '@assets/vercel/logos/turbopack-logotype-dark.svg';
import turborepo from '@assets/vercel/logos/turborepo-logotype-dark.svg';
import vercelWordmark from '@assets/vercel/logos/vercel-logotype-dark.svg';
import workflow from '@assets/vercel/logos/workflow-dark.svg';
import pixelAiSdk from '@assets/vercel/pixels/pixel-ai-sdk-dark.svg';
import pixelFunction from '@assets/vercel/pixels/pixel-function-dark.svg';
import pixelGlobe from '@assets/vercel/pixels/pixel-globe-dark.svg';
import pixelLayout from '@assets/vercel/pixels/pixel-layout-dark.svg';
import pixelNext from '@assets/vercel/pixels/pixel-logo-next-dark.svg';
import pixelTurbopack from '@assets/vercel/pixels/pixel-logo-turbopack-dark.svg';
import pixelTurborepo from '@assets/vercel/pixels/pixel-logo-turborepo-dark.svg';
import pixelV0 from '@assets/vercel/pixels/pixel-logo-v0-dark.svg';
import pixelServers from '@assets/vercel/pixels/pixel-servers-dark.svg';
import pixelSparkles from '@assets/vercel/pixels/pixel-sparkles-dark.svg';
import pixelStatus from '@assets/vercel/pixels/pixel-status-dark.svg';
import pixelVercel from '@assets/vercel/pixels/pixel-vercel-dark.svg';
import {
  type DesignSystem,
  ImagePlaceholder,
  type Page,
  type SlideMeta,
  useSlidePageNumber,
} from '@open-slide/core';
import type { CSSProperties, ReactNode } from 'react';

export const design: DesignSystem = {
  palette: { bg: '#000000', text: '#FFFFFF', accent: '#0070F3' },
  fonts: {
    display: "'Geist Sans', 'Geist', -apple-system, BlinkMacSystemFont, sans-serif",
    body: "'Geist Sans', 'Geist', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  typeScale: { hero: 144, body: 32 },
  radius: 8,
};

const palette = {
  surface: '#111111',
  surfaceRaised: '#1A1A1A',
  muted: '#A1A1A1',
  faint: '#666666',
  hairline: '#333333',
  line: '#1F1F1F',
  blue: '#0070F3',
  cyan: '#50E3C2',
  amber: '#F5A623',
  red: '#E5484D',
  green: '#46A758',
};

const fonts = {
  sans: "'Geist Sans', 'Geist', -apple-system, BlinkMacSystemFont, sans-serif",
  mono: "'Geist Mono', 'SFMono-Regular', Consolas, monospace",
  pixel: "'Geist Pixel', 'Geist Mono', monospace",
};

const layout = {
  inset: 120,
  brandTop: 60,
  footerBottom: 36,
  contentTop: 112,
  contentBottom: 88,
};

const FONT_STYLE_ID = 'osd-font-vercel-starter';
if (typeof document !== 'undefined' && !document.getElementById(FONT_STYLE_ID)) {
  const style = document.createElement('style');
  style.id = FONT_STYLE_ID;
  style.textContent = `
@font-face { font-family: 'Geist Sans'; src: url('${geistSansFont}') format('woff2-variations'); font-style: normal; font-weight: 100 900; font-display: swap; }
@font-face { font-family: 'Geist Mono'; src: url('${geistMonoFont}') format('woff2-variations'); font-style: normal; font-weight: 100 900; font-display: swap; }
@font-face { font-family: 'Geist Pixel'; src: url('${geistPixelFont}') format('woff2'); font-style: normal; font-weight: 400; font-display: swap; }
`;
  document.head.appendChild(style);
}

const animationStyles = `
@keyframes vercel-starter-enter {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.vercel-starter-enter { animation: vercel-starter-enter 220ms cubic-bezier(0.2, 0, 0, 1) both; }
@media (prefers-reduced-motion: reduce) {
  .vercel-starter-enter { animation-duration: 1ms !important; transform: none !important; }
}
`;

const fill: CSSProperties = {
  width: '100%',
  height: '100%',
  boxSizing: 'border-box',
  position: 'relative',
  overflow: 'hidden',
  background: 'var(--osd-bg)',
  color: 'var(--osd-text)',
  fontFamily: 'var(--osd-font-body)',
  fontFeatureSettings: '"rlig" 1, "calt" 0, "ss11" 1',
  fontKerning: 'normal',
  fontOpticalSizing: 'auto',
  textRendering: 'geometricPrecision',
  WebkitFontSmoothing: 'antialiased',
};

const Footer = ({ label = 'Vercel presentation' }: { label?: string }) => {
  const { current, total } = useSlidePageNumber();
  return (
    <div
      style={{
        position: 'absolute',
        left: layout.inset,
        right: layout.inset,
        bottom: layout.footerBottom,
        zIndex: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: palette.faint,
        fontFamily: fonts.mono,
        fontSize: 17,
        lineHeight: 1,
        letterSpacing: '0.02em',
        fontFeatureSettings: '"tnum" 1, "ss11" 1',
      }}
    >
      <span>{label}</span>
      <span>
        {String(current).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </span>
    </div>
  );
};

const Brand = ({ placement = 'right' }: { placement?: 'left' | 'right' }) => (
  <img
    src={vercelWordmark}
    alt="Vercel"
    style={{
      position: 'absolute',
      top: layout.brandTop,
      ...(placement === 'left' ? { left: layout.inset } : { right: layout.inset }),
      zIndex: 3,
      width: 144,
      height: 'auto',
    }}
  />
);

const SlideFrame = ({
  children,
  label,
  padding = `${layout.contentTop}px ${layout.inset}px ${layout.contentBottom}px`,
  framed = false,
}: {
  children: ReactNode;
  label?: string;
  padding?: string;
  framed?: boolean;
}) => (
  <div style={{ ...fill, padding }}>
    <style>{animationStyles}</style>
    {framed ? <FrameGrid /> : null}
    <Brand />
    <div
      className="vercel-starter-enter"
      style={{ position: 'relative', zIndex: 2, height: '100%' }}
    >
      {children}
    </div>
    <Footer label={label} />
  </div>
);

const FrameGrid = () => (
  <div
    aria-hidden
    style={{
      position: 'absolute',
      inset: layout.inset,
      border: `1px solid ${palette.line}`,
    }}
  >
    <CornerMark position="top-left" />
    <CornerMark position="top-right" />
    <CornerMark position="bottom-left" />
    <CornerMark position="bottom-right" />
  </div>
);

const CornerMark = ({
  position,
}: {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}) => {
  const vertical = position.startsWith('top') ? { top: -11 } : { bottom: -11 };
  const horizontal = position.endsWith('left') ? { left: -11 } : { right: -11 };
  return (
    <div style={{ position: 'absolute', width: 21, height: 21, ...vertical, ...horizontal }}>
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 0,
          width: 21,
          height: 1,
          background: palette.faint,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 10,
          width: 1,
          height: 21,
          background: palette.faint,
        }}
      />
    </div>
  );
};

const PartnerLogo = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 152,
      height: 54,
      border: `1px solid ${palette.hairline}`,
      color: palette.muted,
      fontFamily: fonts.mono,
      fontSize: 14,
      letterSpacing: '0.04em',
    }}
  >
    PARTNER
  </div>
);

const PartnerBrandRail = ({ compact = false }: { compact?: boolean }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: compact ? 16 : 24,
    }}
  >
    <PartnerLogo />
    <span style={{ color: palette.faint, fontFamily: fonts.mono, fontSize: 22 }}>+</span>
    <img src={vercelWordmark} alt="Vercel" style={{ width: compact ? 126 : 150 }} />
  </div>
);

const Eyebrow = ({ children, color = palette.muted }: { children: ReactNode; color?: string }) => (
  <div
    style={{
      color,
      fontFamily: fonts.mono,
      fontSize: 19,
      fontWeight: 500,
      lineHeight: 1.2,
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
    }}
  >
    {children}
  </div>
);

const PageTitle = ({ children, width = 1450 }: { children: ReactNode; width?: number }) => (
  <h2
    style={{
      maxWidth: width,
      margin: 0,
      fontSize: 70,
      fontWeight: 600,
      lineHeight: 1.04,
      letterSpacing: '-0.045em',
    }}
  >
    {children}
  </h2>
);

const Rule = ({ margin = '56px 0' }: { margin?: string }) => (
  <div style={{ width: '100%', height: 1, margin, background: palette.hairline }} />
);

const Bullet = ({ children }: { children: ReactNode }) => (
  <li
    style={{
      position: 'relative',
      paddingLeft: 38,
      fontSize: 36,
      lineHeight: 1.35,
      letterSpacing: '-0.025em',
    }}
  >
    <span style={{ position: 'absolute', left: 0, color: palette.muted }}>—</span>
    {children}
  </li>
);

const Column = ({ index, title, body }: { index: string; title: string; body: string }) => (
  <div style={{ borderTop: `1px solid ${palette.hairline}`, paddingTop: 28 }}>
    <div style={{ color: palette.faint, fontFamily: fonts.mono, fontSize: 18 }}>{index}</div>
    <h3
      style={{
        margin: '36px 0 0',
        fontSize: 40,
        fontWeight: 500,
        lineHeight: 1.15,
        letterSpacing: '-0.035em',
      }}
    >
      {title}
    </h3>
    <p
      style={{
        margin: '24px 0 0',
        color: palette.muted,
        fontSize: 28,
        lineHeight: 1.45,
        letterSpacing: '-0.02em',
      }}
    >
      {body}
    </p>
  </div>
);

const Metric = ({ value, label, detail }: { value: string; label: string; detail?: string }) => (
  <div style={{ borderTop: `1px solid ${palette.hairline}`, paddingTop: 30 }}>
    <div
      style={{
        fontSize: 88,
        fontWeight: 600,
        lineHeight: 0.96,
        letterSpacing: '-0.065em',
        fontFeatureSettings: '"tnum" 1, "ss11" 1',
      }}
    >
      {value}
    </div>
    <div style={{ marginTop: 24, fontSize: 28, fontWeight: 500 }}>{label}</div>
    {detail ? (
      <div style={{ marginTop: 10, color: palette.muted, fontSize: 22, lineHeight: 1.4 }}>
        {detail}
      </div>
    ) : null}
  </div>
);

const Cover: Page = () => (
  <div
    style={{
      ...fill,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '96px 120px',
    }}
  >
    <style>{animationStyles}</style>
    <Brand placement="left" />
    <div className="vercel-starter-enter">
      <Eyebrow>Internal presentation · 2026</Eyebrow>
      <h1
        style={{
          maxWidth: 1380,
          margin: '36px 0 0',
          fontSize: 'var(--osd-size-hero)',
          fontWeight: 600,
          lineHeight: 0.94,
          letterSpacing: '-0.06em',
        }}
      >
        Build what comes next.
      </h1>
      <p
        style={{
          maxWidth: 1040,
          margin: '42px 0 0',
          color: palette.muted,
          fontSize: 32,
          lineHeight: 1.4,
          letterSpacing: '-0.02em',
        }}
      >
        A complete starter system for Vercel product, strategy, technical, and company
        presentations.
      </p>
    </div>
    <Footer label="Prepared by [Team / Author]" />
  </div>
);

const ProductCover: Page = () => (
  <div
    style={{
      ...fill,
      display: 'grid',
      gridTemplateColumns: '1fr 680px',
      gap: 80,
      alignItems: 'center',
      padding: '96px 120px',
    }}
  >
    <style>{animationStyles}</style>
    <Brand placement="left" />
    <div className="vercel-starter-enter">
      <Eyebrow>Product update</Eyebrow>
      <h1
        style={{
          margin: '40px 0 0',
          fontSize: 116,
          fontWeight: 600,
          lineHeight: 0.96,
          letterSpacing: '-0.06em',
        }}
      >
        The AI SDK for TypeScript.
      </h1>
      <p style={{ margin: '40px 0 0', color: palette.muted, fontSize: 32, lineHeight: 1.4 }}>
        Build AI-powered products with one consistent API.
      </p>
    </div>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 680,
        borderLeft: `1px solid ${palette.hairline}`,
      }}
    >
      <img src={aiSdk} alt="AI SDK" style={{ width: 420, maxHeight: 220 }} />
    </div>
    <Footer label="Product cover" />
  </div>
);

const Agenda: Page = () => (
  <SlideFrame label="Agenda">
    <Eyebrow>Today</Eyebrow>
    <PageTitle>What we’ll cover</PageTitle>
    <Rule margin="52px 0 28px" />
    <div style={{ display: 'grid', gridTemplateColumns: '112px 1fr', rowGap: 0 }}>
      <div
        style={{ padding: '28px 0', color: palette.faint, fontFamily: fonts.mono, fontSize: 22 }}
      >
        01
      </div>
      <div style={{ padding: '22px 0', borderBottom: `1px solid ${palette.line}`, fontSize: 40 }}>
        Context and opportunity
      </div>
      <div
        style={{ padding: '28px 0', color: palette.faint, fontFamily: fonts.mono, fontSize: 22 }}
      >
        02
      </div>
      <div style={{ padding: '22px 0', borderBottom: `1px solid ${palette.line}`, fontSize: 40 }}>
        What we learned
      </div>
      <div
        style={{ padding: '28px 0', color: palette.faint, fontFamily: fonts.mono, fontSize: 22 }}
      >
        03
      </div>
      <div style={{ padding: '22px 0', borderBottom: `1px solid ${palette.line}`, fontSize: 40 }}>
        The product direction
      </div>
      <div
        style={{ padding: '28px 0', color: palette.faint, fontFamily: fonts.mono, fontSize: 22 }}
      >
        04
      </div>
      <div style={{ padding: '22px 0', fontSize: 40 }}>Decision and next steps</div>
    </div>
  </SlideFrame>
);

const SectionDivider: Page = () => (
  <div
    style={{
      ...fill,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '96px 120px',
      textAlign: 'center',
    }}
  >
    <style>{animationStyles}</style>
    <Brand />
    <div className="vercel-starter-enter">
      <div style={{ color: palette.faint, fontFamily: fonts.mono, fontSize: 22 }}>01 / 04</div>
      <h2
        style={{
          maxWidth: 1380,
          margin: '44px 0 0',
          fontSize: 104,
          fontWeight: 600,
          lineHeight: 0.98,
          letterSpacing: '-0.06em',
        }}
      >
        The opportunity
      </h2>
    </div>
    <Footer label="Section divider" />
  </div>
);

const Statement: Page = () => (
  <SlideFrame label="Statement" padding="120px">
    <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
      <h2
        style={{
          maxWidth: 1540,
          margin: 0,
          fontSize: 100,
          fontWeight: 600,
          lineHeight: 1.01,
          letterSpacing: '-0.055em',
        }}
      >
        Iteration <em style={{ fontWeight: 500 }}>velocity</em> compounds into product quality.
      </h2>
    </div>
  </SlideFrame>
);

const TitleAndBody: Page = () => (
  <SlideFrame label="Title + body">
    <Eyebrow>Context</Eyebrow>
    <PageTitle width={1320}>The frontend became the application platform.</PageTitle>
    <Rule />
    <p
      style={{
        maxWidth: 1160,
        margin: 0,
        color: palette.muted,
        fontSize: 34,
        lineHeight: 1.48,
        letterSpacing: '-0.025em',
      }}
    >
      Teams now expect infrastructure, workflow, and intelligence to disappear behind a fast path
      from idea to production.
    </p>
  </SlideFrame>
);

const Bullets: Page = () => (
  <SlideFrame label="Key points">
    <Eyebrow>What changed</Eyebrow>
    <PageTitle>Three shifts define the moment.</PageTitle>
    <Rule margin="52px 0 40px" />
    <ul
      style={{ display: 'grid', gap: 30, maxWidth: 1420, margin: 0, padding: 0, listStyle: 'none' }}
    >
      <Bullet>Interfaces are generated and refined continuously.</Bullet>
      <Bullet>Infrastructure choices happen inside product workflows.</Bullet>
      <Bullet>AI moves from a feature to a shared product layer.</Bullet>
    </ul>
  </SlideFrame>
);

const TwoColumns: Page = () => (
  <SlideFrame label="Two columns">
    <Eyebrow>Two-sided view</Eyebrow>
    <PageTitle>What users need. What teams need.</PageTitle>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 96, marginTop: 72 }}>
      <Column
        index="01"
        title="A product that feels immediate"
        body="Fast navigation, useful defaults, and feedback at every step."
      />
      <Column
        index="02"
        title="A system that stays dependable"
        body="Repeatable releases, clear ownership, and observable outcomes."
      />
    </div>
  </SlideFrame>
);

const ThreePillars: Page = () => (
  <SlideFrame label="Three pillars">
    <Eyebrow>Product principles</Eyebrow>
    <PageTitle>Speed, clarity, and control.</PageTitle>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 48, marginTop: 76 }}>
      <Column
        index="01"
        title="Ship faster"
        body="Reduce the distance between a decision and a production result."
      />
      <Column
        index="02"
        title="See clearly"
        body="Make the system state legible to every person involved."
      />
      <Column
        index="03"
        title="Stay in control"
        body="Preserve deliberate choices as automation increases."
      />
    </div>
  </SlideFrame>
);

const Quote: Page = () => (
  <SlideFrame label="Quote" padding="112px 160px 88px">
    <div
      style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}
    >
      <div style={{ color: palette.faint, fontFamily: fonts.mono, fontSize: 52, lineHeight: 1 }}>
        “
      </div>
      <blockquote
        style={{
          maxWidth: 1520,
          margin: '24px 0 0',
          fontSize: 78,
          fontWeight: 500,
          lineHeight: 1.06,
          letterSpacing: '-0.05em',
        }}
      >
        The best platform work makes the hard path feel obvious.
      </blockquote>
      <div style={{ marginTop: 48, color: palette.muted, fontSize: 26 }}>Name · Role, Team</div>
    </div>
  </SlideFrame>
);

const BigNumber: Page = () => (
  <SlideFrame label="Big number" framed padding="120px">
    <div
      style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}
    >
      <Eyebrow>Illustrative metric</Eyebrow>
      <div
        style={{
          marginTop: 40,
          fontSize: 264,
          fontWeight: 600,
          lineHeight: 0.86,
          letterSpacing: '-0.085em',
        }}
      >
        4×
      </div>
      <p
        style={{
          maxWidth: 1120,
          margin: '56px 0 0',
          color: palette.muted,
          fontSize: 36,
          lineHeight: 1.35,
        }}
      >
        More iterations before the same launch date.
      </p>
    </div>
  </SlideFrame>
);

const Metrics: Page = () => (
  <SlideFrame label="Metrics">
    <Eyebrow>Illustrative scorecard</Eyebrow>
    <PageTitle>Momentum shows up across the funnel.</PageTitle>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 48, marginTop: 92 }}>
      <Metric value="42%" label="Faster setup" detail="Median time to first production deploy" />
      <Metric value="2.3×" label="More iterations" detail="Changes tested before a release" />
      <Metric value="18pt" label="Higher confidence" detail="Team-reported release confidence" />
    </div>
  </SlideFrame>
);

const ComparisonSide = ({
  title,
  value,
  note,
  tone,
}: {
  title: string;
  value: string;
  note: string;
  tone: string;
}) => (
  <div style={{ minHeight: 470, borderTop: `1px solid ${palette.hairline}`, paddingTop: 28 }}>
    <Eyebrow color={tone}>{title}</Eyebrow>
    <div style={{ marginTop: 54, fontSize: 108, fontWeight: 600, letterSpacing: '-0.07em' }}>
      {value}
    </div>
    <p
      style={{
        maxWidth: 580,
        margin: '28px 0 0',
        color: palette.muted,
        fontSize: 30,
        lineHeight: 1.45,
      }}
    >
      {note}
    </p>
  </div>
);

const Comparison: Page = () => (
  <SlideFrame label="Comparison">
    <Eyebrow>Before / after</Eyebrow>
    <PageTitle>From handoffs to one continuous loop.</PageTitle>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 96, marginTop: 72 }}>
      <ComparisonSide
        title="Before"
        value="12 days"
        note="A queue of reviews and environment changes."
        tone={palette.faint}
      />
      <ComparisonSide
        title="Now"
        value="2 days"
        note="A shared workflow from preview to production."
        tone={palette.blue}
      />
    </div>
  </SlideFrame>
);

const TimelineItem = ({
  year,
  title,
  active = false,
}: {
  year: string;
  title: string;
  active?: boolean;
}) => (
  <div style={{ position: 'relative', paddingTop: 44 }}>
    <div
      style={{
        position: 'absolute',
        top: -9,
        left: 0,
        width: 18,
        height: 18,
        borderRadius: '50%',
        background: active ? palette.blue : '#000000',
        border: `2px solid ${active ? palette.blue : palette.hairline}`,
      }}
    />
    <div
      style={{ color: active ? '#FFFFFF' : palette.faint, fontFamily: fonts.mono, fontSize: 20 }}
    >
      {year}
    </div>
    <div
      style={{
        maxWidth: 300,
        marginTop: 18,
        color: active ? '#FFFFFF' : palette.muted,
        fontSize: 30,
        lineHeight: 1.3,
      }}
    >
      {title}
    </div>
  </div>
);

const Timeline: Page = () => (
  <SlideFrame label="Timeline">
    <Eyebrow>Road to launch</Eyebrow>
    <PageTitle>Make progress visible.</PageTitle>
    <div
      style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 48,
        marginTop: 150,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: palette.hairline,
        }}
      />
      <TimelineItem year="Q1" title="Frame the problem" />
      <TimelineItem year="Q2" title="Validate the direction" />
      <TimelineItem year="Q3" title="Build the system" active />
      <TimelineItem year="Q4" title="Scale the release" />
    </div>
  </SlideFrame>
);

const ProcessStep = ({ number, title, body }: { number: string; title: string; body: string }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '72px 1fr',
      gap: 24,
      padding: '30px 0',
      borderTop: `1px solid ${palette.line}`,
    }}
  >
    <div style={{ color: palette.faint, fontFamily: fonts.mono, fontSize: 20 }}>{number}</div>
    <div>
      <div style={{ fontSize: 34, fontWeight: 500 }}>{title}</div>
      <div
        style={{
          maxWidth: 880,
          marginTop: 10,
          color: palette.muted,
          fontSize: 24,
          lineHeight: 1.4,
        }}
      >
        {body}
      </div>
    </div>
  </div>
);

const Process: Page = () => (
  <SlideFrame label="Process">
    <div style={{ display: 'grid', gridTemplateColumns: '620px 1fr', gap: 120, height: '100%' }}>
      <div>
        <Eyebrow>Operating model</Eyebrow>
        <PageTitle width={620}>A loop, not a handoff.</PageTitle>
      </div>
      <div style={{ paddingTop: 40 }}>
        <ProcessStep
          number="01"
          title="Frame"
          body="Agree on the user problem and the constraint that matters."
        />
        <ProcessStep
          number="02"
          title="Prototype"
          body="Test the smallest complete version in context."
        />
        <ProcessStep
          number="03"
          title="Ship"
          body="Release behind evidence, observability, and clear ownership."
        />
        <ProcessStep
          number="04"
          title="Learn"
          body="Bring the outcome back into the next product decision."
        />
      </div>
    </div>
  </SlideFrame>
);

const Bar = ({
  label,
  value,
  width,
  color = '#FFFFFF',
}: {
  label: string;
  value: string;
  width: string;
  color?: string;
}) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '190px 1fr 90px',
      alignItems: 'center',
      gap: 24,
    }}
  >
    <div style={{ color: palette.muted, fontSize: 26 }}>{label}</div>
    <div style={{ height: 16, background: palette.surfaceRaised }}>
      <div style={{ width, height: '100%', background: color }} />
    </div>
    <div style={{ textAlign: 'right', fontFamily: fonts.mono, fontSize: 22 }}>{value}</div>
  </div>
);

const Chart: Page = () => (
  <SlideFrame label="Chart">
    <Eyebrow>Illustrative data</Eyebrow>
    <PageTitle>One signal should dominate the chart.</PageTitle>
    <div style={{ display: 'grid', gap: 34, maxWidth: 1380, marginTop: 84 }}>
      <Bar label="Prototype" value="38%" width="38%" color={palette.faint} />
      <Bar label="Preview" value="62%" width="62%" color={palette.muted} />
      <Bar label="Production" value="84%" width="84%" color={palette.blue} />
    </div>
    <div
      style={{
        maxWidth: 1380,
        marginTop: 48,
        color: palette.faint,
        fontFamily: fonts.mono,
        fontSize: 17,
      }}
    >
      EXAMPLE ONLY · REPLACE WITH VERIFIED DATA AND SOURCE
    </div>
  </SlideFrame>
);

const DataRow = ({
  metric,
  current,
  target,
  status,
}: {
  metric: string;
  current: string;
  target: string;
  status: string;
}) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '1.5fr 0.7fr 0.7fr 0.7fr',
      alignItems: 'center',
      minHeight: 92,
      borderTop: `1px solid ${palette.line}`,
      fontSize: 26,
    }}
  >
    <div>{metric}</div>
    <div style={{ fontFamily: fonts.mono }}>{current}</div>
    <div style={{ color: palette.muted, fontFamily: fonts.mono }}>{target}</div>
    <div style={{ color: status === 'On track' ? palette.green : palette.amber }}>{status}</div>
  </div>
);

const DataTable: Page = () => (
  <SlideFrame label="Table">
    <Eyebrow>Illustrative scorecard</Eyebrow>
    <PageTitle>Keep the comparison easy to scan.</PageTitle>
    <div style={{ marginTop: 64 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr 0.7fr 0.7fr 0.7fr',
          paddingBottom: 18,
          color: palette.faint,
          fontFamily: fonts.mono,
          fontSize: 17,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        <div>Metric</div>
        <div>Current</div>
        <div>Target</div>
        <div>Status</div>
      </div>
      <DataRow metric="Time to first deploy" current="11m" target="8m" status="At risk" />
      <DataRow metric="Preview adoption" current="86%" target="80%" status="On track" />
      <DataRow metric="Release confidence" current="92%" target="90%" status="On track" />
      <DataRow metric="Rollback rate" current="1.7%" target="1.0%" status="At risk" />
    </div>
  </SlideFrame>
);

const Code: Page = () => (
  <SlideFrame label="Code">
    <div style={{ display: 'grid', gridTemplateColumns: '620px 1fr', gap: 96, height: '100%' }}>
      <div>
        <Eyebrow>Developer example</Eyebrow>
        <PageTitle width={600}>Show the smallest useful snippet.</PageTitle>
        <p style={{ margin: '36px 0 0', color: palette.muted, fontSize: 28, lineHeight: 1.45 }}>
          Keep the explanation outside the code block and emphasize only the line that matters.
        </p>
      </div>
      <div
        style={{
          alignSelf: 'center',
          minHeight: 500,
          padding: 48,
          border: `1px solid ${palette.hairline}`,
          borderRadius: 8,
          background: palette.surface,
          color: '#EDEDED',
          fontFamily: fonts.mono,
          fontSize: 26,
          lineHeight: 1.7,
        }}
      >
        <div style={{ color: palette.faint }}>
          import {'{'} generateText {'}'} from 'ai';
        </div>
        <br />
        <div>
          <span style={{ color: palette.cyan }}>const</span> result ={' '}
          <span style={{ color: palette.cyan }}>await</span> generateText({'{'})
        </div>
        <div style={{ paddingLeft: 32 }}>model: 'openai/gpt-5',</div>
        <div style={{ paddingLeft: 32, color: palette.blue }}>
          prompt: 'Build what comes next.',
        </div>
        <div>{'}'});</div>
        <br />
        <div style={{ color: palette.faint }}>console.log(result.text);</div>
      </div>
    </div>
  </SlideFrame>
);

const Screenshot: Page = () => (
  <SlideFrame label="Product screenshot" padding="112px 120px 88px">
    <Eyebrow>Product walkthrough</Eyebrow>
    <PageTitle>Let the interface carry the slide.</PageTitle>
    <div
      style={{
        height: 590,
        marginTop: 48,
        border: `1px solid ${palette.hairline}`,
        borderRadius: 8,
        overflow: 'hidden',
        background: palette.surface,
      }}
    >
      <ImagePlaceholder hint="Product screenshot at 16:9" width={1678} height={590} />
    </div>
  </SlideFrame>
);

const SplitImage: Page = () => (
  <SlideFrame label="Text + image" padding="112px 120px 88px">
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '640px 1fr',
        gap: 96,
        alignItems: 'center',
        height: '100%',
      }}
    >
      <div>
        <Eyebrow>Feature story</Eyebrow>
        <PageTitle width={620}>Pair one idea with one visual.</PageTitle>
        <p style={{ margin: '36px 0 0', color: palette.muted, fontSize: 30, lineHeight: 1.45 }}>
          Explain what the audience should notice before they inspect the image.
        </p>
      </div>
      <div
        style={{
          height: 700,
          border: `1px solid ${palette.hairline}`,
          borderRadius: 8,
          overflow: 'hidden',
          background: palette.surface,
        }}
      >
        <ImagePlaceholder hint="Product or customer image" width={940} height={700} />
      </div>
    </div>
  </SlideFrame>
);

const FullBleedImage: Page = () => (
  <div style={{ ...fill, padding: 0 }}>
    <style>{animationStyles}</style>
    <div style={{ position: 'absolute', inset: 0 }}>
      <ImagePlaceholder hint="Full-bleed image or event photograph" width={1920} height={1080} />
    </div>
    <div
      style={{
        position: 'absolute',
        left: 120,
        right: 120,
        bottom: 80,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        color: '#FFFFFF',
        textShadow: '0 2px 24px rgba(0,0,0,0.6)',
      }}
    >
      <h2
        style={{
          maxWidth: 1200,
          margin: 0,
          fontSize: 72,
          fontWeight: 600,
          lineHeight: 1.08,
          letterSpacing: '-0.04em',
        }}
      >
        A caption that adds meaning.
      </h2>
      <div style={{ fontFamily: fonts.mono, fontSize: 18 }}>Location · Date</div>
    </div>
  </div>
);

const ArchitectureNode = ({
  icon,
  title,
  x,
  y,
  width = 340,
}: {
  icon: string;
  title: string;
  x: number;
  y: number;
  width?: number;
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width,
      minHeight: 132,
      display: 'flex',
      alignItems: 'center',
      gap: 24,
      padding: 28,
      border: `1px solid ${palette.hairline}`,
      background: '#000000',
    }}
  >
    <img src={icon} alt="" style={{ width: 54, height: 54 }} />
    <div style={{ fontSize: 28, fontWeight: 500 }}>{title}</div>
  </div>
);

const Architecture: Page = () => (
  <SlideFrame label="System diagram">
    <Eyebrow>System view</Eyebrow>
    <PageTitle>Show the path through the platform.</PageTitle>
    <div style={{ position: 'relative', height: 560, marginTop: 54 }}>
      <div
        style={{
          position: 'absolute',
          left: 220,
          top: 214,
          width: 1120,
          height: 1,
          background: palette.hairline,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 548,
          top: 214,
          width: 1,
          height: 220,
          background: palette.hairline,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 912,
          top: 214,
          width: 1,
          height: 220,
          background: palette.hairline,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 1276,
          top: 214,
          width: 1,
          height: 220,
          background: palette.hairline,
        }}
      />
      <ArchitectureNode icon={pixelLayout} title="Product interface" x={0} y={148} />
      <ArchitectureNode icon={pixelFunction} title="Application logic" x={440} y={148} />
      <ArchitectureNode icon={pixelServers} title="Vercel platform" x={880} y={148} />
      <ArchitectureNode icon={pixelGlobe} title="Global users" x={1320} y={148} />
      <ArchitectureNode icon={pixelStatus} title="Observe and learn" x={742} y={368} width={340} />
    </div>
  </SlideFrame>
);

const RoadmapCell = ({
  horizon,
  title,
  body,
  active = false,
}: {
  horizon: string;
  title: string;
  body: string;
  active?: boolean;
}) => (
  <div
    style={{
      minHeight: 260,
      padding: 32,
      borderTop: `1px solid ${active ? palette.blue : palette.hairline}`,
      background: active ? 'rgba(0,112,243,0.08)' : 'transparent',
    }}
  >
    <div
      style={{ color: active ? palette.blue : palette.faint, fontFamily: fonts.mono, fontSize: 18 }}
    >
      {horizon}
    </div>
    <h3 style={{ margin: '32px 0 0', fontSize: 36, fontWeight: 500, letterSpacing: '-0.03em' }}>
      {title}
    </h3>
    <p style={{ margin: '18px 0 0', color: palette.muted, fontSize: 24, lineHeight: 1.4 }}>
      {body}
    </p>
  </div>
);

const Roadmap: Page = () => (
  <SlideFrame label="Roadmap">
    <Eyebrow>Planning</Eyebrow>
    <PageTitle>Sequence outcomes, not feature lists.</PageTitle>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '28px 48px',
        marginTop: 58,
      }}
    >
      <RoadmapCell
        horizon="NOW"
        title="Make the core path fast"
        body="Remove setup friction and make progress visible."
        active
      />
      <RoadmapCell
        horizon="NEXT"
        title="Connect the workflow"
        body="Carry context from prototype through production."
      />
      <RoadmapCell
        horizon="LATER"
        title="Automate the repeatable"
        body="Let agents act inside clear product boundaries."
      />
      <RoadmapCell
        horizon="EXPLORE"
        title="Expand the platform"
        body="Test new primitives with real product teams."
      />
    </div>
  </SlideFrame>
);

const LaunchReveal: Page = () => (
  <div
    style={{
      ...fill,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '96px 120px',
    }}
  >
    <style>{animationStyles}</style>
    <Brand />
    <div className="vercel-starter-enter">
      <Eyebrow>Product announcement</Eyebrow>
      <img src={eve} alt="Eve" style={{ width: 620, maxHeight: 220, marginTop: 62 }} />
      <h2
        style={{
          maxWidth: 1380,
          margin: '72px 0 0',
          fontSize: 86,
          fontWeight: 600,
          lineHeight: 1.02,
          letterSpacing: '-0.05em',
        }}
      >
        A framework for durable agents.
      </h2>
      <p
        style={{
          maxWidth: 980,
          margin: '32px 0 0',
          color: palette.muted,
          fontSize: 30,
          lineHeight: 1.4,
          letterSpacing: '-0.02em',
        }}
      >
        Introduce a product with its canonical mark, one sentence, and nothing competing for
        attention.
      </p>
    </div>
    <Footer label="Launch reveal" />
  </div>
);

const PortraitFrame = ({ hint, label }: { hint: string; label?: string }) => (
  <div
    style={{
      position: 'relative',
      minHeight: 0,
      overflow: 'hidden',
      background: palette.surface,
      border: `1px solid ${palette.hairline}`,
    }}
  >
    <ImagePlaceholder hint={hint} />
    {label ? (
      <div
        style={{
          position: 'absolute',
          left: 24,
          bottom: 22,
          color: '#FFFFFF',
          fontFamily: fonts.mono,
          fontSize: 16,
          letterSpacing: '0.02em',
        }}
      >
        {label}
      </div>
    ) : null}
  </div>
);

const SessionTitle: Page = () => (
  <div
    style={{
      ...fill,
      display: 'grid',
      gridTemplateColumns: '780px 1fr',
      gap: 112,
      padding: '96px 120px',
    }}
  >
    <style>{animationStyles}</style>
    <div
      className="vercel-starter-enter"
      style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
    >
      <Eyebrow>Vercel Ship · Session opener</Eyebrow>
      <h2
        style={{
          margin: '46px 0 0',
          fontSize: 92,
          fontWeight: 600,
          lineHeight: 0.98,
          letterSpacing: '-0.055em',
        }}
      >
        Building the agentic ecosystem for developers.
      </h2>
      <div
        style={{
          marginTop: 54,
          color: palette.muted,
          fontFamily: fonts.mono,
          fontSize: 24,
          lineHeight: 1.45,
          letterSpacing: '0.01em',
          textTransform: 'uppercase',
        }}
      >
        Name Surname, Vercel
        <br />
        Name Surname, Vercel
      </div>
    </div>
    <div style={{ position: 'relative', display: 'grid', padding: '40px 0' }}>
      <PortraitFrame hint="Speaker portrait, monochrome cutout on black" />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          right: 64,
          width: 10,
          height: 92,
          background: '#FFF',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: 10,
          height: 132,
          background: '#FFF',
        }}
      />
    </div>
  </div>
);

const TeamLineup: Page = () => (
  <div style={{ ...fill, display: 'grid', gridTemplateColumns: '620px 1fr', gap: 84, padding: 96 }}>
    <style>{animationStyles}</style>
    <div
      className="vercel-starter-enter"
      style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
    >
      <img src={vercelWordmark} alt="Vercel" style={{ width: 148, marginBottom: 74 }} />
      <Eyebrow>Team introduction</Eyebrow>
      <h2
        style={{
          margin: '34px 0 0',
          fontSize: 74,
          fontWeight: 500,
          lineHeight: 1.02,
          letterSpacing: '-0.05em',
        }}
      >
        The people behind the work.
      </h2>
      <div style={{ marginTop: 48, color: palette.muted, fontSize: 28, lineHeight: 1.55 }}>
        Name Surname, Role
        <br />
        Name Surname, Role
        <br />
        Name Surname, Role
        <br />
        Name Surname, Role
      </div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      <PortraitFrame hint="Team member portrait, monochrome cutout" label="01" />
      <PortraitFrame hint="Team member portrait, monochrome cutout" label="02" />
      <PortraitFrame hint="Team member portrait, monochrome cutout" label="03" />
      <PortraitFrame hint="Team member portrait, monochrome cutout" label="04" />
    </div>
  </div>
);

const CustomerStory: Page = () => (
  <SlideFrame label="Customer story" padding="112px 120px 88px">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 520px', gap: 120, height: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ width: 260, height: 96, marginBottom: 64 }}>
          <ImagePlaceholder hint="Customer logo, white or monochrome" width={260} height={96} />
        </div>
        <blockquote
          style={{
            maxWidth: 1040,
            margin: 0,
            fontSize: 68,
            fontWeight: 500,
            lineHeight: 1.08,
            letterSpacing: '-0.045em',
          }}
        >
          “Vercel gave every team one path from an idea to production.”
        </blockquote>
        <div style={{ marginTop: 42, color: palette.muted, fontSize: 26 }}>
          Name Surname · Role, Company
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          borderLeft: `1px solid ${palette.hairline}`,
          paddingLeft: 72,
        }}
      >
        <div
          style={{ fontSize: 190, fontWeight: 600, lineHeight: 0.88, letterSpacing: '-0.075em' }}
        >
          7×
        </div>
        <p style={{ margin: '42px 0 0', color: palette.muted, fontSize: 30, lineHeight: 1.4 }}>
          Faster iteration across product teams.
        </p>
      </div>
    </div>
  </SlideFrame>
);

const DataStory: Page = () => (
  <SlideFrame label="Data story" padding="104px 120px 88px">
    <Eyebrow>Illustrative trend</Eyebrow>
    <div style={{ display: 'grid', gridTemplateColumns: '470px 1fr', gap: 80, marginTop: 54 }}>
      <div>
        <div
          style={{ fontSize: 188, fontWeight: 500, lineHeight: 0.88, letterSpacing: '-0.075em' }}
        >
          2×+
        </div>
        <div style={{ marginTop: 34, color: palette.muted, fontSize: 30 }}>Agent workloads</div>
      </div>
      <div style={{ position: 'relative', height: 610 }}>
        <svg
          aria-label="Illustrative rising workload trend"
          viewBox="0 0 1120 610"
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
          <path
            d="M20 540 L245 450 L430 382 L620 156 L790 280 L1000 104"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="4"
            vectorEffect="non-scaling-stroke"
          />
          <circle cx="20" cy="540" r="6" fill="#FFFFFF" />
          <circle cx="1000" cy="104" r="6" fill="#FFFFFF" />
        </svg>
        <div
          style={{
            position: 'absolute',
            right: 44,
            top: 34,
            fontFamily: fonts.mono,
            fontSize: 17,
            letterSpacing: '0.02em',
          }}
        >
          TOKENS
        </div>
        <div
          style={{
            position: 'absolute',
            left: 18,
            bottom: 6,
            color: palette.faint,
            fontFamily: fonts.mono,
            fontSize: 16,
          }}
        >
          START
        </div>
      </div>
    </div>
  </SlideFrame>
);

const Decision: Page = () => (
  <SlideFrame label="Decision" padding="112px 120px 88px">
    <Eyebrow>Recommendation</Eyebrow>
    <h2
      style={{
        maxWidth: 1540,
        margin: '42px 0 0',
        fontSize: 106,
        fontWeight: 600,
        lineHeight: 1,
        letterSpacing: '-0.055em',
      }}
    >
      Approve a six-week pilot with three product teams.
    </h2>
    <Rule margin="72px 0 40px" />
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 96 }}>
      <Column
        index="01"
        title="Define success before kickoff"
        body="Agree on adoption, iteration speed, and release confidence."
      />
      <Column
        index="02"
        title="Review evidence at week six"
        body="Continue only when the complete workflow performs better."
      />
    </div>
  </SlideFrame>
);

const PrincipleRow = ({
  number,
  title,
  detail,
}: {
  number: string;
  title: string;
  detail: string;
}) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '110px 520px 1fr',
      alignItems: 'baseline',
      minHeight: 118,
      padding: '28px 0',
      borderTop: `1px solid ${palette.line}`,
    }}
  >
    <div style={{ color: palette.faint, fontFamily: fonts.mono, fontSize: 19 }}>{number}</div>
    <div style={{ fontSize: 34, fontWeight: 500, letterSpacing: '-0.025em' }}>{title}</div>
    <div style={{ color: palette.muted, fontSize: 28, lineHeight: 1.4 }}>{detail}</div>
  </div>
);

const Principles: Page = () => (
  <SlideFrame label="Principles" padding="104px 120px 80px">
    <Eyebrow>Operating principles</Eyebrow>
    <PageTitle>Four rules keep the system clear.</PageTitle>
    <div style={{ marginTop: 54 }}>
      <PrincipleRow
        number="01"
        title="Start with the claim"
        detail="Make the point legible before adding proof."
      />
      <PrincipleRow
        number="02"
        title="Show real evidence"
        detail="Use verified product, customer, or operational signals."
      />
      <PrincipleRow
        number="03"
        title="Keep one owner"
        detail="Every outcome has a person who can move it forward."
      />
      <PrincipleRow
        number="04"
        title="Close the loop"
        detail="Bring the result back into the next decision."
      />
    </div>
  </SlideFrame>
);

const RiskRow = ({ risk, response }: { risk: string; response: string }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 96,
      minHeight: 150,
      padding: '34px 0',
      borderTop: `1px solid ${palette.line}`,
    }}
  >
    <div style={{ fontSize: 34, fontWeight: 500, lineHeight: 1.25, letterSpacing: '-0.025em' }}>
      {risk}
    </div>
    <div style={{ color: palette.muted, fontSize: 28, lineHeight: 1.45 }}>{response}</div>
  </div>
);

const RiskRegister: Page = () => (
  <SlideFrame label="Risks and responses" padding="104px 120px 80px">
    <Eyebrow>What could break</Eyebrow>
    <PageTitle>Make the risk and response equally visible.</PageTitle>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 96,
        marginTop: 54,
        color: palette.faint,
        fontFamily: fonts.mono,
        fontSize: 17,
        letterSpacing: '0.02em',
      }}
    >
      <div>RISK</div>
      <div>RESPONSE</div>
    </div>
    <RiskRow
      risk="Adoption stops after the pilot"
      response="Embed the workflow in one real launch with an accountable owner."
    />
    <RiskRow
      risk="Automation hides critical context"
      response="Keep approvals and system state explicit at every boundary."
    />
    <RiskRow
      risk="Success cannot be measured"
      response="Capture a baseline and instrument the complete path before kickoff."
    />
  </SlideFrame>
);

const OptionNode = ({
  title,
  note,
  active = false,
}: {
  title: string;
  note: string;
  active?: boolean;
}) => (
  <div style={{ position: 'relative', paddingTop: 52 }}>
    <div
      style={{
        position: 'absolute',
        top: -10,
        left: 0,
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: active ? '#FFFFFF' : '#000000',
        border: `2px solid ${active ? '#FFFFFF' : palette.hairline}`,
      }}
    />
    <div style={{ fontSize: 38, fontWeight: 500, letterSpacing: '-0.03em' }}>{title}</div>
    <p
      style={{
        maxWidth: 410,
        margin: '20px 0 0',
        color: palette.muted,
        fontSize: 28,
        lineHeight: 1.4,
      }}
    >
      {note}
    </p>
    {active ? (
      <div style={{ marginTop: 28, color: '#FFFFFF', fontFamily: fonts.mono, fontSize: 16 }}>
        RECOMMENDED
      </div>
    ) : null}
  </div>
);

const OptionSpectrum: Page = () => (
  <SlideFrame label="Options" padding="112px 120px 88px">
    <Eyebrow>Three paths</Eyebrow>
    <PageTitle>Choose how much of the system to own.</PageTitle>
    <div style={{ position: 'relative', marginTop: 110 }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: palette.hairline,
        }}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 80 }}>
        <OptionNode title="Build" note="Own every primitive and the complete operating burden." />
        <OptionNode
          title="Compose"
          note="Use platform primitives and keep the differentiating layer."
          active
        />
        <OptionNode title="Buy" note="Optimize for speed with less control over the system." />
      </div>
    </div>
  </SlideFrame>
);

const ProgressStep = ({
  number,
  title,
  status,
}: {
  number: string;
  title: string;
  status: string;
}) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '84px 1fr 160px',
      alignItems: 'center',
      minHeight: 120,
      borderTop: `1px solid ${palette.line}`,
    }}
  >
    <div style={{ color: palette.faint, fontFamily: fonts.mono, fontSize: 18 }}>{number}</div>
    <div style={{ fontSize: 34, fontWeight: 500, letterSpacing: '-0.025em' }}>{title}</div>
    <div
      style={{
        color: status === 'DONE' ? palette.green : palette.muted,
        fontFamily: fonts.mono,
        fontSize: 17,
      }}
    >
      {status}
    </div>
  </div>
);

const ProgressRail: Page = () => (
  <SlideFrame label="Progress" padding="112px 120px 88px">
    <div style={{ display: 'grid', gridTemplateColumns: '520px 1fr', gap: 120, height: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Eyebrow>Launch readiness</Eyebrow>
        <div
          style={{
            marginTop: 44,
            fontSize: 194,
            fontWeight: 600,
            lineHeight: 0.9,
            letterSpacing: '-0.075em',
          }}
        >
          72%
        </div>
        <p style={{ margin: '38px 0 0', color: palette.muted, fontSize: 30, lineHeight: 1.4 }}>
          The critical path is clear. Two decisions remain.
        </p>
      </div>
      <div style={{ alignSelf: 'center' }}>
        <ProgressStep number="01" title="Problem framed" status="DONE" />
        <ProgressStep number="02" title="Direction validated" status="DONE" />
        <ProgressStep number="03" title="System integrated" status="IN REVIEW" />
        <ProgressStep number="04" title="Launch approved" status="NEXT" />
      </div>
    </div>
  </SlideFrame>
);

const PhotoQuote: Page = () => (
  <div style={{ ...fill }}>
    <style>{animationStyles}</style>
    <div style={{ position: 'absolute', inset: 0 }}>
      <ImagePlaceholder
        hint="Full-bleed event, customer, or team photograph"
        width={1920}
        height={1080}
      />
    </div>
    <div
      style={{
        position: 'absolute',
        inset: '0 auto 0 0',
        width: 800,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '96px 120px',
        background: 'rgba(0,0,0,0.92)',
      }}
    >
      <Eyebrow>Customer voice</Eyebrow>
      <blockquote
        style={{
          margin: '42px 0 0',
          fontSize: 64,
          fontWeight: 500,
          lineHeight: 1.08,
          letterSpacing: '-0.045em',
        }}
      >
        “The platform disappeared. The product work accelerated.”
      </blockquote>
      <div style={{ marginTop: 44, color: palette.muted, fontSize: 25 }}>Name · Role, Company</div>
    </div>
  </div>
);

const UpdateColumn = ({ label, title, body }: { label: string; title: string; body: string }) => (
  <div style={{ borderTop: `1px solid ${palette.hairline}`, paddingTop: 28 }}>
    <div
      style={{
        color: palette.faint,
        fontFamily: fonts.mono,
        fontSize: 17,
        letterSpacing: '0.02em',
      }}
    >
      {label}
    </div>
    <h3
      style={{
        margin: '34px 0 0',
        fontSize: 38,
        fontWeight: 500,
        lineHeight: 1.15,
        letterSpacing: '-0.03em',
      }}
    >
      {title}
    </h3>
    <p style={{ margin: '24px 0 0', color: palette.muted, fontSize: 28, lineHeight: 1.45 }}>
      {body}
    </p>
  </div>
);

const TeamUpdate: Page = () => (
  <SlideFrame label="Team update" padding="112px 120px 88px">
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
      <div>
        <Eyebrow>Weekly update</Eyebrow>
        <PageTitle>This week, the path got shorter.</PageTitle>
      </div>
      <div style={{ color: palette.faint, fontFamily: fonts.mono, fontSize: 24 }}>WEEK 18</div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 56, marginTop: 94 }}>
      <UpdateColumn
        label="SHIPPED"
        title="One-click project setup"
        body="The first useful preview now appears in under two minutes."
      />
      <UpdateColumn
        label="LEARNED"
        title="Context matters most"
        body="Teams move faster when product intent stays attached to the work."
      />
      <UpdateColumn
        label="NEXT"
        title="Close the release loop"
        body="Bring approvals, evidence, and rollback into the same path."
      />
    </div>
  </SlideFrame>
);

const MotifPanel = ({ compact = false }: { compact?: boolean }) => (
  <div
    aria-hidden
    style={{
      position: 'relative',
      width: compact ? 520 : 720,
      height: compact ? 520 : 720,
      border: `1px solid ${palette.hairline}`,
      backgroundImage:
        'linear-gradient(90deg, transparent calc(50% - 0.5px), #333 50%, transparent calc(50% + 0.5px)), linear-gradient(transparent calc(50% - 0.5px), #333 50%, transparent calc(50% + 0.5px))',
    }}
  >
    <div
      style={{
        position: 'absolute',
        inset: compact ? 84 : 118,
        border: `1px solid ${palette.hairline}`,
        transform: 'rotate(45deg)',
      }}
    />
    <div
      style={{
        position: 'absolute',
        top: '25%',
        left: '25%',
        width: '50%',
        height: '50%',
        border: `1px solid ${palette.hairline}`,
        borderRadius: '50%',
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: 14,
        height: 14,
        background: '#FFFFFF',
        transform: 'translate(-50%, -50%) rotate(45deg)',
      }}
    />
  </div>
);

const Presenter = ({ name, affiliation }: { name: string; affiliation: string }) => (
  <div style={{ borderTop: `1px solid ${palette.hairline}`, paddingTop: 18 }}>
    <div style={{ fontSize: 24, fontWeight: 500 }}>{name}</div>
    <div style={{ marginTop: 8, color: palette.muted, fontSize: 18 }}>{affiliation}</div>
  </div>
);

const ExecutiveCover: Page = () => (
  <div style={{ ...fill, padding: layout.inset }}>
    <style>{animationStyles}</style>
    <FrameGrid />
    <div style={{ position: 'absolute', top: 96, left: layout.inset, zIndex: 3 }}>
      <PartnerBrandRail />
    </div>
    <div
      className="vercel-starter-enter"
      style={{
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        height: '100%',
        padding: '0 72px 120px',
        boxSizing: 'border-box',
      }}
    >
      <Eyebrow>Executive meeting · 2026</Eyebrow>
      <h1
        style={{
          maxWidth: 1460,
          margin: '32px 0 0',
          fontSize: 108,
          fontWeight: 600,
          lineHeight: 0.96,
          letterSpacing: '-0.058em',
        }}
      >
        Building the partnership together.
      </h1>
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 48, marginTop: 68 }}
      >
        <Presenter name="Name Surname" affiliation="Role · Vercel" />
        <Presenter name="Name Surname" affiliation="Role · Partner" />
        <Presenter name="Name Surname" affiliation="Role · Vercel" />
      </div>
    </div>
    <Footer label="Vercel × Partner" />
  </div>
);

const VisualAgenda: Page = () => (
  <SlideFrame label="Visual agenda" padding="112px 120px 88px">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 660px', gap: 110, height: '100%' }}>
      <div>
        <Eyebrow>Today</Eyebrow>
        <PageTitle width={820}>The conversation in four moves.</PageTitle>
        <div style={{ marginTop: 56 }}>
          <ProcessStep
            number="01"
            title="Shared context"
            body="Where the partnership stands now."
          />
          <ProcessStep number="02" title="Value creation" body="What becomes possible together." />
          <ProcessStep
            number="03"
            title="Operating model"
            body="How the work moves across teams."
          />
          <ProcessStep number="04" title="Decisions" body="What needs an owner before we leave." />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <MotifPanel compact />
      </div>
    </div>
  </SlideFrame>
);

const RosterCard = ({ index }: { index: string }) => (
  <div style={{ display: 'grid', gridTemplateRows: '1fr auto', minHeight: 0 }}>
    <div style={{ minHeight: 0, background: palette.surface, border: `1px solid ${palette.line}` }}>
      <ImagePlaceholder hint="Monochrome team portrait" />
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 14 }}>
      <div style={{ fontSize: 20, fontWeight: 500 }}>Name Surname</div>
      <div style={{ color: palette.faint, fontFamily: fonts.mono, fontSize: 15 }}>{index}</div>
    </div>
  </div>
);

const PresenterRoster: Page = () => (
  <SlideFrame label="Introductions" padding="96px 120px 78px" framed>
    <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <Eyebrow>Introductions</Eyebrow>
          <PageTitle>The room, at a glance.</PageTitle>
        </div>
        <div style={{ color: palette.faint, fontFamily: fonts.mono, fontSize: 18 }}>03 × 03</div>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(3, 1fr)',
          gap: '28px 36px',
          minHeight: 0,
          marginTop: 44,
        }}
      >
        <RosterCard index="01" />
        <RosterCard index="02" />
        <RosterCard index="03" />
        <RosterCard index="04" />
        <RosterCard index="05" />
        <RosterCard index="06" />
        <RosterCard index="07" />
        <RosterCard index="08" />
        <RosterCard index="09" />
      </div>
    </div>
  </SlideFrame>
);

const PartnershipStream: Page = () => (
  <div style={{ ...fill, padding: layout.inset }}>
    <style>{animationStyles}</style>
    <FrameGrid />
    <div
      className="vercel-starter-enter"
      style={{
        position: 'relative',
        zIndex: 2,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        height: '100%',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <MotifPanel compact />
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 72px',
          borderLeft: `1px solid ${palette.line}`,
        }}
      >
        <PartnerBrandRail compact />
        <h2
          style={{
            margin: '132px 0 0',
            fontSize: 82,
            fontWeight: 600,
            lineHeight: 1.02,
            letterSpacing: '-0.05em',
          }}
        >
          Partnership
          <br />
          Streams
        </h2>
        <div style={{ marginTop: 6, color: palette.line, fontSize: 58, fontWeight: 600 }}>
          2026 partnership
        </div>
      </div>
    </div>
    <Footer label="Partnership streams" />
  </div>
);

const WorkstreamCell = ({
  number,
  title,
  owner,
  partner,
}: {
  number: string;
  title: string;
  owner: string;
  partner: string;
}) => (
  <div style={{ minHeight: 500, borderTop: `1px solid ${palette.hairline}`, paddingTop: 24 }}>
    <div style={{ color: palette.faint, fontFamily: fonts.mono, fontSize: 17 }}>{number}</div>
    <h3
      style={{
        margin: '30px 0 0',
        fontSize: 32,
        fontWeight: 500,
        lineHeight: 1.14,
        letterSpacing: '-0.03em',
      }}
    >
      {title}
    </h3>
    <div style={{ marginTop: 64, color: palette.faint, fontFamily: fonts.mono, fontSize: 15 }}>
      OWNER
    </div>
    <div style={{ marginTop: 12, fontSize: 22 }}>{owner}</div>
    <div style={{ marginTop: 40, color: palette.faint, fontFamily: fonts.mono, fontSize: 15 }}>
      PARTNER MODEL
    </div>
    <div style={{ marginTop: 12, color: palette.muted, fontSize: 20, lineHeight: 1.35 }}>
      {partner}
    </div>
  </div>
);

const WorkstreamMatrix: Page = () => (
  <SlideFrame label="Workstream matrix" padding="104px 120px 80px">
    <Eyebrow>Joint operating model</Eyebrow>
    <PageTitle width={1240}>Five streams. One accountable system.</PageTitle>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 32, marginTop: 58 }}>
      <WorkstreamCell
        number="01"
        title="Platform integration"
        owner="Name · Product"
        partner="Joint build and technical validation"
      />
      <WorkstreamCell
        number="02"
        title="Customer experience"
        owner="Name · GTM"
        partner="Shared discovery and solution design"
      />
      <WorkstreamCell
        number="03"
        title="Field enablement"
        owner="Name · Sales"
        partner="Narrative, training, and deal support"
      />
      <WorkstreamCell
        number="04"
        title="Marketplace"
        owner="Name · BD"
        partner="Commercial model and launch path"
      />
      <WorkstreamCell
        number="05"
        title="Executive rhythm"
        owner="Name · Exec"
        partner="Monthly decisions and escalation"
      />
    </div>
  </SlideFrame>
);

const HistoryColumn = ({
  year,
  title,
  line1,
  line2,
  line3,
}: {
  year: string;
  title: string;
  line1: string;
  line2: string;
  line3: string;
}) => (
  <div style={{ minHeight: 540, padding: '44px 54px', borderLeft: `1px solid ${palette.line}` }}>
    <div
      style={{
        display: 'inline-flex',
        padding: '8px 24px',
        border: `1px solid ${palette.muted}`,
        borderRadius: 8,
        fontFamily: fonts.mono,
        fontSize: 18,
      }}
    >
      {year}
    </div>
    <h3 style={{ margin: '16px 0 0', fontSize: 32, fontWeight: 600, lineHeight: 1.1 }}>{title}</h3>
    <div
      style={{
        display: 'grid',
        gap: 26,
        marginTop: 58,
        color: palette.muted,
        fontSize: 21,
        lineHeight: 1.4,
      }}
    >
      <div>{line1}</div>
      <div>{line2}</div>
      <div>{line3}</div>
    </div>
  </div>
);

const PartnershipHistory: Page = () => (
  <SlideFrame label="Partnership history" padding="96px 120px 80px" framed>
    <PageTitle>Partnership history</PageTitle>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        marginTop: 48,
        borderTop: `1px solid ${palette.line}`,
        borderRight: `1px solid ${palette.line}`,
      }}
    >
      <HistoryColumn
        year="2024"
        title="Found the fit"
        line1="First customer motion"
        line2="Reference architecture"
        line3="Initial partner enablement"
      />
      <HistoryColumn
        year="2025"
        title="Built advocacy"
        line1="Field validation"
        line2="Joint value proposition"
        line3="Mutual account planning"
      />
      <HistoryColumn
        year="2026"
        title="Scale the model"
        line1="Executive sponsorship"
        line2="Global co-sell motion"
        line3="Measurable customer outcomes"
      />
    </div>
  </SlideFrame>
);

const StatusColumn = ({
  label,
  title,
  body,
  tone = '#FFFFFF',
}: {
  label: string;
  title: string;
  body: ReactNode;
  tone?: string;
}) => (
  <div style={{ minHeight: 540, padding: '36px 54px', borderLeft: `1px solid ${palette.line}` }}>
    <div
      style={{
        display: 'inline-flex',
        padding: '8px 18px',
        border: `1px solid ${palette.muted}`,
        borderRadius: 8,
        fontFamily: fonts.mono,
        fontSize: 16,
      }}
    >
      {label}
    </div>
    <h3
      style={{ margin: '12px 0 0', color: tone, fontSize: 34, fontWeight: 600, lineHeight: 1.12 }}
    >
      {title}
    </h3>
    <div style={{ marginTop: 54, color: palette.muted, fontSize: 22, lineHeight: 1.45 }}>
      {body}
    </div>
  </div>
);

const StatusTriptych: Page = () => (
  <SlideFrame label="Partnership status" padding="96px 120px 80px" framed>
    <PageTitle>Partnership status</PageTitle>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        marginTop: 48,
        borderTop: `1px solid ${palette.line}`,
        borderRight: `1px solid ${palette.line}`,
      }}
    >
      <StatusColumn
        label="CUSTOMERS"
        title="Proof across key verticals"
        body="Customer logo wall or a compact list of named references."
      />
      <StatusColumn
        label="PIPELINE"
        title="$XM across XX accounts"
        body="Show the pipeline shape, stage, and the next forcing function."
        tone={palette.green}
      />
      <StatusColumn
        label="RISKS"
        title="Ownership still needs clarity"
        body="Name the unresolved boundary and the decision required to remove it."
        tone={palette.amber}
      />
    </div>
    <div
      style={{
        position: 'absolute',
        left: layout.inset,
        right: layout.inset,
        bottom: 78,
        zIndex: 2,
        padding: '18px 54px',
        border: `1px solid ${palette.line}`,
        fontFamily: fonts.mono,
        fontSize: 17,
        lineHeight: 1.4,
      }}
    >
      DISCUSSION · What needs to be true for this partnership to scale?
    </div>
  </SlideFrame>
);

const EvidenceMetric = ({ value, label }: { value: string; label: string }) => (
  <div style={{ borderTop: `1px solid ${palette.hairline}`, paddingTop: 22 }}>
    <div
      style={{
        fontSize: 56,
        fontWeight: 600,
        lineHeight: 1,
        letterSpacing: '-0.055em',
        fontFeatureSettings: '"tnum" 1, "ss11" 1',
      }}
    >
      {value}
    </div>
    <div style={{ marginTop: 12, color: palette.muted, fontSize: 18, lineHeight: 1.35 }}>
      {label}
    </div>
  </div>
);

const ProofCollage: Page = () => (
  <SlideFrame label="Partnership proof" padding="104px 120px 80px">
    <div style={{ display: 'grid', gridTemplateColumns: '640px 1fr', gap: 96, height: '100%' }}>
      <div>
        <Eyebrow>Partnership proof</Eyebrow>
        <PageTitle width={620}>Make the evidence impossible to miss.</PageTitle>
        <div style={{ height: 420, marginTop: 54, background: palette.surface }}>
          <ImagePlaceholder hint="Partnership hero or customer collage" />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <h3
          style={{
            maxWidth: 780,
            margin: 0,
            fontSize: 44,
            fontWeight: 500,
            lineHeight: 1.14,
            letterSpacing: '-0.035em',
          }}
        >
          One claim, five signals, and one image that makes the partnership tangible.
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '42px 32px',
            marginTop: 72,
          }}
        >
          <EvidenceMetric value="$XM" label="Joint pipeline" />
          <EvidenceMetric value="XX" label="Shared accounts" />
          <EvidenceMetric value="X×" label="Faster launch" />
          <EvidenceMetric value="XX%" label="Partner-sourced" />
          <EvidenceMetric value="XX" label="Customer proofs" />
        </div>
      </div>
    </div>
  </SlideFrame>
);

const MetricHorizon: Page = () => (
  <SlideFrame label="Metric horizon" padding="104px 120px 80px">
    <Eyebrow>Illustrative growth</Eyebrow>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '700px 1fr',
        gap: 96,
        alignItems: 'end',
        marginTop: 60,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 238,
            fontWeight: 600,
            lineHeight: 0.8,
            letterSpacing: '-0.085em',
            fontFeatureSettings: '"tnum" 1, "ss11" 1',
          }}
        >
          $XM
        </div>
        <div style={{ marginTop: 44, color: palette.muted, fontSize: 32 }}>
          Annual platform opportunity
        </div>
      </div>
      <p style={{ maxWidth: 760, margin: 0, color: palette.muted, fontSize: 30, lineHeight: 1.45 }}>
        Use a large horizon slide when the size of the opportunity matters more than the mechanics.
      </p>
    </div>
    <div
      style={{ position: 'relative', marginTop: 128, borderTop: `1px solid ${palette.hairline}` }}
    >
      <div
        style={{
          position: 'absolute',
          top: -3,
          left: 0,
          width: '74%',
          height: 5,
          background: '#FFFFFF',
        }}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', paddingTop: 28 }}>
        <div style={{ fontFamily: fonts.mono, fontSize: 18 }}>2025 · BASE</div>
        <div style={{ fontFamily: fonts.mono, fontSize: 18 }}>2026 · PROVE</div>
        <div style={{ fontFamily: fonts.mono, fontSize: 18 }}>2027 · SCALE</div>
        <div style={{ color: palette.faint, fontFamily: fonts.mono, fontSize: 18 }}>
          2028 · EXPAND
        </div>
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 74, marginTop: 70, opacity: 0.74 }}>
      <img src={nextjs} alt="Next.js" style={{ width: 190 }} />
      <img src={aiSdk} alt="AI SDK" style={{ width: 150 }} />
      <img src={v0} alt="v0" style={{ width: 120 }} />
      <img src={workflow} alt="Workflow" style={{ width: 165 }} />
    </div>
  </SlideFrame>
);

const BridgePillar = ({
  number,
  title,
  detail,
}: {
  number: string;
  title: string;
  detail: string;
}) => (
  <div style={{ borderLeft: `1px solid ${palette.line}`, padding: '32px 34px', minHeight: 300 }}>
    <div style={{ color: palette.faint, fontFamily: fonts.mono, fontSize: 16 }}>{number}</div>
    <h3 style={{ margin: '38px 0 0', fontSize: 30, fontWeight: 500, lineHeight: 1.15 }}>{title}</h3>
    <p style={{ margin: '20px 0 0', color: palette.muted, fontSize: 20, lineHeight: 1.4 }}>
      {detail}
    </p>
  </div>
);

const ValueBridge: Page = () => (
  <SlideFrame label="Value bridge" padding="104px 120px 80px">
    <Eyebrow>Consumption model</Eyebrow>
    <PageTitle width={1390}>Every investment should unlock four compounding effects.</PageTitle>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1.5fr repeat(4, 1fr)',
        marginTop: 66,
        borderTop: `1px solid ${palette.line}`,
        borderRight: `1px solid ${palette.line}`,
      }}
    >
      <div style={{ padding: '32px 44px' }}>
        <div style={{ fontSize: 118, fontWeight: 600, lineHeight: 0.9, letterSpacing: '-0.065em' }}>
          $1
        </div>
        <div style={{ marginTop: 24, color: palette.muted, fontSize: 22, lineHeight: 1.4 }}>
          Place the core input or investment here.
        </div>
      </div>
      <BridgePillar number="01" title="Developers" detail="More teams building on the platform." />
      <BridgePillar number="02" title="Workloads" detail="More production paths and use cases." />
      <BridgePillar number="03" title="Consumption" detail="More infrastructure value captured." />
      <BridgePillar number="04" title="Evidence" detail="More customer proof feeding the loop." />
    </div>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1.5fr 4fr',
        border: `1px solid ${palette.line}`,
        borderTop: 0,
      }}
    >
      <div
        style={{ padding: '22px 44px', color: palette.faint, fontFamily: fonts.mono, fontSize: 16 }}
      >
        THE BRIDGE
      </div>
      <div style={{ padding: '22px 34px', color: palette.muted, fontSize: 21 }}>
        Explain what makes the four effects reinforce one another.
      </div>
    </div>
  </SlideFrame>
);

const GridStep = ({ number, title, detail }: { number: string; title: string; detail: string }) => (
  <div style={{ minHeight: 230, padding: 30, borderTop: `1px solid ${palette.hairline}` }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ color: palette.faint, fontFamily: fonts.mono, fontSize: 16 }}>{number}</div>
      <div style={{ width: 10, height: 10, background: '#FFFFFF' }} />
    </div>
    <h3 style={{ margin: '42px 0 0', fontSize: 30, fontWeight: 500 }}>{title}</h3>
    <p style={{ margin: '16px 0 0', color: palette.muted, fontSize: 20, lineHeight: 1.4 }}>
      {detail}
    </p>
  </div>
);

const SixStepGrid: Page = () => (
  <SlideFrame label="Six-step process" padding="104px 120px 80px">
    <Eyebrow>Joint process</Eyebrow>
    <PageTitle width={1320}>A complete motion, without the handoff gaps.</PageTitle>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '34px 40px',
        marginTop: 58,
      }}
    >
      <GridStep number="01" title="Discover" detail="Find the shared customer problem." />
      <GridStep number="02" title="Qualify" detail="Confirm fit, urgency, and ownership." />
      <GridStep number="03" title="Design" detail="Create the joint technical path." />
      <GridStep number="04" title="Prove" detail="Validate with one real workload." />
      <GridStep number="05" title="Launch" detail="Enable the field and release together." />
      <GridStep number="06" title="Expand" detail="Turn evidence into the next account." />
    </div>
  </SlideFrame>
);

const CaseStage = ({ label, text }: { label: string; text: string }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '120px 1fr',
      gap: 20,
      padding: '22px 0',
      borderTop: `1px solid ${palette.line}`,
    }}
  >
    <div style={{ color: palette.faint, fontFamily: fonts.mono, fontSize: 15 }}>{label}</div>
    <div style={{ fontSize: 23, lineHeight: 1.35 }}>{text}</div>
  </div>
);

const CaseStudyEvidence: Page = () => (
  <SlideFrame label="Customer evidence" padding="104px 120px 80px">
    <div style={{ display: 'grid', gridTemplateColumns: '650px 1fr', gap: 86, height: '100%' }}>
      <div>
        <div style={{ width: 220, height: 70 }}>
          <ImagePlaceholder hint="Customer logo" width={220} height={70} />
        </div>
        <h2
          style={{
            margin: '44px 0 0',
            fontSize: 64,
            fontWeight: 600,
            lineHeight: 1.02,
            letterSpacing: '-0.045em',
          }}
        >
          From fragmented workflow to one production path.
        </h2>
        <div style={{ marginTop: 54 }}>
          <CaseStage label="BEFORE" text="Teams waited on disconnected reviews and environments." />
          <CaseStage label="CHOICE" text="One platform connected preview, evidence, and release." />
          <CaseStage
            label="AFTER"
            text="More iterations reached customers with less operating load."
          />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateRows: '1fr auto', minHeight: 0 }}>
        <div
          style={{
            minHeight: 0,
            background: palette.surface,
            border: `1px solid ${palette.hairline}`,
          }}
        >
          <ImagePlaceholder hint="Customer product screenshot or workflow evidence" />
        </div>
        <div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28, marginTop: 34 }}
        >
          <EvidenceMetric value="X×" label="Iteration speed" />
          <EvidenceMetric value="XX%" label="Adoption" />
          <EvidenceMetric value="XXm" label="Time saved" />
        </div>
      </div>
    </div>
  </SlideFrame>
);

const TrendPanel = ({
  title,
  value,
  active = false,
}: {
  title: string;
  value: string;
  active?: boolean;
}) => (
  <div
    style={{
      minHeight: 470,
      padding: 32,
      borderTop: `1px solid ${active ? '#FFFFFF' : palette.hairline}`,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
      <h3 style={{ margin: 0, fontSize: 30, fontWeight: 500 }}>{title}</h3>
      <div style={{ fontFamily: fonts.mono, fontSize: 22 }}>{value}</div>
    </div>
    <svg
      aria-label={`${title} illustrative trend`}
      viewBox="0 0 680 330"
      style={{ width: '100%', height: 330, marginTop: 50 }}
    >
      <path
        d={
          active
            ? 'M10 290 C140 280 150 235 270 220 C390 205 410 105 540 90 C600 82 635 55 670 24'
            : 'M10 280 C130 278 170 265 280 248 C400 228 490 192 670 170'
        }
        fill="none"
        stroke={active ? '#FFFFFF' : palette.faint}
        strokeWidth="4"
      />
      <path d="M10 310 H670" fill="none" stroke={palette.line} strokeWidth="1" />
    </svg>
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        color: palette.faint,
        fontFamily: fonts.mono,
        fontSize: 14,
      }}
    >
      <span>START</span>
      <span>NOW</span>
    </div>
  </div>
);

const DualTrend: Page = () => (
  <SlideFrame label="Dual trend" padding="104px 120px 80px">
    <Eyebrow>Illustrative trends</Eyebrow>
    <PageTitle width={1380}>Show the relationship, not two unrelated charts.</PageTitle>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, marginTop: 64 }}>
      <TrendPanel title="Developer activity" value="+XX%" />
      <TrendPanel title="Platform consumption" value="+X×" active />
    </div>
  </SlideFrame>
);

const PipelineColumn = ({
  stage,
  title,
  primitive,
  risk,
}: {
  stage: string;
  title: string;
  primitive: string;
  risk: string;
}) => (
  <div style={{ borderLeft: `1px solid ${palette.line}` }}>
    <div style={{ minHeight: 170, padding: 26 }}>
      <div style={{ color: palette.faint, fontFamily: fonts.mono, fontSize: 15 }}>{stage}</div>
      <h3 style={{ margin: '26px 0 0', fontSize: 28, fontWeight: 500, lineHeight: 1.15 }}>
        {title}
      </h3>
    </div>
    <div
      style={{
        minHeight: 126,
        padding: 26,
        borderTop: `1px solid ${palette.line}`,
        background: palette.surface,
      }}
    >
      <div style={{ color: palette.faint, fontFamily: fonts.mono, fontSize: 14 }}>
        PLATFORM PRIMITIVE
      </div>
      <div style={{ marginTop: 16, fontSize: 21 }}>{primitive}</div>
    </div>
    <div style={{ minHeight: 154, padding: 26, borderTop: `1px solid ${palette.line}` }}>
      <div style={{ color: palette.amber, fontFamily: fonts.mono, fontSize: 14 }}>FAILURE MODE</div>
      <div style={{ marginTop: 16, color: palette.muted, fontSize: 19, lineHeight: 1.4 }}>
        {risk}
      </div>
    </div>
  </div>
);

const AgentPipeline: Page = () => (
  <SlideFrame label="Agent pipeline" padding="96px 120px 80px">
    <Eyebrow>Agent architecture</Eyebrow>
    <PageTitle width={1380}>Follow the agent from intent to evidence.</PageTitle>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        marginTop: 54,
        borderTop: `1px solid ${palette.line}`,
        borderRight: `1px solid ${palette.line}`,
        borderBottom: `1px solid ${palette.line}`,
      }}
    >
      <PipelineColumn
        stage="01"
        title="Understand"
        primitive="Context + model"
        risk="Incomplete or stale inputs"
      />
      <PipelineColumn
        stage="02"
        title="Plan"
        primitive="Durable workflow"
        risk="Unbounded action sequence"
      />
      <PipelineColumn
        stage="03"
        title="Act"
        primitive="Tools + sandbox"
        risk="Unsafe execution boundary"
      />
      <PipelineColumn
        stage="04"
        title="Observe"
        primitive="Traces + evals"
        risk="No reliable success signal"
      />
      <PipelineColumn
        stage="05"
        title="Learn"
        primitive="Memory + feedback"
        risk="Compounding bad state"
      />
    </div>
  </SlideFrame>
);

const RiskCell = ({ number, title, detail }: { number: string; title: string; detail: string }) => (
  <div style={{ minHeight: 190, padding: 26, borderTop: `1px solid ${palette.hairline}` }}>
    <div style={{ color: palette.faint, fontFamily: fonts.mono, fontSize: 14 }}>{number}</div>
    <h3 style={{ margin: '26px 0 0', fontSize: 27, fontWeight: 500 }}>{title}</h3>
    <p style={{ margin: '14px 0 0', color: palette.muted, fontSize: 19, lineHeight: 1.38 }}>
      {detail}
    </p>
  </div>
);

const RiskLandscape: Page = () => (
  <SlideFrame label="Risk landscape" padding="104px 120px 80px">
    <div style={{ display: 'grid', gridTemplateColumns: '650px 1fr', gap: 100, height: '100%' }}>
      <div>
        <Eyebrow>Agent readiness</Eyebrow>
        <PageTitle width={630}>Autonomy exposes a new risk surface.</PageTitle>
        <p
          style={{
            maxWidth: 590,
            margin: '42px 0 0',
            color: palette.muted,
            fontSize: 28,
            lineHeight: 1.45,
          }}
        >
          Use this layout when the six risks matter as a connected system, not as a ranked backlog.
        </p>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '22px 40px',
          alignSelf: 'center',
        }}
      >
        <RiskCell
          number="01"
          title="Identity"
          detail="Who is acting, for whom, and with what authority?"
        />
        <RiskCell
          number="02"
          title="Context"
          detail="Which information is complete, current, and allowed?"
        />
        <RiskCell
          number="03"
          title="Execution"
          detail="Where can tools run and what can they change?"
        />
        <RiskCell
          number="04"
          title="Recovery"
          detail="How does the system stop, roll back, or resume?"
        />
        <RiskCell
          number="05"
          title="Evaluation"
          detail="What evidence proves the outcome is correct?"
        />
        <RiskCell number="06" title="Governance" detail="Who owns policy, audit, and escalation?" />
      </div>
    </div>
  </SlideFrame>
);

const UseCase = ({ index, title }: { index: string; title: string }) => (
  <div style={{ display: 'grid', gridTemplateRows: '1fr auto', minHeight: 0 }}>
    <div style={{ minHeight: 0, background: palette.surface, border: `1px solid ${palette.line}` }}>
      <ImagePlaceholder hint={`${title} product or customer visual`} />
    </div>
    <div style={{ paddingTop: 24 }}>
      <div style={{ color: palette.faint, fontFamily: fonts.mono, fontSize: 15 }}>{index}</div>
      <h3 style={{ margin: '16px 0 0', fontSize: 31, fontWeight: 500 }}>{title}</h3>
      <p style={{ margin: '12px 0 0', color: palette.muted, fontSize: 20, lineHeight: 1.4 }}>
        One sentence that names the user, the job, and the outcome.
      </p>
    </div>
  </div>
);

const UseCaseGallery: Page = () => (
  <SlideFrame label="Use-case gallery" padding="104px 120px 80px">
    <Eyebrow>Where the platform wins</Eyebrow>
    <PageTitle width={1360}>Three use cases, shown in context.</PageTitle>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 40,
        minHeight: 540,
        marginTop: 56,
      }}
    >
      <UseCase index="01" title="Customer-facing agents" />
      <UseCase index="02" title="Internal workflows" />
      <UseCase index="03" title="Developer automation" />
    </div>
  </SlideFrame>
);

const BinaryState = ({
  label,
  title,
  detail,
  active = false,
}: {
  label: string;
  title: string;
  detail: string;
  active?: boolean;
}) => (
  <div
    style={{
      minHeight: 330,
      padding: 46,
      border: `1px solid ${active ? '#FFFFFF' : palette.hairline}`,
      background: active ? '#FFFFFF' : '#000000',
      color: active ? '#000000' : '#FFFFFF',
    }}
  >
    <div style={{ opacity: 0.56, fontFamily: fonts.mono, fontSize: 16 }}>{label}</div>
    <h3 style={{ margin: '80px 0 0', fontSize: 50, fontWeight: 600, letterSpacing: '-0.04em' }}>
      {title}
    </h3>
    <p style={{ maxWidth: 520, margin: '22px 0 0', opacity: 0.68, fontSize: 23, lineHeight: 1.4 }}>
      {detail}
    </p>
  </div>
);

const BinaryModel: Page = () => (
  <SlideFrame label="Binary model" padding="104px 120px 80px">
    <Eyebrow>Conceptual model</Eyebrow>
    <PageTitle width={1360}>Move the system from reactive to autonomous.</PageTitle>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 120px 1fr',
        alignItems: 'center',
        marginTop: 72,
      }}
    >
      <BinaryState
        label="STATE 01"
        title="Requested"
        detail="A person asks. The system responds once."
      />
      <div
        style={{ textAlign: 'center', color: palette.faint, fontFamily: fonts.mono, fontSize: 32 }}
      >
        →
      </div>
      <BinaryState
        label="STATE 02"
        title="Durable"
        detail="The system observes, acts, recovers, and continues."
        active
      />
    </div>
  </SlideFrame>
);

const ProductDemo: Page = () => (
  <SlideFrame label="Product demo" padding="96px 120px 80px">
    <div style={{ display: 'grid', gridTemplateColumns: '640px 1fr', gap: 92, height: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <img src={v0} alt="v0" style={{ width: 180, marginBottom: 70 }} />
        <Eyebrow>Product demo</Eyebrow>
        <h2
          style={{
            margin: '36px 0 0',
            fontSize: 82,
            fontWeight: 600,
            lineHeight: 1,
            letterSpacing: '-0.05em',
          }}
        >
          From prompt to production interface.
        </h2>
        <p style={{ margin: '34px 0 0', color: palette.muted, fontSize: 28, lineHeight: 1.45 }}>
          Keep the promise on the left and the real product evidence on the right.
        </p>
      </div>
      <div
        style={{
          alignSelf: 'center',
          height: 690,
          background: palette.surface,
          border: `1px solid ${palette.hairline}`,
        }}
      >
        <ImagePlaceholder hint="Live product screenshot or demo frame" />
      </div>
    </div>
  </SlideFrame>
);

const Primitive = ({ icon, title, detail }: { icon: string; title: string; detail: string }) => (
  <div style={{ minHeight: 210, padding: 28, borderTop: `1px solid ${palette.hairline}` }}>
    <div
      style={{
        width: 42,
        height: 42,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `1px solid ${palette.hairline}`,
        fontFamily: fonts.mono,
        fontSize: 14,
      }}
    >
      {icon}
    </div>
    <h3 style={{ margin: '28px 0 0', fontSize: 29, fontWeight: 500 }}>{title}</h3>
    <p style={{ margin: '12px 0 0', color: palette.muted, fontSize: 19, lineHeight: 1.4 }}>
      {detail}
    </p>
  </div>
);

const AgentPrimitives: Page = () => (
  <SlideFrame label="Agent primitives" padding="104px 120px 80px">
    <div style={{ display: 'grid', gridTemplateColumns: '620px 1fr', gap: 100, height: '100%' }}>
      <div>
        <img src={eve} alt="Eve" style={{ width: 260, marginBottom: 64 }} />
        <Eyebrow>Platform primitives</Eyebrow>
        <PageTitle width={610}>The pieces that make agents durable.</PageTitle>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '30px 38px',
          alignSelf: 'center',
        }}
      >
        <Primitive icon="01" title="Workflow" detail="Durable orchestration and retries." />
        <Primitive icon="02" title="Sandbox" detail="Isolated tool execution." />
        <Primitive icon="03" title="Gateway" detail="Model access and policy." />
        <Primitive icon="04" title="Observability" detail="Traces, evidence, and evals." />
        <Primitive icon="05" title="Storage" detail="State that survives the turn." />
        <Primitive icon="06" title="Firewall" detail="A governed action boundary." />
      </div>
    </div>
  </SlideFrame>
);

const PartnerInterstitial: Page = () => (
  <div style={{ ...fill }}>
    <style>{animationStyles}</style>
    <FrameGrid />
    <div
      className="vercel-starter-enter"
      style={{
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
      }}
    >
      <PartnerBrandRail />
    </div>
    <Footer label="Partnership" />
  </div>
);

const ProductEcosystem: Page = () => (
  <SlideFrame label="Product ecosystem" padding="112px 120px 88px">
    <Eyebrow>Vercel products</Eyebrow>
    <PageTitle width={1280}>One platform, many paths to production.</PageTitle>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        alignItems: 'center',
        gap: 60,
        minHeight: 420,
        marginTop: 72,
        borderTop: `1px solid ${palette.line}`,
        borderBottom: `1px solid ${palette.line}`,
      }}
    >
      <img
        src={nextjs}
        alt="Next.js"
        style={{ maxWidth: 250, maxHeight: 74, justifySelf: 'center' }}
      />
      <img src={v0} alt="v0" style={{ maxWidth: 190, maxHeight: 90, justifySelf: 'center' }} />
      <img
        src={aiSdk}
        alt="AI SDK"
        style={{ maxWidth: 210, maxHeight: 96, justifySelf: 'center' }}
      />
      <img src={eve} alt="Eve" style={{ maxWidth: 210, maxHeight: 90, justifySelf: 'center' }} />
      <img
        src={workflow}
        alt="Workflow"
        style={{ maxWidth: 230, maxHeight: 90, justifySelf: 'center' }}
      />
    </div>
  </SlideFrame>
);

const LogoTile = ({ src, name, wide = false }: { src: string; name: string; wide?: boolean }) => (
  <div
    style={{
      minHeight: 166,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '28px 0',
      borderTop: `1px solid ${palette.line}`,
    }}
  >
    <img
      src={src}
      alt={name}
      style={{ alignSelf: 'flex-start', maxWidth: wide ? 220 : 150, maxHeight: 72 }}
    />
    <div style={{ color: palette.faint, fontFamily: fonts.mono, fontSize: 15 }}>{name}</div>
  </div>
);

const WordmarkGallery: Page = () => (
  <SlideFrame label="Canonical wordmarks" padding="104px 120px 80px">
    <Eyebrow>Shared assets · Wordmarks</Eyebrow>
    <PageTitle width={1120}>Use the mark. Don’t redraw it.</PageTitle>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0 48px',
        marginTop: 52,
      }}
    >
      <LogoTile src={vercelWordmark} name="Vercel" wide />
      <LogoTile src={nextjs} name="Next.js" wide />
      <LogoTile src={aiSdk} name="AI SDK" wide />
      <LogoTile src={aiGateway} name="AI Gateway" wide />
      <LogoTile src={eve} name="Eve" wide />
      <LogoTile src={workflow} name="Workflow" wide />
      <LogoTile src={geist} name="Geist" wide />
      <LogoTile src={fx} name="FX" />
      <LogoTile src={turbo} name="Turbo" wide />
      <LogoTile src={turborepo} name="Turborepo" wide />
      <LogoTile src={turbopack} name="Turbopack" wide />
      <LogoTile src={v0} name="v0" wide />
    </div>
  </SlideFrame>
);

const IconGallery: Page = () => (
  <SlideFrame label="Canonical icons" padding="104px 120px 80px">
    <Eyebrow>Shared assets · Product icons</Eyebrow>
    <PageTitle width={1180}>A compact set for product stories.</PageTitle>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '0 42px',
        marginTop: 68,
      }}
    >
      <LogoTile src={vercelMark} name="Vercel" />
      <LogoTile src={pixelNext} name="Next.js pixel" />
      <LogoTile src={pixelV0} name="v0 pixel" />
      <LogoTile src={pixelAiSdk} name="AI SDK pixel" />
      <LogoTile src={lilPix} name="Lil Pix" />
      <LogoTile src={fx} name="FX" />
      <LogoTile src={pixelTurborepo} name="Turborepo pixel" />
      <LogoTile src={pixelTurbopack} name="Turbopack pixel" />
      <LogoTile src={pixelGlobe} name="Global network" />
      <LogoTile src={pixelServers} name="Infrastructure" />
      <LogoTile src={pixelFunction} name="Functions" />
      <LogoTile src={pixelSparkles} name="AI" />
    </div>
  </SlideFrame>
);

const PixelTile = ({ src, name }: { src: string; name: string }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 24,
      padding: '24px 0',
      borderTop: `1px solid ${palette.line}`,
    }}
  >
    <img src={src} alt="" style={{ width: 72, height: 72, imageRendering: 'pixelated' }} />
    <div>
      <div style={{ fontFamily: fonts.pixel, fontSize: 26 }}>{name}</div>
      <div style={{ marginTop: 8, color: palette.faint, fontFamily: fonts.mono, fontSize: 14 }}>
        24 × 24 matrix
      </div>
    </div>
  </div>
);

const PixelGallery: Page = () => (
  <SlideFrame label="Geist pixels" padding="104px 120px 80px">
    <Eyebrow>Shared assets · Geist pixels</Eyebrow>
    <PageTitle width={1180}>Technical detail with a human signal.</PageTitle>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0 48px',
        marginTop: 60,
      }}
    >
      <PixelTile src={pixelVercel} name="Vercel" />
      <PixelTile src={pixelAiSdk} name="AI SDK" />
      <PixelTile src={pixelGlobe} name="Globe" />
      <PixelTile src={pixelServers} name="Servers" />
      <PixelTile src={pixelLayout} name="Layout" />
      <PixelTile src={pixelFunction} name="Function" />
      <PixelTile src={pixelStatus} name="Status" />
      <PixelTile src={pixelSparkles} name="Sparkles" />
      <PixelTile src={pixelNext} name="Next.js" />
      <PixelTile src={pixelV0} name="v0" />
      <PixelTile src={pixelTurborepo} name="Turborepo" />
      <PixelTile src={pixelTurbopack} name="Turbopack" />
    </div>
  </SlideFrame>
);

const LilPixGallery: Page = () => (
  <SlideFrame label="Lil Pix" padding="104px 120px 80px">
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '720px 1fr',
        gap: 120,
        alignItems: 'center',
        height: '100%',
      }}
    >
      <div>
        <Eyebrow>Shared asset · Lil Pix</Eyebrow>
        <PageTitle width={680}>A little personality, used deliberately.</PageTitle>
        <p
          style={{
            maxWidth: 650,
            margin: '36px 0 0',
            color: palette.muted,
            fontSize: 30,
            lineHeight: 1.45,
          }}
        >
          Pair Lil Pix with launches, event moments, or a clear emotional beat. Keep the surrounding
          slide quiet.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'end' }}>
        <div style={{ textAlign: 'center' }}>
          <img
            src={lilPixEnter}
            alt="Lil Pix entering"
            style={{ width: 320, height: 320, imageRendering: 'pixelated' }}
          />
          <div
            style={{ marginTop: 24, color: palette.faint, fontFamily: fonts.mono, fontSize: 16 }}
          >
            ENTER
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <img
            src={lilPixWaving}
            alt="Lil Pix waving"
            style={{ width: 320, height: 320, imageRendering: 'pixelated' }}
          />
          <div
            style={{ marginTop: 24, color: palette.faint, fontFamily: fonts.mono, fontSize: 16 }}
          >
            WAVING
          </div>
        </div>
      </div>
    </div>
  </SlideFrame>
);

const Questions: Page = () => (
  <SlideFrame label="Questions">
    <div
      style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}
    >
      <Eyebrow>Discussion</Eyebrow>
      <h2
        style={{
          maxWidth: 1480,
          margin: '40px 0 0',
          fontSize: 128,
          fontWeight: 600,
          lineHeight: 0.98,
          letterSpacing: '-0.055em',
        }}
      >
        What should we decide together?
      </h2>
    </div>
  </SlideFrame>
);

const Closing: Page = () => (
  <div
    style={{
      ...fill,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '96px 120px',
      textAlign: 'center',
    }}
  >
    <style>{animationStyles}</style>
    <div className="vercel-starter-enter">
      <img src={vercelMark} alt="Vercel" style={{ width: 88, height: 88 }} />
      <h2
        style={{
          maxWidth: 1380,
          margin: '52px 0 0',
          fontSize: 112,
          fontWeight: 600,
          lineHeight: 1,
          letterSpacing: '-0.055em',
        }}
      >
        Build the clearest version.
      </h2>
      <div style={{ marginTop: 48, color: palette.muted, fontFamily: fonts.mono, fontSize: 20 }}>
        team@vercel.com
      </div>
    </div>
  </div>
);

export const meta: SlideMeta = {
  title: 'Vercel presentation starter',
  createdAt: '2026-09-01T02:13:17.216Z',
  theme: 'vercel',
};

const canonicalAssetSource =
  '[Sources]\nCanonical Vercel assets: vercel/front@b0146c25ccd240c77d34264a95bd98a15eaa9c92.';
const partnerLayoutSource =
  '[Sources]\nLayout references: user-provided “2026_03_18 - Vercel x SAP - Exec Meeting in SF HQ.pptx” and “Copy of AWS + Vercel Partnership (1).pptx”.';

export const notes: (string | undefined)[] = [
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  `${canonicalAssetSource} Public layout references: https://vercel.com/ship/2024/session/opening-keynote and https://vercel.com/ship/ai.`,
  '[Sources]\nPublic session-artwork reference: https://vercel.com/ship/ai/session/agent-marketplace-demo-showcase.',
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  partnerLayoutSource,
  partnerLayoutSource,
  partnerLayoutSource,
  partnerLayoutSource,
  partnerLayoutSource,
  partnerLayoutSource,
  partnerLayoutSource,
  partnerLayoutSource,
  partnerLayoutSource,
  partnerLayoutSource,
  partnerLayoutSource,
  partnerLayoutSource,
  partnerLayoutSource,
  partnerLayoutSource,
  partnerLayoutSource,
  partnerLayoutSource,
  partnerLayoutSource,
  partnerLayoutSource,
  partnerLayoutSource,
  partnerLayoutSource,
  canonicalAssetSource,
  `${canonicalAssetSource} FX glyph: apps/vercel-site/app/(dashboard)/components/dash-promotions/promos/fx-glm52-free.tsx at the same commit.`,
  canonicalAssetSource,
  canonicalAssetSource,
  canonicalAssetSource,
  undefined,
  undefined,
];

export default [
  Cover,
  ProductCover,
  Agenda,
  SectionDivider,
  Statement,
  TitleAndBody,
  Bullets,
  TwoColumns,
  ThreePillars,
  Quote,
  BigNumber,
  Metrics,
  Comparison,
  Timeline,
  Process,
  Chart,
  DataTable,
  Code,
  Screenshot,
  SplitImage,
  FullBleedImage,
  Architecture,
  Roadmap,
  LaunchReveal,
  SessionTitle,
  TeamLineup,
  CustomerStory,
  DataStory,
  Decision,
  Principles,
  RiskRegister,
  OptionSpectrum,
  ProgressRail,
  PhotoQuote,
  TeamUpdate,
  ExecutiveCover,
  VisualAgenda,
  PresenterRoster,
  PartnershipStream,
  WorkstreamMatrix,
  PartnershipHistory,
  StatusTriptych,
  ProofCollage,
  MetricHorizon,
  ValueBridge,
  SixStepGrid,
  CaseStudyEvidence,
  DualTrend,
  AgentPipeline,
  RiskLandscape,
  UseCaseGallery,
  BinaryModel,
  ProductDemo,
  AgentPrimitives,
  PartnerInterstitial,
  ProductEcosystem,
  WordmarkGallery,
  IconGallery,
  PixelGallery,
  LilPixGallery,
  Questions,
  Closing,
] satisfies Page[];
