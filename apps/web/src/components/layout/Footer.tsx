import Link from 'next/link';

// ============================================
// Footer Component - Modern Black Gold Professional
// Mobile-First, Accessible
// ============================================

export default function Footer() {
  const year = new Date().getFullYear();

  // ==========================================
  // FOOTER SECTIONS
  // ==========================================
  const brandSection = {
    logo: (
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-gradient-to-br from-gold-primary to-gold-500 rounded-lg flex items-center justify-center text-background-primary font-black text-sm">
          \u0622
        </div>
        <span className="text-lg font-black bg-gradient-to-l from-gold-primary via-gold-soft to-gold-500 bg-clip-text text-transparent">
          \u0622\u06cc\u0627\u0646 \u062a\u0631\u0627\u0632
        </span>
      </div>
    ),
    description: '\u0627\u0631\u0626\u0647 \u062e\u062f\u0645\u0627\u062a \u062d\u0633\u0627\u0628\u062f\u0627\u0631\u06cc\u060c \u0645\u0634\u0627\u0648\u0631\u0647 \u0645\u0627\u0644\u06cc\u0627\u062a\u06cc \u0648 \u0622\u0645\u0648\u0632\u0634 \u0645\u0627\u0644\u06cc \u0628\u0627 \u062a\u06cc\u0645\u06cc \u0645\u062a\u062e\u0635\u0635 \u0648 \u0645\u0639\u0644\u0648\u0645',
  };

  const servicesSection = {
    title: '\u062e\u062f\u0645\u0627\u062a',
    links: [
      { href: '/services', label: '\u062e\u062f\u0645\u0627\u062a \u0645\u0627' },
      { href: '/courses', label: '\u062f\u0648\u0631\u0647\u060c\u0647\u0627' },
      { href: '/consultation', label: '\u0645\u0634\u0627\u0648\u0631\u0647 \u062a\u062e\u0635\u0635\u06cc' },
    ],
  };

  const quickAccessSection = {
    title: '\u062f\u0633\u062a\u0631\u0633\u06cc \u0633\u0631\u06cc\u0639',
    links: [
      { href: '/articles', label: '\u0645\u0642\u0627\u0644\u0627\u062a' },
      { href: '/videos', label: '\u0648\u06cc\u062f\u06cc\u0648\u0647\u0627' },
      { href: '/minibooks', label: '\u0645\u06cc\u0646\u06cc\u060c\u0628\u0648\u06a9\u060c\u0647\u0627' },
      { href: '/about', label: '\u062f\u0631\u0628\u0627\u0631\u0647 \u0645\u0627' },
      { href: '/contact', label: '\u062a\u0645\u0627\u0633' },
    ],
  };

  const contactSection = {
    title: '\u0627\u0637\u0644\u0627\u0639\u0627\u062a \u062a\u0645\u0627\u0633',
    items: [
      { label: '\u062a\u0644\u0641\u0646', value: '\u06f0\u06f9\u06f1\u06f3\u06f4\u06f2\u06f9\u06f2\u06f3\u06f2\u06f9' },
      { label: '\u062a\u0644\u0641\u0646', value: '\u06f0\u06f9\u06f9\u06f1\u06f8\u06f5\u06f6\u06f3\u06f7\u06f2\u06f5' },
      { label: '\u0627\u06cc\u0645\u06cc\u0644', value: 'samanbabaeiii20@gmail.com' },
      { label: '\u0627\u06cc\u0646\u0633\u062a\u0627\u06af\u0645\u0627', value: '@samtaxco' },
      { label: '\u062a\u0644\u06af\u0646', value: '@samtax' },
    ],
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <footer className="bg-background-secondary border-t border-border-gold/20 mt-16 md:mt-20">
      <div className="container-mobile py-8 md:py-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section (Full width on mobile, 2 cols on tablet, 1 col on desktop) */}
          <div className="lg:col-span-1">
            {brandSection.logo}
            <p className="text-sm text-text-tertiary leading-relaxed">
              {brandSection.description}
            </p>
          </div>

          {/* Services Section */}
          <div className="md:col-span-1">
            <h4 className="text-gold-primary font-bold mb-4 text-sm">
              {servicesSection.title}
            </h4>
            <div className="space-y-3">
              {servicesSection.links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="
                    block text-sm text-text-secondary
                    hover:text-gold-primary
                    transition-colors duration-200
                  "
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Access Section */}
          <div className="md:col-span-1">
            <h4 className="text-gold-primary font-bold mb-4 text-sm">
              {quickAccessSection.title}
            </h4>
            <div className="space-y-3">
              {quickAccessSection.links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="
                    block text-sm text-text-secondary
                    hover:text-gold-primary
                    transition-colors duration-200
                  "
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <div className="md:col-span-1">
            <h4 className="text-gold-primary font-bold mb-4 text-sm">
              {contactSection.title}
            </h4>
            <div className="space-y-3 text-sm">
              {contactSection.items.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <span className="text-text-tertiary">{item.label}:</span>
                  <span className="text-text-secondary">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-border-gold/20 mt-8 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-text-tertiary text-center md:text-right">
              \u062a\u0645\u0627\u0645\u06cc \u062d\u0642\u0648\u0642 \u0628\u0631\u0627\u06cc \u0622\u06cc\u0627\u0646 \u062a\u0631\u0627\u0632 \u0645\u062d\u0641\u0648\u0638 \u0627\u0633\u062a \u00a9 {year}
            </p>
            <div className="flex gap-4 text-xs text-text-tertiary justify-center md:justify-start">
              <Link
                href="/about"
                className="hover:text-gold-primary transition-colors"
              >
                \u062f\u0631\u0628\u0627\u0631\u0647 \u0645\u0627
              </Link>
              <Link
                href="/contact"
                className="hover:text-gold-primary transition-colors"
              >
                \u062a\u0645\u0627\u0633
              </Link>
              <Link
                href="/privacy"
                className="hover:text-gold-primary transition-colors"
              >
                \u062d\u0631\u06cc\u0645 \u062e\u0635\u0648\u0635\u06cc
              </Link>
              <Link
                href="/terms"
                className="hover:text-gold-primary transition-colors"
              >
                \u0642\u0648\u0627\u0646\u06cc\u0646
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
