import type { Metadata } from 'next';
import './globals.css';
import { IdentityProvider } from '@/context/IdentityContext';

export const metadata: Metadata = {
  title: 'LiveDRIVE — Watch Together Anywhere',
  description:
    'The privacy-first, zero-registration, real-time synchronized video theater for YouTube, Vimeo, direct MP4, and HLS streams.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Syne:wght@700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-bg text-cream antialiased">
        <IdentityProvider>
          {children}
        </IdentityProvider>
      </body>
    </html>
  );
}
