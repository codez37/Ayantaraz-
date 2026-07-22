import Link from 'next/link';
import HeroSlider from '@/components/home/HeroSlider';

const stats = [
  { label: 'مسیر مشاوره بدون پرداخت آنلاین', value: '۱۰۰٪ انسانی' },
  { label: 'محتوای آموزشی و مینی‌بوک', value: 'رایگان/کنترل‌شده' },
  { label: 'پرسش و پاسخ هوشمند', value: 'فعال' },
];

const quickActions = [
  { href: '/consultation', title: 'ثبت وقت مشاوره', desc: 'بدون درگاه پرداخت؛ ثبت درخواست و تماس کارشناس' },
  { href: '/minibooks', title: 'دانلود مینی‌بوک', desc: 'دریافت فایل‌های آموزشی حسابداری و مالیات' },
  { href: '/tax-consultant', title: 'دستیار هوشمند', desc: 'پرسش و پاسخ تخصصی مالیاتی و حسابداری' },
  { href: '/auth', title: 'ورود / ثبت‌نام', desc: 'ورود امن با کد یکبارمصرف پیامکی' },
];

// ============================================
// HomePage - Mobile-First Refactor
// ============================================

export default function HomePage() {
  return (
    <div className="bg-[#0B0B0C] text-white">
      {/* Hero Section with Slider */}
      <HeroSlider />

      {/* Stats Section */}
      <section className="relative overflow-hidden border-b border-[#C9A227]/10">
        <div className="absolute inset-0 luxury-aurora bg-[radial-gradient(circle_at_top_left,rgba(201,162,39,0.25),transparent_38%),linear-gradient(135deg,#0B0B0C_0%,#121212_52%,#030303_100%)]" />
        <div className="relative container-mobile py-12 md:py-16">
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Main Content */}
            <div className="reveal-up text-center lg:text-right">
              <span className="inline-flex rounded-full border border-[#C9A227]/30 bg-[#C9A227]/10 px-4 py-2 text-xs font-bold text-[#C9A227]">
                آیان تراز؛ مشاوره، آموزش و عملیات مالیاتی
              </span>
              <h1 className="gold-sheen mt-6 text-3xl sm:text-4xl md:text-5xl font-black leading-tight text-gold-gradient lg:text-6xl">
                مسیر حرفه‌ای مالیات و حسابداری
                <span className="block md:inline">، آماده برای موبایل و دیپلوی پایدار</span>
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-gray-400 lg:mx-0">
                ثبت درخواست مشاوره بدون درگاه پرداخت، دانلود مینی‌بوک، محتوای آموزشی و چت‌بات پرسش و پاسخ در یک تجربه مشکی ـ طلایی مدرن و فارسی.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="/consultation"
                  className="
                    bg-[#C9A227] text-[#0B0B0C]
                    hover:bg-[#A0781E] active:bg-[#7D5A15]
                    px-6 py-3 text-center
                    rounded-md
                    shadow-[0_4px_14px_0_rgba(201,162,39,0.39)]
                    hover:shadow-[0_6px_20px_0_rgba(201,162,39,0.45)]
                    transition-all duration-250 ease-in-out
                    hover:-translate-y-px active:translate-y-0
                    min-h-[48px]
                  "
                >
                  شروع ثبت وقت مشاوره
                </Link>
                <Link
                  href="/minibooks"
                  className="
                    bg-transparent text-[#C9A227] border border-[#C9A227]
                    hover:bg-[rgba(201,162,39,0.1)]
                    px-6 py-3 text-center
                    rounded-md
                    transition-all duration-250 ease-in-out
                    min-h-[48px]
                  "
                >
                  دانلود مینی‌بوک‌ها
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="glass-gold reveal-up rounded-2xl md:rounded-3xl p-4 md:p-5">
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {stats.map((item) => (
                  <div 
                    key={item.label} 
                    className="
                      rounded-xl border border-[#C9A227]/10 
                      bg-[#0B0B0C] p-4 md:p-5
                      transition-all duration-250 hover:border-[#C9A227]/20
                    "
                  >
                    <p className="text-xl md:text-2xl font-black text-[#C9A227]">{item.value}</p>
                    <p className="mt-2 text-sm text-gray-400">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="container-mobile py-10 md:py-12">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-white">دسترسی سریع عملیاتی</h2>
            <p className="mt-2 text-sm text-gray-500">تمام مسیرهای اصلی محصول از صفحه اول قابل دسترس هستند.</p>
          </div>
          <Link 
            href="/services" 
            className="
              hidden text-sm font-bold text-[#C9A227] 
              hover:text-[#A0781E] transition-colors
              sm:block
            "
          >
            مشاهده خدمات
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              className="
                glass-gold group rounded-xl md:rounded-2xl p-5
                transition-all duration-250
                hover:-translate-y-1 hover:border-[#C9A227]/35
                hover:shadow-xl hover:shadow-[#C9A227]/10
                min-h-[180px] flex flex-col
              "
            >
              <h3 className="text-lg font-black text-gray-100 group-hover:text-[#C9A227]">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-gray-500 flex-1">{item.desc}</p>
              <span className="mt-4 inline-block text-[#C9A227] text-xl transform group-hover:translate-x-1 transition-transform duration-200">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container-mobile pb-16 md:pb-20">
        <div className="rounded-2xl bg-gradient-to-r from-[#C9A227]/10 to-[#A0781E]/10 border border-[#C9A227]/20 p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-4">
            آماده شروع هستید؟
          </h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            با تیم متخصص آیان تراز در ارتباط باشید و از خدمات حرفه‌ای ما بهره‌مند شوید.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/consultation"
              className="
                bg-[#C9A227] text-[#0B0B0C]
                hover:bg-[#A0781E]
                px-8 py-3 font-bold rounded-md
                shadow-[0_4px_14px_0_rgba(201,162,39,0.39)]
                transition-all duration-250
                min-h-[48px]
              "
            >
              دریافت مشاوره
            </Link>
            <Link
              href="/contact"
              className="
                bg-transparent text-[#C9A227] border border-[#C9A227]
                hover:bg-[#C9A227]/10
                px-8 py-3 font-bold rounded-md
                transition-all duration-250
                min-h-[48px]
              "
            >
              تماس با ما
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
