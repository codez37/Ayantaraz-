import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '\u062f\u0631\u0628\u0627\u0631\u0647 \u0622\u06cc\u0627\u0646 \u062a\u0631\u0627\u0632 | \u062a\u06cc\u0645 \u0645\u062a\u062e\u0635\u0635 \u062d\u0633\u0627\u0628\u062f\u0627\u0631\u06cc \u0648 \u0645\u0627\u0644\u06cc\u0627\u062a',
  description: '\u0622\u06cc\u0627\u0646 \u062a\u0631\u0627\u0632 \u0628\u0627 \u062a\u06cc\u0645\u06cc \u0627\u0632 \u0645\u062a\u062e\u0635\u0635\u0627\u0646 \u062d\u0633\u0627\u0628\u062f\u0627\u0631\u06cc \u0648 \u0645\u0627\u0644\u06cc\u0627\u062a \u0628\u0627 \u0628\u06cc\u0634 \u0627\u0632 \u06f1\u06f5 \u0633\u0627\u0644 \u062a\u062c\u0631\u0628\u0647\u060c \u062e\u062f\u0645\u0627\u062a \u062d\u0641\u0641\u0647\u060c\u0627\u06cc \u0645\u0627\u0644\u06cc \u0648 \u0645\u0627\u0644\u06cc\u0627\u062a\u06cc \u0627\u0631\u0626\u0647 \u0645\u06cc\u060c\u062f\u0647\u062f.',
  alternates: {
    canonical: 'https://ayantaraz.ir/about',
  },
  openGraph: {
    title: '\u062f\u0631\u0628\u0627\u0631\u0647 \u0622\u06cc\u0627\u0646 \u062a\u0631\u0627\u0632 | \u062a\u06cc\u0645 \u0645\u062a\u062e\u0635\u0635 \u062d\u0633\u0627\u0628\u062f\u0627\u0631\u06cc \u0648 \u0645\u0627\u0644\u06cc\u0627\u062a',
    description: '\u0622\u06cc\u0627\u0646 \u062a\u0631\u0627\u0632 \u0628\u0627 \u062a\u06cc\u0645\u06cc \u0627\u0632 \u0645\u062a\u062e\u0635\u0635\u0627\u0646 \u062d\u0633\u0627\u0628\u062f\u0627\u0631\u06cc \u0648 \u0645\u0627\u0644\u06cc\u0627\u062a \u0628\u0627 \u0628\u06cc\u0634 \u0627\u0632 \u06f1\u06f5 \u0633\u0627\u0644 \u062a\u062c\u0631\u0628\u0647\u060c \u062e\u062f\u0645\u0627\u062a \u062d\u0641\u0641\u0647\u060c\u0627\u06cc \u0645\u0627\u0644\u06cc \u0648 \u0645\u0627\u0644\u06cc\u0627\u062a\u06cc \u0627\u0631\u0626\u0647 \u0645\u06cc\u060c\u062f\u0647\u062f.',
    url: 'https://ayantaraz.ir/about',
    siteName: '\u0622\u06cc\u0627\u0646 \u062a\u0631\u0627\u0632',
    images: [
      {
        url: 'https://ayantaraz.ir/og-image-about.png',
        width: 1200,
        height: 630,
        alt: '\u0622\u06cc\u0627\u0646 \u062a\u0631\u0627\u0632 - \u062f\u0631\u0628\u0627\u0631\u0647 \u0645\u0627',
      },
    ],
    locale: 'fa_IR',
    type: 'website',
  },
};

