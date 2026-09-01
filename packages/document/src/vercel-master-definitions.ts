export type VercelMasterDefinition = {
  slug: string;
  title: string;
  category: string;
  tags: string[];
};

const definitions = [
  ['cover', 'Cover', 'Covers'],
  ['product-cover', 'Product cover', 'Product'],
  ['agenda', 'Agenda', 'Agenda'],
  ['section-divider', 'Section divider', 'Sections'],
  ['statement', 'Statement', 'Statements'],
  ['title-and-body', 'Title and body', 'Content'],
  ['bullets', 'Bullets', 'Content'],
  ['two-columns', 'Two columns', 'Content'],
  ['three-pillars', 'Three pillars', 'Content'],
  ['quote', 'Quote', 'Statements'],
  ['big-number', 'Big number', 'Data'],
  ['metrics', 'Metrics', 'Data'],
  ['comparison', 'Comparison', 'Comparison'],
  ['timeline', 'Timeline', 'Roadmaps'],
  ['process', 'Process', 'Roadmaps'],
  ['chart', 'Chart', 'Data'],
  ['data-table', 'Data table', 'Data'],
  ['code', 'Code', 'Technical'],
  ['screenshot', 'Screenshot', 'Product'],
  ['split-image', 'Split image', 'Content'],
  ['full-bleed-image', 'Full-bleed image', 'Content'],
  ['architecture', 'Architecture', 'Technical'],
  ['roadmap', 'Roadmap', 'Roadmaps'],
  ['launch-reveal', 'Launch reveal', 'Product'],
  ['session-title', 'Session title', 'Covers'],
  ['team-lineup', 'Team lineup', 'Team'],
  ['customer-story', 'Customer story', 'Partnership'],
  ['data-story', 'Data story', 'Data'],
  ['decision', 'Decision', 'Comparison'],
  ['principles', 'Principles', 'Content'],
  ['risk-register', 'Risk register', 'Comparison'],
  ['option-spectrum', 'Option spectrum', 'Comparison'],
  ['progress-rail', 'Progress rail', 'Roadmaps'],
  ['photo-quote', 'Photo quote', 'Statements'],
  ['team-update', 'Team update', 'Team'],
  ['executive-cover', 'Executive cover', 'Covers'],
  ['visual-agenda', 'Visual agenda', 'Agenda'],
  ['presenter-roster', 'Presenter roster', 'Team'],
  ['partnership-stream', 'Partnership stream', 'Partnership'],
  ['workstream-matrix', 'Workstream matrix', 'Partnership'],
  ['partnership-history', 'Partnership history', 'Partnership'],
  ['status-triptych', 'Status triptych', 'Partnership'],
  ['proof-collage', 'Proof collage', 'Partnership'],
  ['metric-horizon', 'Metric horizon', 'Data'],
  ['value-bridge', 'Value bridge', 'Comparison'],
  ['six-step-grid', 'Six-step grid', 'Roadmaps'],
  ['case-study-evidence', 'Case study evidence', 'Partnership'],
  ['dual-trend', 'Dual trend', 'Data'],
  ['agent-pipeline', 'Agent pipeline', 'Technical'],
  ['risk-landscape', 'Risk landscape', 'Comparison'],
  ['use-case-gallery', 'Use case gallery', 'Product'],
  ['binary-model', 'Binary model', 'Technical'],
  ['product-demo', 'Product demo', 'Product'],
  ['agent-primitives', 'Agent primitives', 'Technical'],
  ['partner-interstitial', 'Partner interstitial', 'Partnership'],
  ['product-ecosystem', 'Product ecosystem', 'Product'],
  ['wordmark-gallery', 'Wordmark gallery', 'Brand Assets'],
  ['icon-gallery', 'Icon gallery', 'Brand Assets'],
  ['pixel-gallery', 'Pixel gallery', 'Brand Assets'],
  ['lil-pix-gallery', 'Lil Pix gallery', 'Brand Assets'],
  ['questions', 'Questions', 'Closing'],
  ['closing', 'Closing', 'Closing'],
] as const;

export const VERCEL_MASTER_DEFINITIONS: VercelMasterDefinition[] = definitions.map(
  ([slug, title, category]) => ({
    slug,
    title,
    category,
    tags: Array.from(
      new Set(
        `${slug} ${title} ${category}`
          .toLowerCase()
          .split(/[^a-z0-9]+/)
          .filter(Boolean),
      ),
    ),
  }),
);
