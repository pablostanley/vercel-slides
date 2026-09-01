import geistPixelFont from '@assets/vercel/fonts/GeistPixel-Square.woff2';
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
  typeScale: { hero: 152, body: 34 },
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

const FONT_STYLE_ID = 'osd-font-vercel-starter';
if (typeof document !== 'undefined' && !document.getElementById(FONT_STYLE_ID)) {
  const style = document.createElement('style');
  style.id = FONT_STYLE_ID;
  style.textContent = `@font-face { font-family: 'Geist Pixel'; src: url('${geistPixelFont}') format('woff2'); font-style: normal; font-weight: 400; font-display: swap; }`;
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
};

const Footer = ({ label = 'Vercel presentation' }: { label?: string }) => {
  const { current, total } = useSlidePageNumber();
  return (
    <div
      style={{
        position: 'absolute',
        left: 120,
        right: 120,
        bottom: 40,
        zIndex: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: palette.faint,
        fontFamily: fonts.mono,
        fontSize: 18,
        lineHeight: 1,
        letterSpacing: '0.04em',
      }}
    >
      <span>{label}</span>
      <span>
        {String(current).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </span>
    </div>
  );
};

const Brand = () => (
  <img
    src={vercelWordmark}
    alt="Vercel"
    style={{
      position: 'absolute',
      top: 64,
      right: 120,
      zIndex: 3,
      width: 150,
      height: 'auto',
    }}
  />
);

const SlideFrame = ({
  children,
  label,
  padding = '112px 120px 96px',
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
      inset: 0,
      backgroundImage:
        'linear-gradient(#1F1F1F 1px, transparent 1px), linear-gradient(90deg, #1F1F1F 1px, transparent 1px)',
      backgroundSize: '120px 120px',
      opacity: 0.72,
    }}
  >
    <div
      style={{
        position: 'absolute',
        inset: 120,
        background: '#000000',
        border: `1px solid ${palette.line}`,
      }}
    />
  </div>
);

const Eyebrow = ({ children, color = palette.muted }: { children: ReactNode; color?: string }) => (
  <div
    style={{
      color,
      fontFamily: fonts.mono,
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

const PageTitle = ({ children, width = 1450 }: { children: ReactNode; width?: number }) => (
  <h2
    style={{
      maxWidth: width,
      margin: 0,
      fontSize: 72,
      fontWeight: 600,
      lineHeight: 1.08,
      letterSpacing: '-0.04em',
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
        fontSize: 42,
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
    <div style={{ fontSize: 92, fontWeight: 600, lineHeight: 1, letterSpacing: '-0.06em' }}>
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
    <img
      src={vercelWordmark}
      alt="Vercel"
      style={{ position: 'absolute', top: 64, left: 120, width: 166 }}
    />
    <div className="vercel-starter-enter">
      <Eyebrow>Internal presentation · 2026</Eyebrow>
      <h1
        style={{
          maxWidth: 1500,
          margin: '40px 0 0',
          fontSize: 'var(--osd-size-hero)',
          fontWeight: 600,
          lineHeight: 0.96,
          letterSpacing: '-0.055em',
        }}
      >
        Build what comes next.
      </h1>
      <p
        style={{
          maxWidth: 1120,
          margin: '48px 0 0',
          color: palette.muted,
          fontSize: 34,
          lineHeight: 1.45,
          letterSpacing: '-0.02em',
        }}
      >
        A complete starter system for Vercel product, strategy, technical, and company
        presentations.
      </p>
    </div>
    <div
      style={{
        position: 'absolute',
        left: 120,
        bottom: 48,
        color: palette.faint,
        fontFamily: fonts.mono,
        fontSize: 18,
      }}
    >
      Prepared by [Team / Author]
    </div>
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
    <img
      src={vercelWordmark}
      alt="Vercel"
      style={{ position: 'absolute', top: 64, left: 120, width: 150 }}
    />
    <div className="vercel-starter-enter">
      <Eyebrow>Product update</Eyebrow>
      <h1
        style={{
          margin: '40px 0 0',
          fontSize: 128,
          fontWeight: 600,
          lineHeight: 0.98,
          letterSpacing: '-0.055em',
        }}
      >
        The AI SDK for TypeScript.
      </h1>
      <p style={{ margin: '44px 0 0', color: palette.muted, fontSize: 34, lineHeight: 1.45 }}>
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
          fontSize: 112,
          fontWeight: 600,
          lineHeight: 1,
          letterSpacing: '-0.055em',
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
          fontSize: 104,
          fontWeight: 600,
          lineHeight: 1.03,
          letterSpacing: '-0.052em',
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
        fontSize: 36,
        lineHeight: 1.5,
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
  <SlideFrame label="Quote" padding="112px 160px 96px">
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
          fontSize: 82,
          fontWeight: 500,
          lineHeight: 1.08,
          letterSpacing: '-0.045em',
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
          fontSize: 280,
          fontWeight: 600,
          lineHeight: 0.88,
          letterSpacing: '-0.08em',
        }}
      >
        4×
      </div>
      <p
        style={{
          maxWidth: 1120,
          margin: '56px 0 0',
          color: palette.muted,
          fontSize: 38,
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
    <div style={{ marginTop: 54, fontSize: 118, fontWeight: 600, letterSpacing: '-0.065em' }}>
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
      fontSize: 27,
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
  `[Sources]\nCanonical product marks: vercel/front@b0146c25ccd240c77d34264a95bd98a15eaa9c92, packages/geistcn-assets/src/__generated__/svgs/.`,
  `[Sources]\nCanonical wordmarks: vercel/front@b0146c25ccd240c77d34264a95bd98a15eaa9c92. FX glyph: apps/vercel-site/app/(dashboard)/components/dash-promotions/promos/fx-glm52-free.tsx at the same commit.`,
  `[Sources]\nCanonical product icons: vercel/front@b0146c25ccd240c77d34264a95bd98a15eaa9c92, packages/geistcn-assets/src/__generated__/svgs/icons/logo/.`,
  `[Sources]\nGeist pixel matrices: vercel/front@b0146c25ccd240c77d34264a95bd98a15eaa9c92, packages/geistcn-assets/src/pixels/named/.`,
  `[Sources]\nLil Pix SVG and animation URLs: vercel/front@b0146c25ccd240c77d34264a95bd98a15eaa9c92.`,
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
  ProductEcosystem,
  WordmarkGallery,
  IconGallery,
  PixelGallery,
  LilPixGallery,
  Questions,
  Closing,
] satisfies Page[];
