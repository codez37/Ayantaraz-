import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0A0A0A] border-t border-[#D4A843]/10 mt-20">
      <div className="container-mobile py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-[#F0D68A] to-[#B8862D] rounded-lg flex items-center justify-center text-[#111111] font-black text-sm">
                آ
              </div>
              <span className="text-lg font-black bg-gradient-to-l from-[#F0D68A] via-[#D4A843] to-[#B8862D] bg-clip-text text-transparent">
                آیان تراز
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              ارائه خدمات حسابداری، مشاوره مالیاتی و آموزش مالی با تیمی متخصص و مجرب
            </p>
          </div>

          <div>
            <h4 className="text-[#D4A843] font-bold mb-3 text-sm">خدمات</h4>
            <div className="space-y-2">
              {[
                { href: '/services', label: 'خدمات ما' },
                { href: '/courses', label: 'دوره‌ها' },
                { href: '/consultation', label: 'مشاوره تخصصی' },
              ].map(item => (
                <Link key={item.href} href={item.href} className="block text-sm text-gray-500 hover:text-[#D4A843] transition-colors">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[#D4A843] font-bold mb-3 text-sm">دسترسی سریع</h4>
            <div className="space-y-2">
              {[
                { href: '/articles', label: 'مقالات' },
                { href: '/courses', label: 'دوره‌ها' },
                { href: '/about', label: 'درباره ما' },
                { href: '/contact', label: 'تماس' },
              ].map(item => (
                <Link key={item.href} href={item.href} className="block text-sm text-gray-500 hover:text-[#D4A843] transition-colors">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[#D4A843] font-bold mb-3 text-sm">اطلاعات تماس</h4>
            <div className="space-y-2 text-sm text-gray-500">
              <p>تلفن: ۰۹۱۳۴۲۹۲۳۲۹</p>
              <p>تلفن: ۰۹۹۱۸۵۶۳۷۲۵</p>
              <p>ایمیل: samanbabaeiii20@gmail.com</p>
              <p>اینستاگرام: @samtaxco</p>
              <p>تلگرام: @samtax</p>
            </div>
          </div>
        </div>

        <div className="border-t border-[#D4A843]/10 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            تمامی حقوق برای آیان تراز محفوظ است © {year}
          </p>
          <div className="flex gap-4 text-xs text-gray-600">
            <Link href="/about" className="hover:text-[#D4A843]">درباره ما</Link>
            <Link href="/contact" className="hover:text-[#D4A843]">تماس</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
