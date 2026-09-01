import type { CSSProperties, ReactNode, PointerEvent as ReactPointerEvent } from 'react';
import type { SlideDocument, SlideElement } from './schema';

export type SlideRendererProps = {
  document: SlideDocument;
  className?: string;
  selectedElementIds?: string[];
  interactive?: boolean;
  onSelectElement?: (elementId: string, additive: boolean) => void;
  onElementPointerDown?: (elementId: string, event: ReactPointerEvent<SVGGElement>) => void;
  onResizePointerDown?: (
    elementId: string,
    handle: 'nw' | 'ne' | 'sw' | 'se',
    event: ReactPointerEvent<SVGCircleElement>,
  ) => void;
  onTextChange?: (elementId: string, text: string) => void;
};

function fontFamily(value: 'geist-sans' | 'geist-mono') {
  return value === 'geist-mono'
    ? 'var(--font-geist-mono, "Geist Mono"), monospace'
    : 'var(--font-geist-sans, Geist), sans-serif';
}

function baseStyle(element: SlideElement): CSSProperties {
  return {
    width: '100%',
    height: '100%',
    opacity: element.opacity,
    overflow: 'hidden',
    pointerEvents: element.locked ? 'none' : 'auto',
  };
}

function textStyle(element: Extract<SlideElement, { type: 'text' | 'richText' | 'list' }>) {
  return {
    ...baseStyle(element),
    display: 'flex',
    alignItems:
      element.style.verticalAlign === 'middle'
        ? 'center'
        : element.style.verticalAlign === 'bottom'
          ? 'flex-end'
          : 'flex-start',
    color: element.style.color,
    fontFamily: fontFamily(element.style.fontFamily),
    fontSize: element.style.fontSize,
    fontWeight: element.style.fontWeight,
    letterSpacing: element.style.letterSpacing,
    lineHeight: element.style.lineHeight,
    textAlign: element.style.align,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  } satisfies CSSProperties;
}

function boxStyle(
  style: Extract<SlideElement, { type: 'image' | 'shape' | 'chart' | 'code' }>['style'],
) {
  return {
    background: style.fill,
    border: style.strokeWidth ? `${style.strokeWidth}px solid ${style.stroke}` : undefined,
    borderRadius: style.radius,
    boxShadow: style.shadow
      ? `${style.shadow.x}px ${style.shadow.y}px ${style.shadow.blur}px ${style.shadow.spread}px ${style.shadow.color}`
      : undefined,
  } satisfies CSSProperties;
}

