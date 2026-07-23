import { ReactNode } from 'react';
import { Vazirmatn } from 'next/font/google';
import './globals.css';
import ClientShell from './client-shell';

const vazirmatn = Vazirmatn({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-vazirmatn',
  display: 'swap',
});

interface RootLayoutProps { children: ReactNode; }

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        {/* Viewport Meta Tags - Mobile First */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#08090B" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* SEO & Social Meta Tags */}
        <meta name="description" content="\u0622\u06cc\u0627\u0646\u062a\u0627\u0631\u0627\u0632 - \u067e\u0644\u062a\u0641\u0631\u0645 \u062d\u0631\u0641\u0647\u060c\u0627\u06cc \u0645\u0634\u0627\u0648\u0631\u0647 \u0645\u0627\u0644\u06cc\u0627\u062a\u06cc \u0648 \u062d\u0633\u0627\u0628\u062f\u0627\u0631\u06cc \u0628\u0627 \u062a\u062c\u0631\u0628\u0647 \u06a9\u0627\u0631\u0628\u0631\u06cc \u0644\u0648\u06a9\u0633 \u0648 \u0645\u062f\u0631\u0646" />
        <meta name="keywords" content="\u0645\u0627\u0644\u06cc\u0627\u062a, \u062d\u0633\u0627\u0628\u062f\u0627\u0631\u06cc, \u0645\u0634\u0627\u0648\u0631\u0647 \u0645\u0627\u0644\u06cc\u0627\u062a\u06cc, \u0622\u06cc\u0627\u0646\u062a\u0627\u0631\u0627\u0632, \u0645\u0627\u0644\u06cc\u0627\u062a \u0627\u06cc\u0631\u0627\u0646, \u062d\u0633\u0627\u0628\u062f\u0627\u0631\u06cc \u062d\u0641\u0647\u060c\u0627\u06cc" />
        <meta name="author" content="Ayan Taraz" />
        <meta property="og:title" content="\u0622\u06cc\u0627\u0646\u062a\u0627\u0631\u0627\u0632 - \u0645\u0634\u0627\u0648\u0631\u0647 \u062a\u062e\u0635\u0635\u06cc \u0645\u0627\u0644\u06cc\u0627\u062a\u06cc \u0648 \u062d\u0633\u0627\u0628\u062f\u0627\u0631\u06cc" />
        <meta property="og:description" content="\u067e\u0644\u062a\u0641\u0631\u0645 \u062d\u0631\u0641\u0647\u060c\u0627\u06cc \u0645\u0634\u0627\u0648\u0631\u0647 \u0645\u0627\u0644\u06cc\u0627\u062a\u06cc \u0648 \u062d\u0633\u0627\u0628\u062f\u0627\u0631\u06cc \u0628\u0627 \u062a\u062c\u0631\u0628\u0647 \u06a9\u0627\u0631\u0628\u0631\u06cc \u0644\u0648\u06a9\u0633" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="fa_IR" />
        
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Fonts */}
        <link href="https://fonts.googleapis.com/css2?family=IRANSansX:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Anjoman:wght@400;500;600;700&display=swap" rel="stylesheet" />
        
        <title>\u0622\u06cc\u0627\u0646\u062a\u0627\u0631\u0627\u0632 | \u0645\u0634\u0627\u0648\u0631\u0647 \u062a\u062e\u0635\u0635\u06cc \u0645\u0627\u0644\u06cc\u0627\u062a \u0648 \u062d\u0633\u0627\u0628\u062f\u0627\u0631\u06cc</title>
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/logo-mobile.webp" />
      </head>
      <body 
        className={`${vazirmatn.className} antialiased`}
        style={{
          backgroundColor: 'var(--color-background-primary)',
          color: 'var(--color-text-primary)',
        }}
      >
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
