import { ReactNode } from 'react';
import { Vazirmatn } from 'next/font/google';
import './globals.css';
import ClientShell from './client-shell';

const vazirmatn = Vazirmatn({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
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