const team = [
  { name: '\u062f\u06a9\u062a\u0631 \u0645\u062d\u0645\u062f \u0631\u0636\u0627\u06cc\u06cc', role: '\u0645\u062f\u06cc\u0631 \u0639\u0627\u0645\u0644', desc: '\u062f\u06a9\u062a\u0631\u0627\u06cc \u062d\u0633\u0627\u0628\u062f\u0627\u0631\u06cc \u0628\u0627 \u06f2\u06f0 \u0633\u0627\u0644 \u0633\u0627\u0628\u0642\u0647' },
  { name: '\u0645\u0647\u0646\u062f\u0633 \u0633\u0627\u0631\u0627 \u0627\u062d\u0645\u062f\u06cc', role: '\u0645\u062f\u06cc\u0631 \u0645\u0627\u0644\u06cc\u0627\u062a\u06cc', desc: '\u06a9\u0627\u0631\u0634\u0646\u0627\u0633 \u0627\u0631\u0634\u062f \u0645\u0627\u0644\u06cc\u0627\u062a \u0628\u0627 \u06f1\u06f5 \u0633\u0627\u0644 \u062a\u062c\u0631\u0628\u0647' },
  { name: '\u062f\u06a9\u062a\u0631 \u0639\u0644\u06cc \u06a9\u0631\u06cc\u0645\u06cc', role: '\u0645\u0634\u0627\u0648\u0631 \u0627\u0631\u0634\u062f', desc: '\u062f\u06a9\u062a\u0631\u0627\u06cc \u0645\u062f\u06cc\u0631\u06cc\u062a \u0645\u0627\u0644\u06cc\u0627\u062a \u0627\u0632 \u062f\u0627\u0646\u0634\u06af\u0627\u0646 \u062a\u0647\u0631\u0627\u0646' },
  { name: '\u0645\u0631\u06cc\u0645 \u062d\u0633\u06cc\u0646\u06cc', role: '\u0645\u062f\u06cc\u0631 \u0622\u0645\u0648\u0632\u0634', desc: '\u06a9\u0627\u0631\u0634\u0646\u0627\u0633 \u0627\u0631\u0634\u062f \u062d\u0633\u0627\u0628\u062f\u0627\u0631\u06cc \u0648 \u0645\u062f\u0631\u0644 \u062f\u0627\u0646\u0634\u06af\u0627\u0646' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-background-secondary to-background-primary py-16 md:py-24">
        <div className="container-mobile text-center">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4">
            \u062f\u0631\u0628\u0627\u0631\u0647 <span className="text-gold-gradient">\u0622\u06cc\u0627\u0646 \u062a\u0631\u0627\u0632</span>
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
            \u062a\u06cc\u0645\u06cc \u0627\u0632 \u0645\u062a\u062e\u0635\u0635\u0627\u0646 \u062d\u0633\u0627\u0628\u062f\u0627\u0631\u06cc \u0648 \u0645\u0627\u0644\u06cc\u0627\u062a \u0628\u0627 \u0628\u06cc\u0634 \u0627\u0632 \u06f1\u06f5 \u0633\u0627\u0644 \u062a\u062c\u0631\u0628\u0647 \u0634\u0645\u0627
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="container-mobile py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-6">
              \u062f\u0627\u0633\u062a\u0627\u0646 <span className="text-gold-gradient">\u0645\u0627</span>
            </h2>
            <div className="space-y-4 text-text-secondary leading-relaxed">
              <p>
                \u0622\u06cc\u0627\u0646 \u062a\u0631\u0627\u0632 \u062f\u0631 \u0633\u0627\u0644 \u06f1\u06f3\u06f8\u06f8 \u0628\u0627 \u0647\u062f\u0641 \u0627\u0631\u0626\u0647 \u062e\u062f\u0645\u0627\u062a \u062d\u0641\u0641\u0647\u060c\u0627\u06cc \u062d\u0633\u0627\u0628\u062f\u0627\u0631\u06cc \u0648 \u0645\u0634\u0627\u0648\u0631\u0647 \u0645\u0627\u0644\u06cc\u0627\u062a\u06cc \u0622\u063a\u0627\u0632 \u0628\u0647 \u06a9\u0627\u0631 \u06a9\u0646\u062f. 
                \u0645\u0627 \u0645\u0639\u062a\u0642\u062f\u06cc\u0645 \u0634\u0641\u0627\u0641\u06cc\u062a \u0645\u0627\u0644\u06cc \u0648 \u0631\u0639\u0627\u06cc\u062a \u0642\u0648\u0627\u0646\u06cc\u0646 \u0645\u0627\u0644\u06cc\u0627\u062a\u06cc \u06a9\u0644\u06cc\u062f \u0645\u0648\u0641\u0642\u06cc\u062a \u0647\u0631 \u06a9\u0645\u0628\u0640\u0627\u0646 \u0627\u0633\u062a\u0641\u0647 \u0634\u062f.
              </p>
              <p>
                \u062a\u06cc\u0645 \u0645\u0627 \u0645\u062a\u0634\u06a9\u0644 \u0627\u0632 \u062d\u0633\u0627\u0628\u062f\u0627\u0631\u06cc\u0627\u0646 \u0631\u0633\u0645\u0640\u060c \u0645\u0634\u0627\u0648\u0631\u0627\u0646 \u0645\u0627\u0644\u06cc\u0627\u062a\u06cc \u0648 \u0627\u0633\u062a\u0645\u06cc\u062f \u062f\u0627\u0646\u0634\u06af\u0627\u0646 \u0627\u0633\u062a 
                \u0628\u0647\u200c\u0631\u0648\u0632\u062a\u0631\u06cc\u0646 \u062f\u0627\u0646 \u0634 \u0648 \u062a\u062c\u0631\u0628\u0647 \u062f\u0631 \u06a9\u0646\u0627\u0631 \u0634\u0645\u0627 \u0647\u0633\u062a\u0646\u062f.
              </p>
              <p>
                \u0627\u0645\u0631\u0648\u0632 \u0622\u06cc\u0627\u0646 \u062a\u0631\u0627\u0632 \u0628\u0647 \u06cc\u06a9\u06cc \u0627\u0632 \u0645\u0639\u062a\u0628\u0631\u062a\u0631\u06cc\u0646 \u0628\u0631\u0646\u062f\u0647\u0627\u06cc \u0645\u0634\u0627\u0648\u0631\u0647 \u0645\u0627\u0644\u06cc\u0627\u062a\u06cc \u062f\u0631 \u06cc\u06a9\u0627\u0646 \u062a\u0628\u062f\u0627\u0644 \u0634\u062f\u0647 
                \u0648 \u0628\u0647 \u0628\u06cc\u0634 \u0627\u0632 \u06f5\u06f0\u06f0 \u06a9\u0633\u0628\u200c\u0648\u06a9\u0627\u0631 \u062f\u0631 \u0633\u0631\u0627\u0646 \u0634\u0648\u06cc\u062f \u062e\u062f\u0645\u0627\u062a \u0627\u0631\u0626\u0647 \u0645\u06cc\u200c\u062f\u0647\u062f.
              </p>
            </div>
          </div>
          <div className="card-dark p-8 text-center">
            <div className="text-6xl mb-4">\ud83c\udfaf</div>
            <h3 className="text-xl font-bold text-white mb-3">\u0645\u0622\u0645\u0648\u0631\u06cc\u062a \u0645\u0627</h3>
            <p className="text-text-secondary leading-relaxed">
              \u062a\u0648\u0627\u0646\u0645\u0646\u062f\u0633\u0627\u0632\u06cc \u06a9\u0633\u0628\u200c\u0648\u06a9\u0627\u0631\u0647\u0627 \u0628\u0627 \u0627\u0631\u0626\u0647 \u062e\u062f\u0645\u0627\u062a \u062d\u0641\u0641\u0647\u060c\u0627\u06cc \u0645\u0627\u0644\u06cc\u0627\u062a\u06cc\u060c 
              \u062a\u0627 \u0628\u062a\u0648\u0627\u0646\u0646\u062f \u0628\u0627 \u0627\u0637\u0645\u06cc\u0646\u0627\u062a \u0648 \u0622\u06af\u0627\u0647\u06cc \u0628\u06cc\u0634\u062a\u0631\u06cc \u0645\u0644\u0641 \u0632\u0645\u0627\u0646\u06cc \u0631\u06cc\u0633 \u06a9\u0646\u0646\u062f.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-background-tertiary p-4 rounded-xl">
                <div className="text-2xl font-black text-gold-gradient">\u06f1\u06f5+</div>
                <div className="text-xs text-text-tertiary">\u0633\u0627\u0644 \u062a\u062c\u0631\u0628\u0647</div>
              </div>
              <div className="bg-background-tertiary p-4 rounded-xl">
                <div className="text-2xl font-black text-gold-gradient">\u06f5\u06f0\u06f0+</div>
                <div className="text-xs text-text-tertiary">\u0645\u0634\u062a\u0631\u06cc</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-background-primary py-16">
        <div className="container-mobile">
          <h2 className="text-2xl md:text-3xl font-black text-gold-gradient text-center mb-12">
            \u0627\u0631\u0632\u0634\u060c\u0647\u0627\u06cc \u0645\u0627
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '\ud83c\udfaf', title: '\u062f\u0642\u062a', desc: '\u0628\u0627\u0644\u0627\u062a\u0631\u06cc\u0646 \u0627\u0633\u062a\u0627\u0646\u062f\u0627\u0631\u06cc \u062f\u0642\u062a \u062f\u0631 \u062e\u062f\u0645\u0627\u062a' },
              { icon: '\ud83d\udd12', title: '\u0627\u0645\u0646\u06cc\u062a', desc: '\u062d\u0641\u0638 \u0645\u062d\u0641\u0645\u0627\u0646\u06af\u06cc \u0627\u0637\u0644\u0627\u0639\u0627\u062a \u0645\u0627\u0644\u06cc \u0634\u0645\u0627' },
              { icon: '\u26a1', title: '\u0633\u0631\u0639\u062a', desc: '\u067e\u0627\u0633\u062e\u0648\u06cc\u06cc \u0633\u0631\u06cc\u0639 \u0628\u0647 \u0646\u06cc\u0627\u0632\u0647\u0627\u06cc \u0634\u0645\u0627' },
              { icon: '\ud83e\udd1d', title: '\u0627\u0639\u062a\u0645\u0627\u062f', desc: '\u0631\u0627\u0628\u0637\u0647 \u0635\u0627\u062f\u0642\u0627\u0646\u0647 \u0648 \u0633\u0641\u0627\u0641 \u0628\u0627 \u0645\u0634\u062a\u0631\u06cc\u0627\u0646' },
            ].map(v => (
              <div key={v.title} className="card-dark p-5 text-center">
                <div className="text-3xl mb-3">{v.icon}</div>
                <h3 className="text-white font-bold mb-1">{v.title}</h3>
                <p className="text-text-tertiary text-xs">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="container-mobile py-16">
        <h2 className="text-2xl md:text-3xl font-black text-gold-gradient text-center mb-12">
          \u062a\u06cc\u0645 \u0645\u0627
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {team.map(m => (
            <div key={m.name} className="card-dark p-5 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gold-primary to-gold-500 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-black text-xl">
                {m.name[0]}
              </div>
              <h3 className="text-white font-bold text-sm">{m.name}</h3>
              <p className="text-gold-primary text-xs font-bold mt-1">{m.role}</p>
              <p className="text-text-tertiary text-xs mt-2">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-background-secondary to-background-primary py-16 text-center">
        <div className="container-mobile">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-4">
            \u0622\u0645\u0627\u062f\u0647 \u0647\u0645\u06a9\u0627\u0631\u06cc \u0628\u0627 \u0645\u0627 \u0647\u0633\u062a\u06cc\u062f\u061f
          </h2>
          <p className="text-text-secondary mb-8">\u0628\u0627 \u062a\u06cc\u0645 \u0645\u0627 \u062a\u0645\u0627\u0633 \u0628\u06af\u06cc\u0631\u06cc\u062f \u06cc\u0627 \u062f\u0631\u062e\u0648\u0627\u0633\u062a \u0645\u0634\u0627\u0648\u0631\u0647 \u062b\u0628\u062a \u06a9\u0646\u06cc\u062f</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/consultation" className="btn-gold">\u062b\u0628\u062a \u062f\u0631\u062e\u0648\u0627\u0633\u062a \u0645\u0634\u0627\u0648\u0631\u0647</Link>
            <Link href="/contact" className="btn-outline-gold">\u062a\u0645\u0627\u0633 \u0628\u0627 \u0645\u0627</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