function RichText({ element }: { element: Extract<SlideElement, { type: 'richText' }> }) {
  return (
    <div style={{ ...textStyle(element), display: 'block' }}>
      {element.paragraphs.map((paragraph) => (
        <p key={paragraph.id} style={{ margin: 0, textAlign: paragraph.align }}>
          {paragraph.runs.map((run) => (
            <span
              key={`${paragraph.id}:${run.text}:${run.color ?? ''}:${run.bold ? 'bold' : ''}`}
              style={{
                color: run.color,
                fontStyle: run.italic ? 'italic' : undefined,
                fontWeight: run.bold ? 650 : undefined,
                textDecoration: run.underline ? 'underline' : undefined,
                fontFamily: run.code ? fontFamily('geist-mono') : undefined,
              }}
            >
              {run.text}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}

function Chart({ element }: { element: Extract<SlideElement, { type: 'chart' }> }) {
  const values = element.series
    .flatMap((series) => series.values)
    .filter((value) => value !== null);
  const max = Math.max(1, ...values.map((value) => Math.abs(value ?? 0)));
  const count = Math.max(1, element.categories.length);
  return (
    <svg
      viewBox={`0 0 ${element.width} ${element.height}`}
      width="100%"
      height="100%"
      aria-hidden="true"
    >
      {element.showGrid &&
        [0.25, 0.5, 0.75].map((ratio) => (
          <line
            key={ratio}
            x1="0"
            x2={element.width}
            y1={element.height * ratio}
            y2={element.height * ratio}
            stroke="#eaeaea"
            strokeWidth="2"
          />
        ))}
      {element.chart === 'bar'
        ? element.series.flatMap((series, seriesIndex) =>
            series.values.map((value, index) => {
              const slot = element.width / count;
              const width = (slot * 0.72) / Math.max(1, element.series.length);
              const height = ((value ?? 0) / max) * (element.height * 0.78);
              return (
                <rect
                  key={`${series.id}:${element.categories[index] ?? value ?? 'empty'}`}
                  x={slot * index + slot * 0.14 + width * seriesIndex}
                  y={element.height - height}
                  width={width}
                  height={height}
                  fill={series.color}
                  rx={Math.min(8, width / 5)}
                />
              );
            }),
          )
        : element.series.map((series) => {
            const points = series.values
              .map((value, index) => {
                const x = count === 1 ? element.width / 2 : (index / (count - 1)) * element.width;
                const y = element.height - ((value ?? 0) / max) * (element.height * 0.84);
                return `${x},${y}`;
              })
              .join(' ');
            return (
              <polyline
                key={series.id}
                points={points}
                fill={element.chart === 'area' ? `${series.color}22` : 'none'}
                stroke={series.color}
                strokeWidth="8"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            );
          })}
    </svg>
  );
}

function Primitive({ element }: { element: Extract<SlideElement, { type: 'primitive' }> }) {
  const first = element.colors[0] ?? '#000000';
  const second = element.colors[1] ?? '#ffffff';
  if (element.primitive === 'gradient-orb') {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: `radial-gradient(circle at 35% 30%, ${second}, ${first})`,
          filter: 'blur(2px)',
        }}
      />
    );
  }
  if (element.primitive === 'grid' || element.primitive === 'pixel-field') {
    const size = Math.max(6, 30 - element.density * 2);
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `radial-gradient(${first} 1.5px, transparent 1.5px)`,
          backgroundSize: `${size}px ${size}px`,
        }}
      />
    );
  }
  return <div style={{ width: '100%', height: '100%', background: first }} />;
}

function metricTextStyle(
  element: Extract<SlideElement, { type: 'metric' }>,
  style: Extract<SlideElement, { type: 'metric' }>['valueStyle'],
): CSSProperties {
  return {
    color: style.color,
    fontFamily: fontFamily(style.fontFamily),
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    letterSpacing: style.letterSpacing,
    lineHeight: style.lineHeight,
    textAlign: style.align,
    opacity: element.opacity,
  };
}

function ElementContent({
  element,
  interactive,
  onTextChange,
}: {
  element: SlideElement;
  interactive: boolean;
  onTextChange?: SlideRendererProps['onTextChange'];
}): ReactNode {
  switch (element.type) {
    case 'text':
      return interactive && !element.locked ? (
        <textarea
          style={{
            ...textStyle(element),
            padding: 0,
            border: 0,
            outline: 0,
            resize: 'none',
            background: 'transparent',
          }}
          value={element.text}
          spellCheck
          aria-label={element.accessibility?.label ?? 'Slide text'}
          onChange={(event) => onTextChange?.(element.id, event.currentTarget.value)}
        />
      ) : (
        <div style={textStyle(element)}>{element.text}</div>
      );
    case 'richText':
      return <RichText element={element} />;
    case 'image':
      return (
        <div style={{ ...baseStyle(element), ...boxStyle(element.style) }}>
          <img
            src={element.src}
            alt={element.alt}
            draggable={false}
            style={{ width: '100%', height: '100%', display: 'block', objectFit: element.fit }}
          />
        </div>
      );
    case 'shape': {
      const clipPath =
        element.shape === 'triangle'
          ? 'polygon(50% 0, 100% 100%, 0 100%)'
          : element.shape === 'diamond'
            ? 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)'
            : undefined;
      return (
        <div
          style={{
            ...baseStyle(element),
            ...boxStyle(element.style),
            borderRadius:
              element.shape === 'ellipse'
                ? '50%'
                : element.shape === 'pill'
                  ? Math.max(element.width, element.height)
                  : element.style.radius,
            clipPath,
          }}
        />
      );
    }
    case 'line':
      return (
        <svg
          viewBox={`0 0 ${element.width} ${Math.max(element.height, element.strokeWidth)}`}
          aria-hidden="true"
        >
          <line
            x1="0"
            y1="0"
            x2={element.width}
            y2={element.height}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            strokeDasharray={element.dash?.join(' ')}
          />
        </svg>
      );
    case 'group':
      return null;
    case 'list': {
      const List = element.ordered ? 'ol' : 'ul';
      return (
        <List style={{ ...textStyle(element), display: 'block', margin: 0, paddingLeft: '1.15em' }}>
          {element.items.map((item) => (
            <li key={`${element.id}:${item}`} style={{ marginBottom: element.gap }}>
              {item}
            </li>
          ))}
        </List>
      );
    }
    case 'metric':
      return (
        <div style={{ ...baseStyle(element), display: 'grid', alignContent: 'start' }}>
          <span style={metricTextStyle(element, element.valueStyle)}>{element.value}</span>
          <span style={metricTextStyle(element, element.labelStyle)}>{element.label}</span>
          {element.detail && <small>{element.detail}</small>}
        </div>
      );
    case 'table':
      return (
        <table
          style={{
            ...baseStyle(element),
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
            fontFamily: fontFamily(element.style.text.fontFamily),
            fontSize: element.style.text.fontSize,
            color: element.style.text.color,
          }}
        >
          <colgroup>
            {element.columns.map((column) => (
              <col key={`${element.id}:col:${column}`} style={{ width: column }} />
            ))}
          </colgroup>
          <tbody>
            {element.rows.map((row, rowIndex) => (
              <tr key={`${element.id}:row:${JSON.stringify(row)}`}>
                {row.map((cell) => (
                  <td
                    key={`${element.id}:cell:${JSON.stringify(cell)}`}
                    colSpan={cell.colspan}
                    rowSpan={cell.rowspan}
                    style={{
                      padding: element.style.padding,
                      border: `${element.style.borderWidth}px solid ${element.style.border}`,
                      background:
                        rowIndex < element.headerRows
                          ? element.style.headerFill
                          : element.style.fill,
                      fontWeight: rowIndex < element.headerRows ? 600 : 400,
                    }}
                  >
                    {cell.value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    case 'chart':
      return (
        <div style={{ ...baseStyle(element), ...boxStyle(element.style) }}>
          <Chart element={element} />
        </div>
      );
    case 'code':
      return (
        <pre
          style={{
            ...baseStyle(element),
            ...boxStyle(element.style),
            margin: 0,
            padding: 28,
            color: element.theme === 'dark' ? '#ededed' : '#171717',
            background: element.style.fill ?? (element.theme === 'dark' ? '#111111' : '#fafafa'),
            fontFamily: fontFamily('geist-mono'),
            fontSize: 24,
            lineHeight: 1.45,
            whiteSpace: 'pre-wrap',
          }}
        >
          {element.code}
        </pre>
      );
    case 'logo':
      return element.asset === 'vercel-mark' ? (
        <svg viewBox="0 0 76 65" width="100%" height="100%" aria-label={element.alt}>
          <path d="M38 0 76 65H0Z" fill={element.color} />
        </svg>
      ) : element.src ? (
        <img src={element.src} alt={element.alt} style={baseStyle(element)} draggable={false} />
      ) : (
        <div style={{ ...baseStyle(element), color: element.color, fontWeight: 650 }}>VERCEL</div>
      );
    case 'primitive':
      return <Primitive element={element} />;
  }
}

export function SlideRenderer({
  document,
  className,
  selectedElementIds = [],
  interactive = false,
  onSelectElement,
  onElementPointerDown,
  onResizePointerDown,
  onTextChange,
}: SlideRendererProps) {
  const selected = new Set(selectedElementIds);
  return (
    <svg
      className={className}
      viewBox={`0 0 ${document.width} ${document.height}`}
      role="img"
      aria-label={document.accessibility?.title ?? 'Presentation slide'}
      preserveAspectRatio="xMidYMid meet"
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        background: document.background.color,
      }}
    >
      {document.background.image && (
        <image href={document.background.image} width={document.width} height={document.height} />
      )}
      {[...document.elements]
        .filter((element) => element.visible)
        .sort((left, right) => left.zIndex - right.zIndex)
        .map((element) => (
          <g
            key={element.id}
            data-element-id={element.id}
            transform={`translate(${element.x} ${element.y}) rotate(${element.rotation} ${element.width / 2} ${element.height / 2})`}
            onPointerDown={(event) => {
              if (!interactive || element.locked) return;
              onSelectElement?.(element.id, event.shiftKey || event.metaKey || event.ctrlKey);
              onElementPointerDown?.(element.id, event);
            }}
            style={{ cursor: interactive && !element.locked ? 'move' : undefined }}
          >
            <foreignObject width={element.width} height={element.height}>
              <ElementContent
                element={element}
                interactive={interactive}
                onTextChange={onTextChange}
              />
            </foreignObject>
            {selected.has(element.id) && (
              <>
                <rect
                  x="-3"
                  y="-3"
                  width={element.width + 6}
                  height={element.height + 6}
                  fill="none"
                  stroke="#0070f3"
                  strokeWidth="4"
                  vectorEffect="non-scaling-stroke"
                  pointerEvents="none"
                />
                {(
                  [
                    ['nw', 0, 0],
                    ['ne', element.width, 0],
                    ['sw', 0, element.height],
                    ['se', element.width, element.height],
                  ] as const
                ).map(([handle, x, y]) => (
                  <circle
                    key={handle}
                    cx={x}
                    cy={y}
                    r="9"
                    fill="white"
                    stroke="#0070f3"
                    strokeWidth="4"
                    vectorEffect="non-scaling-stroke"
                    style={{ cursor: `${handle}-resize` }}
                    onPointerDown={(event) => {
                      event.stopPropagation();
                      onResizePointerDown?.(element.id, handle, event);
                    }}
                  />
                ))}
              </>
            )}
          </g>
        ))}
    </svg>
  );
}
