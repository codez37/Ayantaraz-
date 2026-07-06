import Link from 'next/link';
import { Metadata } from 'next';
import HeroSlider from '@/components/home/HeroSlider';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://202.133.91.13';

const services = [
  { icon: '📊', title: 'خدمات حسابداری', desc: 'تنظیم صورت‌های مالی، حسابداری صنعتی و مدیریت مالی' },
  { icon: '⚖️', title: 'مشاوره مالیاتی', desc: 'بهینه‌سازی مالیاتی، دفاع در برگ تشخیص و حل اختلاف' },
  { icon: '📈', title: 'مشاوره سرمایه‌گذاری', desc: 'تحلیل طرح‌های توجیهی و مشاوره اقتصادی' },
  { icon: '🎓', title: 'آموزش و دوره‌ها', desc: 'دوره‌های تخصصی حسابداری و مالیات به صورت آنلاین' },
  { icon: '📋', title: 'تنظیم اظهارنامه', desc: 'تنظیم و پیگیری اظهارنامه مالیاتی اشخاص حقیقی و حقوقی' },
  { icon: '🤖', title: 'مشاور هوشمند AI', desc: 'پاسخگویی آنلاین به سوالات مالیاتی با هوش مصنوعی' },
];

export const metadata: Metadata = {
  title: 'آیان تراز | خدمات حسابداری و مشاوره مالیاتی حرفه‌ای',
  description: 'ارائه خدمات حسابداری، مشاوره مالیاتی، آموزش مالی و مشاور هوشمند AI برای کسب‌وکارها و اشخاص',
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: 'آیان تراز | خدمات حسابداری و مشاوره مالیاتی',
    description: 'ارائه خدمات حسابداری، مشاوره مالیاتی، آموزش مالی و مشاور هوشمند AI',
    url: SITE_URL,
    siteName: 'آیان تراز',
    images: [
      {
        url: `${SITE_URL}/og-image-home.png`,
        width: 1200,
        height: 630,
        alt: 'آیان تراز - خدمات حسابداری و مالیاتی',
      },
    ],
    locale: 'fa_IR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'آیان تراز | خدمات حسابداری و مشاوره مالیاتی',
    description: 'ارائه خدمات حسابداری، مشاوره مالیاتی، آموزش مالی و مشاور هوشمند AI',
    images: [`${SITE_URL}/og-image-home.png`],
  },
};

export default function HomePage() {
  return (
    <div>
      <HeroSlider />

      <section className="container-mobile py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-gold-gradient mb-3">خدمات ما</h2>
          <p className="text-gray-500">راهکارهای جامع مالی و حسابداری برای کسب‌وکار شما</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {services.map((s, i) => (
            <div
              key={s.title}
              className={`card-dark p-6 animate-fade-in-up animate-fade-in-up-${Math.min(i + 1, 6)}`}
            >
              <div className="text-3xl mb-4">{s.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#0A0A0A] py-16 border-y border-[#D4A843]/10">
        <div className="container-mobile">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { num: '۱۵+', label: 'سال تجربه' },
              { num: '۵۰۰+', label: 'مشتری راضی' },
              { num: '۱۰۰+', label: 'مقاله تخصصی' },
              { num: '۴۸', label: 'ساعت پاسخگویی' },
            ].map(item => (
              <div key={item.label} className="text-center p-4">
                <div className="text-3xl md:text-4xl font-black text-gold-gradient">{item.num}</div>
                <div className="text-sm text-gray-500 mt-2">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-mobile py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">آماده شروع هستید؟</h2>
          <p className="text-gray-400 mb-8 text-lg">
            همین حالا درخواست مشاوره خود را ثبت کنید. کارشناسان ما در اسرع وقت با شما تماس می‌گیرند.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/consultation" className="btn-gold text-lg">ثبت درخواست مشاوره</Link>
            <Link href="/tax-consultant" className="btn-outline-gold text-lg">مشاور هوشمند AI</Link>
          </div>
        </div>
      </section>

      <section className="bg-[#0A0A0A] py-16">
        <div className="container-mobile max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-black text-gold-gradient text-center mb-10">سوالات متداول</h2>
          <div className="space-y-3">
            {[
              { q: 'خدمات حسابداری شما شامل چه مواردی می‌شود؟', a: 'تنظیم صورت‌های مالی، پیگیری امور مالیاتی، مشاوره حسابداری، تنظیم اظهارنامه و ...' },
              { q: 'چگونه می‌توانم درخواست مشاوره بدهم؟', a: 'از صفحه مشاوره فرم را پر کنید یا با مشاور هوشمند AI صحبت کنید. کارشناسان ما با شما تماس می‌گیرند.' },
              { q: 'دوره‌های آموزشی چگونه ارائه می‌شوند؟', a: 'به صورت آنلاین با ویدیوهای ضبط شده در پلتفرم اختصاصی. پس از خرید، لینک دسترسی برای شما ارسال می‌شود.' },
              { q: 'هزینه مشاوره چقدر است؟', a: 'هزینه بستگی به نوع و مدت مشاوره دارد. برای اطلاع دقیق با ما تماس بگیرید یا از مشاور هوشمند استفاده کنید.' },
            ].map((item, i) => (
              <details key={i} className="card-dark p-4 group cursor-pointer">
                <summary className="font-bold text-white flex items-center justify-between">
                  {item.q}
                  <svg className="w-5 h-5 text-[#D4A843] group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-3 text-gray-400 text-sm leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
