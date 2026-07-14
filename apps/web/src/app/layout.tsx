import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/lib/auth';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ChatbotWidget from '@/components/chatbot/ChatbotWidget';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://202.133.91.13';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0A0A0A',
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: {
    default: 'آیان تراز | خدمات حسابداری و مشاوره مالیاتی',
    template: '%s | آیان تراز',
  },
  description: 'ارائه خدمات حسابداری، مشاوره مالیاتی، تنظیم اظهارنامه و آموزش مالی با تیمی متخصص. بیش از ۱۵ سال سابقه درخشان.',
  keywords: ['حسابداری', 'مشاوره مالیاتی', 'مالیات', 'اظهارنامه', 'آموزش حسابداری', 'خدمات مالی', 'آیان تراز'],
  authors: [{ name: 'آیان تراز' }],
  creator: 'آیان تراز',
  publisher: 'آیان تراز',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'آیان تراز | خدمات حسابداری و مشاوره مالیاتی',
    description: 'ارائه خدمات حسابداری، مشاوره مالیاتی و آموزش مالی با تیمی متخصص',
    type: 'website',
    locale: 'fa_IR',
    url: SITE_URL,
    siteName: 'آیان تراز',
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'آیان تراز - خدمات حسابداری و مالیاتی',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'آیان تراز | خدمات حسابداری و مشاوره مالیاتی',
    description: 'ارائه خدمات حسابداری، مشاوره مالیاتی و آموزش مالی',
    images: [`${SITE_URL}/og-image.png`],
    creator: '@ayantaraz',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon-32x32.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: SITE_URL,
    languages: {
      'fa-IR': SITE_URL,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'آیان تراز',
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
        description: 'ارائه خدمات حسابداری، مشاوره مالیاتی و آموزش مالی با تیمی متخصص',
        foundingDate: '2008',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'IR',
          addressLocality: 'تهران',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+98-913-429-2329',
          contactType: 'customer service',
          availableLanguage: ['fa', 'en'],
          areaServed: 'IR',
        },
        sameAs: [
          'https://instagram.com/samtaxco',
          'https://t.me/samtax',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: 'آیان تراز',
        description: 'خدمات حسابداری، مشاوره مالیاتی و آموزش مالی',
        inLanguage: 'fa',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'ProfessionalService',
        name: 'مشاوره مالیاتی آیان تراز',
        url: `${SITE_URL}/tax-consultant`,
        areaServed: {
          '@type': 'Country',
          name: 'IR',
        },
        hasMap: 'https://goo.gl/maps/placeholder',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'IR',
          addressLocality: 'تهران',
        },
        telephone: '+98-913-429-2329',
        priceRange: 'توافقی',
        openingHours: 'Sa,Su,Mo,Tu,We,Th,Fr 09:00-18:00',
      },
      {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/#webpage`,
        url: SITE_URL,
        name: 'آیان تراز | خدمات حسابداری و مشاوره مالیاتی',
        description: 'ارائه خدمات حسابداری، مشاوره مالیاتی، تنظیم اظهارنامه و آموزش مالی با تیمی متخصص. بیش از ۱۵ سال سابقه درخشان.',
        inLanguage: 'fa',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['h1', 'h2', 'h3', '.speakable'],
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${SITE_URL}/#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'صفحه اصلی',
            item: SITE_URL,
          },
        ],
      },
    ],
  };

  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="google-site-verification" content="placeholder" />
        <meta name="robots" content="max-image-preview:large" />
        <meta name="theme-color" content="#0A0A0A" />
        <meta name="background-color" content="#0A0A0A" />
        <meta name="application-name" content="آیان تراز" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="آیان تراز" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#0A0A0A" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#D4A843" />
        
        <link rel="canonical" href={SITE_URL} />
        <link rel="alternate" hrefLang="fa" href={SITE_URL} />
        
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        <link 
          rel="preload" 
          href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-Regular.woff2" 
          as="font" 
          type="font/woff2" 
          crossOrigin="anonymous"
        />
        <link 
          rel="preload" 
          href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-Bold.woff2" 
          as="font" 
          type="font/woff2" 
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen flex flex-col overflow-x-hidden antialiased">
        <AuthProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <ChatbotWidget />
          
          <div className="fixed bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[rgba(10,10,10,0.9)] to-transparent pointer-events-none z-10 safe-area-bottom" />
        </AuthProvider>
      </body>
    </html>
  );
}