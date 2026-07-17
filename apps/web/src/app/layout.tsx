import { ReactNode } from 'react';
import localFont from 'next/font/local';
import './globals.css';
import ClientShell from './client-shell';

const vazirmatn = localFont({
  src: [
    { path: '../../public/fonts/Vazirmatn-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/Vazirmatn-Bold.woff2', weight: '700', style: 'normal' },
    { path: '../../public/fonts/Vazirmatn-ExtraBold.woff2', weight: '800', style: 'normal' },
  ],
  variable: '--font-vazirmatn',
});

interface RootLayoutProps { children: ReactNode; }

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="آیانتاراز - پلتفرم حرفه‌ای مشاوره مالیاتی" />
        <title>آیانتاراز</title>
      </head>
      <body className={vazirmatn.className}>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
