import type { Metadata } from 'next';
import '@open-slide/core/geist.css';
import './styles.css';

export const metadata: Metadata = {
  title: 'Vercel Slides',
  description: 'Create and share Vercel presentations.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
