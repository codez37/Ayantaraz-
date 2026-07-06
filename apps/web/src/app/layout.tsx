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
  themeColor: '#111111',
};

export const metadata: Metadata = {
  title: 'آیان تراز | خدمات حسابداری و مشاوره مالیاتی',
  description: 'ارائه خدمات حسابداری، مشاوره مالیاتی، تنظیم اظهارنامه و آموزش مالی با تیمی متخصص. بیش از ۱۵ سال سابقه درخشان.',
  keywords: ['حسابداری', 'مشاوره مالیاتی', 'مالیات', 'اظهارنامه', 'آموزش حسابداری', 'خدمات مالی', 'آیان تراز'],
  authors: [{ name: 'آیان تراز' }],
  openGraph: {
    title: 'آیان تراز | خدمات حسابداری و مشاوره مالیاتی',
    description: 'ارائه خدمات حسابداری، مشاوره مالیاتی و آموزش مالی',
    type: 'website',
    locale: 'fa_IR',
    url: SITE_URL,
  },
  twitter: {
    card: 'summary',
    title: 'آیان تراز | خدمات حسابداری و مشاوره مالیاتی',
    description: 'ارائه خدمات حسابداری، مشاوره مالیاتی و آموزش مالی',
  },
  robots: 'index, follow',
  alternates: {
    canonical: SITE_URL,
  },
  other: {
    'format-detection': 'telephone=no',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'آیان تراز',
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
        description: 'ارائه خدمات حسابداری، مشاوره مالیاتی و آموزش مالی',
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+98-913-429-2329',
          contactType: 'customer service',
          availableLanguage: 'fa',
        },
        sameAs: ['https://instagram.com/samtaxco', 'https://t.me/samtax'],
      },
      {
        '@type': 'WebSite',
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
        areaServed: 'IR',
        priceRange: 'توافقی',
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
          cssSelector: ['h1', 'h2', '.speakable'],
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'صفحه اصلی', item: SITE_URL },
        ],
      },
    ],
  };

  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="google-site-verification" content="placeholder" />
        <meta name="robots" content="max-image-preview:large" />
        <link rel="canonical" href={SITE_URL} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col overflow-x-hidden">
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <ChatbotWidget />
        </AuthProvider>
      </body>
    </html>
  );
}
