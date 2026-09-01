import {
  createBlankSlideDocument,
  createDocumentId,
  type SlideDocument,
  type SlideElement,
  slideDocumentSchema,
  type TextElement,
} from './schema';

const black = '#000000';
const gray = '#666666';

function text(
  value: string,
  x: number,
  y: number,
  width: number,
  height: number,
  fontSize: number,
  weight = 400,
  color = black,
): TextElement {
  return {
    id: createDocumentId('element'),
    type: 'text',
    x,
    y,
    width,
    height,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    zIndex: 10,
    text: value,
    style: {
      fontFamily: 'geist-sans',
      fontSize,
      fontWeight: weight,
      lineHeight: 1.05,
      letterSpacing: fontSize > 70 ? -2 : 0,
      color,
      align: 'left',
      verticalAlign: 'top',
    },
  };
}

function documentWith(elements: SlideElement[]): SlideDocument {
  const document = createBlankSlideDocument();
  return slideDocumentSchema.parse({ ...document, elements });
}

export function createVercelStarterDocuments(): SlideDocument[] {
  return [
    documentWith([
      text('▲', 96, 84, 80, 80, 52, 700),
      text('What will you ship next?', 96, 410, 1420, 220, 128, 520),
      text('Vercel presentation', 96, 930, 600, 40, 24, 450, gray),
    ]),
    documentWith([
      text('Agenda', 96, 84, 800, 100, 72, 550),
      text('01  Context\n02  Opportunity\n03  Plan\n04  Decision', 96, 310, 1200, 430, 52, 450),
      text('02', 1760, 930, 64, 30, 18, 500, gray),
    ]),
    documentWith([
      text('01', 96, 90, 200, 80, 48, 500, gray),
      text('The opportunity', 96, 430, 1500, 150, 110, 520),
      text('A clear section marker keeps the story moving.', 100, 600, 900, 60, 28, 400, gray),
    ]),
    documentWith([
      text('The idea in one sentence', 96, 84, 1400, 90, 64, 550),
      text(
        'Use this space for the essential argument. Keep the title decisive and the body specific enough to stand on its own.',
        96,
        310,
        1120,
        270,
        42,
        400,
        gray,
      ),
      text('04', 1760, 930, 64, 30, 18, 500, gray),
    ]),
    documentWith([
      text('Momentum compounds', 96, 84, 1200, 90, 64, 550),
      {
        id: createDocumentId('element'),
        type: 'chart',
        x: 96,
        y: 270,
        width: 1728,
        height: 640,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        zIndex: 10,
        chart: 'bar',
        categories: ['Q1', 'Q2', 'Q3', 'Q4'],
        series: [
          {
            id: createDocumentId('series'),
            name: 'Adoption',
            values: [22, 41, 68, 94],
            color: black,
          },
        ],
        showLegend: false,
        showAxes: true,
        showGrid: true,
        style: { fill: '#ffffff', strokeWidth: 0, radius: 0 },
      },
    ]),
    documentWith([
      text('Decision', 96, 84, 800, 90, 64, 550),
      text('Move forward', 96, 340, 760, 100, 72, 520),
      text(
        'The expected impact outweighs the implementation cost.',
        96,
        470,
        700,
        140,
        32,
        400,
        gray,
      ),
      text('Hold', 1050, 340, 600, 100, 72, 520, gray),
      text(
        'Document the reason and the condition that would change the decision.',
        1050,
        470,
        700,
        140,
        32,
        400,
        gray,
      ),
    ]),
    documentWith([
      text('Thank you.', 96, 410, 1300, 160, 128, 520),
      text('Questions and next steps', 100, 610, 760, 50, 28, 400, gray),
      text('▲', 1744, 900, 80, 80, 52, 700),
    ]),
  ];
}
