import Link from 'next/link';

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

export default function HomePage() {
  return (
    <div className="bg-[#0A0A0A] text-white">
      <section className="relative overflow-hidden border-b border-[#D4A843]/10">
        <div className="absolute inset-0 luxury-aurora bg-[radial-gradient(circle_at_top_left,rgba(212,168,67,0.25),transparent_38%),linear-gradient(135deg,#0A0A0A_0%,#111111_52%,#050505_100%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-24 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="reveal-up text-center lg:text-right">
              <span className="inline-flex rounded-full border border-[#D4A843]/30 bg-[#D4A843]/10 px-4 py-2 text-xs font-bold text-[#F0D68A]">
                آیان تراز؛ مشاوره، آموزش و عملیات مالیاتی
              </span>
              <h1 className="gold-sheen mt-6 text-4xl font-black leading-tight text-gold-gradient sm:text-5xl lg:text-6xl">
                مسیر حرفه‌ای مالیات و حسابداری، آماده برای موبایل و دیپلوی پایدار
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-gray-300 lg:mx-0">
                ثبت درخواست مشاوره بدون درگاه پرداخت، دانلود مینی‌بوک، محتوای آموزشی و چت‌بات پرسش و پاسخ در یک تجربه مشکی ـ طلایی مدرن و فارسی.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link href="/consultation" className="btn-gold text-center">
                  شروع ثبت وقت مشاوره
                </Link>
                <Link href="/minibooks" className="btn-outline-gold text-center">
                  دانلود مینی‌بوک‌ها
                </Link>
                <Link href="/" className="rounded-xl border border-white/10 px-6 py-3 text-center text-sm font-bold text-gray-300 transition hover:border-[#D4A843]/40 hover:text-[#F0D68A]">
                  صفحه اصلی
                </Link>
              </div>
            </div>

            <div className="glass-gold reveal-up rounded-3xl p-5">
              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                {stats.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-[#D4A843]/10 bg-[#0A0A0A] p-5">
                    <p className="text-2xl font-black text-[#D4A843]">{item.value}</p>
                    <p className="mt-2 text-sm text-gray-400">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-white">دسترسی سریع عملیاتی</h2>
            <p className="mt-2 text-sm text-gray-500">تمام مسیرهای اصلی محصول از صفحه اول قابل دسترس هستند.</p>
          </div>
          <Link href="/services" className="hidden text-sm font-bold text-[#D4A843] hover:text-[#F0D68A] sm:block">
            مشاهده خدمات
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((item) => (
            <Link key={item.href} href={item.href} className="glass-gold group rounded-2xl p-5 transition hover:-translate-y-1 hover:border-[#D4A843]/35 hover:shadow-xl hover:shadow-[#D4A843]/10">
              <h3 className="text-lg font-black text-gray-100 group-hover:text-[#F0D68A]">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-gray-500">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
