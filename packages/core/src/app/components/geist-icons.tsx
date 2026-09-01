import type { ReactNode, SVGProps } from 'react';

export type GeistIconProps = Omit<SVGProps<SVGSVGElement>, 'height' | 'width'> & {
  size?: number | string;
};

function GeistIcon({ children, size = 16, ...props }: GeistIconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <title>Vercel interface icon</title>
      {children}
    </svg>
  );
}

export function IconMagnifyingGlass(props: GeistIconProps) {
  return (
    <GeistIcon {...props}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M1.5 6.5a5 5 0 1 1 10 0 5 5 0 0 1-10 0m5-6.5a6.5 6.5 0 1 0 4.04 11.6l3.43 3.43.53.53 1.06-1.06-.53-.53-3.43-3.43A6.5 6.5 0 0 0 6.5 0"
        clipRule="evenodd"
      />
    </GeistIcon>
  );
}

export function IconMenu(props: GeistIconProps) {
  return (
    <GeistIcon {...props}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M1.75 4H1v1.5h14V4H1.75m0 6.5H1V12h14v-1.5H1.75"
        clipRule="evenodd"
      />
    </GeistIcon>
  );
}

export function IconPlay(props: GeistIconProps) {
  return (
    <GeistIcon {...props}>
      <path
        fill="currentColor"
        d="M2 1.4c0-.18.2-.3.36-.22l13.2 6.6c.18.09.18.35 0 .44l-13.2 6.6A.25.25 0 0 1 2 14.6zm1.5 11.17L12.65 8 3.5 3.43z"
      />
    </GeistIcon>
  );
}

export function IconPlus(props: GeistIconProps) {
  return (
    <GeistIcon {...props}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M8.75 2.25V1.5h-1.5v5.75H1.5v1.5h5.75v5.75h1.5V8.75h5.75v-1.5H8.75z"
        clipRule="evenodd"
      />
    </GeistIcon>
  );
}

export function IconGridSquare(props: GeistIconProps) {
  return (
    <GeistIcon {...props}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M2.5 5.5v-3h3v3zM1 2a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm1.5 11.5v-3h3v3zM1 10a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm9.5-7.5v3h3v-3zM10 1a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zm.5 12.5v-3h3v3zM9 10a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z"
        clipRule="evenodd"
      />
    </GeistIcon>
  );
}

export function IconPen(props: GeistIconProps) {
  return (
    <GeistIcon {...props}>
      <path
        fill="currentColor"
        d="m15.81 7.25-2.07 2.07c-.55.55-1.37.66-2.02.33l-2.17 3.9A4.8 4.8 0 0 1 5.4 16H0v-5.4C0 8.88.94 7.3 2.44 6.45l3.9-2.17a1.75 1.75 0 0 1 .34-2.02L8.75.2zm-12.64.51A3.3 3.3 0 0 0 1.5 10.6v2.84l2.97-2.97 1.06 1.06-2.97 2.97H5.4c1.18 0 2.26-.64 2.84-1.67l2.33-4.2-3.2-3.2zm4.57-4.44c-.1.1-.1.26 0 .36l4.58 4.58c.1.1.26.1.36 0l1.01-1.01-4.94-4.94z"
      />
    </GeistIcon>
  );
}

export function IconPrismColor(props: GeistIconProps) {
  return (
    <GeistIcon {...props}>
      <path stroke="var(--ds-red-700)" strokeWidth="1.5" d="m9 7 3.5-4.5" />
      <path stroke="var(--ds-blue-600)" strokeWidth="1.5" d="m10.5 9.5 5.25 1" />
      <path stroke="var(--ds-teal-600)" strokeWidth="1.5" d="m10 8 5.75-2" />
      <path fill="currentColor" d="M13 13H1l2.32-4.25H0v-1.5h4.14L7 2zm-9.47-1.5h6.94L7 5.13z" />
    </GeistIcon>
  );
}

export function IconFolderOpen(props: GeistIconProps) {
  return (
    <GeistIcon {...props}>
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M13.5 4v2h-11V2.5H6l1.33 1q.68.49 1.5.5zM1 6V1h5.17a1 1 0 0 1 .6.2l1.46 1.1a1 1 0 0 0 .6.2H15V6h1l-.17 1.5-.58 5.28A2.5 2.5 0 0 1 12.76 15H3.24a2.5 2.5 0 0 1-2.49-2.22L.17 7.5 0 6zm13 1.5H1.68l.56 5.11a1 1 0 0 0 1 .89h9.52a1 1 0 0 0 1-.89l.56-5.11z"
        clipRule="evenodd"
      />
    </GeistIcon>
  );
}
