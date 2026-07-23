'use client';

import { useState } from 'react';
import Link from 'next/link';
import HeroSlider from '@/components/home/HeroSlider';
import { useGlassmorphicTheme } from '@/providers/GlassmorphicThemeProvider';

const stats = [
  { label: '\u0645\u0633\u06cc\u0631 \u0645\u0634\u0627\u0648\u0631\u0647 \u0628\u062f\u0648\u0646 \u067e\u0631\u062f\u0627\u062e\u062a \u0622\u0646\u0644\u0627\u06cc\u0646', value: '\u06f1\u06f0\u06f0\u066a \u0627\u0646\u0633\u0627\u0646\u06cc' },
  { label: '\u0645\u062d\u062a\u0648\u0627\u06cc \u0622\u0645\u0648\u0632\u0634\u06cc \u0648 \u0645\u06cc\u0646\u06cc\u060c\u0628\u0648\u06a9', value: '\u0631\u0627\u06cc\u06af\u0627\u0646/\u06a9\u0646\u062a\u0631\u0644\u060c\u0634\u062f\u0647' },
  { label: '\u067e\u0631\u0633\u0634 \u0648 \u067e\u0627\u0633\u062e \u0647\u0648\u0634\u0645\u0646\u062f', value: '\u0641\u0639\u0627\u0644' },
];

const quickActions = [
  { href: '/consultation', title: '\u062b\u0628\u062a \u0648\u0642\u062a \u0645\u0634\u0627\u0648\u0631\u0647', desc: '\u0628\u062f\u0648\u0646 \u062f\u0631\u06af\u0627\u0647 \u067e\u0631\u062f\u0627\u062e\u062a\u060c \u062b\u0628\u062a \u062f\u0631\u062e\u0648\u0627\u0633\u062a \u0648 \u0625\u0645\u0627\u0631 \u06a9\u0627\u0631\u0646\u0627\u0633', icon: '\ud83d\udcc5' },
  { href: '/minibooks', title: '\u062f\u0627\u0646\u0644\u0648\u062f \u0645\u06cc\u0646\u06cc\u060c\u0628\u0648\u06a9', desc: '\u062f\u0631\u06cc\u0627\u0641\u062a \u0641\u0627\u06cc\u0644\u060c\u0647\u0627\u06cc \u0622\u0645\u0648\u0632\u0634\u06cc \u062d\u0633\u0627\u0628\u062f\u0627\u0631\u06cc \u0648 \u0645\u0627\u0644\u06cc\u0627\u062a', icon: '\ud83d\udcda' },
  { href: '/tax-consultant', title: '\u062f\u0633\u062a\u06cc\u0627\u0631 \u0647\u0648\u0634\u0645\u0646\u062f', desc: '\u067e\u0631\u0633\u0634 \u0648 \u067e\u0627\u0633\u062e \u062a\u062e\u0635\u0635\u06cc \u0645\u0627\u0644\u06cc\u0627\u062a\u06cc \u0648 \u062d\u0633\u0627\u0628\u062f\u0627\u0631\u06cc', icon: '\ud83e\udd16' },
  { href: '/auth', title: '\u0648\u0631\u0648\u062f / \u062b\u0628\u062a\u060c\u0646\u0627\u0645', desc: '\u0648\u0631\u0648\u062f \u0627\u0645\u0646 \u0628\u0627 \u06a9\u062f \u06cc\u06a9\u0628\u0627\u0631\u0645\u0645\u0631 \u067e\u06cc\u0627\u0645\u0636\u06cc', icon: '\ud83d\udd10' },
];

const services = [
  { title: '\u0645\u0634\u0627\u0648\u0631\u0647 \u0645\u0627\u0644\u06cc\u0627\u062a\u06cc', desc: '\u0645\u0634\u0627\u0648\u0631\u0647 \u062a\u062e\u0635\u0635\u06cc \u062f\u0631 \u0632\u0645\u06cc\u0646\u0647 \u0645\u0627\u0644\u06cc\u0627\u062a \u0628\u0631 \u0627\u0631\u0632\u0634 \u0627\u0641\u0632\u0648\u062f\u0647\u060c \u0645\u0627\u0644\u06cc\u0627\u062a \u0628\u0631 \u062f\u0631\u0622\u0645\u0641 \u0648 \u0645\u0627\u0644\u06cc\u0627\u062a\u060c\u0647\u0627\u06cc \u0635\u0633\u062a\u0642\u06cc\u0645', icon: '\u2696\ufe0f' },
  { title: '\u062d\u0633\u0627\u0628\u062f\u0627\u0631\u06cc \u062d\u0641\u0647\u060c\u0627\u06cc', desc: '\u062e\u062f\u0645\u0627\u062a \u062d\u0633\u0627\u0628\u062f\u0627\u0631\u06cc \u06a9\u0627\u0645\u0644 \u0627\u0632 \u062b\u0628\u062a \u0627\u0633\u0646\u0627\u062f \u062a\u0627 \u062a\u0647\u06cc\u0647 \u06af\u0632\u0627\u0631\u0646\u0627\u0633\u0648\u0646\u0627\u062a \u0645\u0627\u0644\u06cc \u0648 \u0645\u0627\u0644\u06cc\u0627\u062a\u06cc', icon: '\ud83d\udcca' },
  { title: '\u062a\u0646\u0638\u06cc\u0645 \u0627\u0638\u0647\u0627\u0631\u0646\u0627\u0645\u0647', desc: '\u062a\u0647\u06cc\u0647 \u0648 \u0627\u0631\u0633\u0627\u0644 \u0627\u0638\u0647\u0627\u0631\u0646\u0627\u0645\u060c\u0647\u0627\u06cc \u0645\u0627\u0644\u06cc\u0627\u062a \u0628\u0627 \u062f\u0642\u062a \u0648 \u0633\u0631\u0639\u062a \u0628\u0627\u0644\u0627', icon: '\ud83d\udcdd' },
  { title: '\u0622\u0645\u0648\u0632\u0634 \u062a\u062e\u0635\u0635\u06cc', desc: '\u062f\u0648\u0631\u0647\u060c\u0647\u0627 \u0648 \u0645\u0642\u0627\u0644\u0627\u062a \u0622\u0645\u0648\u0632\u0634\u06cc \u062f\u0631 \u0632\u0645\u06cc\u0646\u0647 \u0645\u0627\u0644\u06cc\u0627\u062a \u0648 \u062d\u0633\u0627\u0628\u062f\u0627\u0631\u06cc', icon: '\ud83c\udf93' },
];

// ============================================
// Tax Calculator Teaser Component
// ============================================

function TaxCalculatorTeaser() {
  const [amount, setAmount] = useState(50000000);
  const [taxRate, setTaxRate] = useState(15);
  
  // Simple tax calculation for demonstration
  const calculatedTax = Math.round((amount * taxRate) / 100);
  const netAmount = amount - calculatedTax;
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('fa-IR') + ' \u062a\u0648\u0645\u0627\u0646';
  };

  return (
    <div className="glass-gold rounded-2xl p-6 animate-reveal-up stagger-2">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-2xl">\ud83d\udcb0</div>
        <div>
          <h3 className="text-lg font-bold text-white">\u0645\u062d\u0627\u0633\u0628\u0647 \u0633\u0631\u06cc\u0639 \u0645\u0627\u0644\u06cc\u0627\u062a</h3>
          <p className="text-sm text-text-secondary">\u0645\u0628\u0644\u063a \u062a\u062e\u0635\u06cc\u0646\u06cc \u0645\u0627\u0644\u06cc\u0627\u062a \u062e\u0648\u062f \u0631\u0627 \u0645\u062d\u0627\u0633\u0628\u0647 \u06a9\u0646\u06cc\u062f</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-text-secondary mb-1">\u0645\u0628\u0644\u063a \u0645\u0639\u0627\u0645\u0644\u0647</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value) || 0)}
            className="w-full bg-background-tertiary border border-border-gold/30 rounded-xl p-3 text-white text-left dir='ltr' focus:outline-none focus:border-gold-primary transition-all"
            placeholder="\u0645\u0628\u0644\u063a \u0628\u0647 \u062a\u0648\u0645\u0627\u0646"
          />
        </div>
        
        <div>
          <label className="block text-xs text-text-secondary mb-1">\u0646\u0631\u062e \u0645\u0627\u0644\u06cc\u0627\u062a (%)</label>
          <input
            type="range"
            min="5"
            max="35"
            value={taxRate}
            onChange={(e) => setTaxRate(Number(e.target.value))}
            className="w-full h-2 bg-background-tertiary rounded-lg appearance-none cursor-pointer accent-gold-primary"
          />
          <div className="flex justify-between text-xs text-text-secondary mt-1">
            <span>\u06f5%</span>
            <span className="font-bold text-gold-primary">{taxRate}%</span>
            <span>\u06f3\u06f5%</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-background-secondary/50 rounded-xl p-3 text-center">
            <div className="text-xs text-text-secondary">\u0645\u0627\u0644\u06cc\u0627\u062a \u062a\u062e\u0635\u06cc\u0646\u06cc</div>
            <div className="text-lg font-bold text-gold-primary">{formatCurrency(calculatedTax)}</div>
          </div>
          <div className="bg-background-secondary/50 rounded-xl p-3 text-center">
            <div className="text-xs text-text-secondary">\u062e\u0627\u0644\u0635 \u062f\u0631\u06cc\u0627\u0641\u062a\u0646\u06cc</div>
            <div className="text-lg font-bold text-white">{formatCurrency(netAmount)}</div>
          </div>
        </div>
        
        <Link
          href="/consultation"
          className="block w-full text-center bg-gradient-to-l from-gold-primary to-gold-500 text-background-primary py-3 rounded-xl font-bold hover:shadow-gold-md transition-all"
        >
          \u0645\u0634\u0627\u0648\u0631\u0647 \u062f\u0642\u06cc\u0642\u062a\u0631
        </Link>
      </div>
    </div>
  );
}

// ============================================
// HomePage - Modern Black Gold Professional
// Mobile-First, Premium Financial Institution
// ============================================

export default function HomePage() {
  const { theme } = useGlassmorphicTheme();
  
  // Theme-based styling
  const isDark = theme === 'dark';

  return (
    <div className="bg-background-primary text-text-primary">
      {/* Hero Section with Slider - 10 second auto-play */}
      <HeroSlider />

      {/* Stats Section */}
      <section className="relative overflow-hidden border-b border-border-gold/20">
        <div className="absolute inset-0 luxury-aurora bg-gradient-to-br from-background-primary via-background-secondary to-background-primary opacity-50" />
        <div className="relative container-mobile py-12 md:py-16">
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Main Content */}
            <div className="reveal-up text-center lg:text-right">
              <span className="inline-flex rounded-full border border-border-gold/40 bg-gold-900/10 px-4 py-2 text-xs font-bold text-gold-primary animate-fade-in">
                \u0622\u06cc\u0627\u0646 \u062a\u0631\u0627\u0632\u061b \u0645\u0634\u0627\u0648\u0631\u0647\u060c \u0622\u0645\u0648\u0632\u0634 \u0648 \u0639\u0645\u0644\u0648\u0645\u06cc\u0627\u062a \u0645\u0627\u0644\u06cc\u0627\u062a\u06cc
              </span>
              <h1 className="gold-sheen mt-6 text-3xl sm:text-4xl md:text-5xl font-black leading-tight lg:text-6xl">
                \u0645\u0633\u06cc\u0631 \u062d\u0641\u0647\u060c\u0627\u06cc \u0645\u0627\u0644\u06cc\u0627\u062a \u0648 \u062d\u0633\u0627\u0628\u062f\u0627\u0631\u06cc
                <span className="block md:inline">\u060c \u0622\u0645\u0627\u062f\u0647 \u0628\u0631\u0627\u06cc \u0645\u0648\u0628\u0627\u06cc\u0644 \u0648 \u062f\u06cc\u067e\u0644\u0648\u06cc \u067e\u0627\u06cc\u062f\u0627\u0631</span>
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-text-secondary lg:mx-0">
                \u062b\u0628\u062a \u062f\u0631\u062e\u0648\u0627\u0633\u062a \u0645\u0634\u0627\u0648\u0631\u0647 \u0628\u062f\u0648\u0646 \u062f\u0631\u06af\u0627\u0647 \u067e\u0631\u062f\u0627\u062e\u062a\u060c \u062f\u0627\u0646\u0644\u0648\u0641 \u0645\u06cc\u0646\u06cc\u060c\u0628\u0648\u06a9\u060c \u062d\u0633\u0627\u0628\u062f\u0627\u0631\u06cc \u0648 \u0686\u062a\u060c\u0628\u0627\u062a \u067e\u0631\u0633\u0634 \u0648 \u067e\u0627\u0633\u062e \u062f\u0631 \u06cc\u06a9 \u062a\u062c\u0631\u0628\u0647 \u0645\u0634\u06a9\u06cc \u0640 \u0637\u0644\u0627\u06cc\u06cc \u0645\u062f\u0631\u0646 \u0648 \u0641\u0627\u0631\u0633\u06cc.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="/consultation"
                  className="btn-gold"
                >
                  \u0634\u0631\u0648\u0639 \u062b\u0628\u062a \u0648\u0642\u062a \u0645\u0634\u0627\u0648\u0631\u0647
                </Link>
                <Link
                  href="/minibooks"
                  className="btn-outline-gold"
                >
                  \u062f\u0627\u0646\u0644\u0648\u062f \u0645\u06cc\u0646\u06cc\u060c\u0628\u0648\u06a9\u060c\u0647\u0627
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="glass-gold reveal-up stagger-1 rounded-2xl md:rounded-3xl p-4 md:p-5">
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {stats.map((item, index) => (
                  <div 
                    key={item.label} 
                    className="rounded-xl border border-border-gold/20 bg-background-secondary/50 p-4 md:p-5 transition-all duration-300 hover:border-border-gold/40 animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <p className="text-xl md:text-2xl font-black text-gold-primary">{item.value}</p>
                    <p className="mt-2 text-sm text-text-secondary">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tax Calculator Section */}
      <section className="container-mobile py-10 md:py-12">
        <TaxCalculatorTeaser />
      </section>

      {/* Services Section */}
      <section className="container-mobile py-10 md:py-12">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-white">\u062e\u062f\u0645\u0627\u062a \u062a\u062e\u0635\u0635\u06cc \u0645\u0627</h2>
            <p className="mt-2 text-sm text-text-secondary">\u0631\u0627\u0647\u06a9\u0627\u0631\u0647\u0627\u06cc \u062d\u0641\u0647\u060c\u0627\u06cc \u0628\u0631\u0627\u06cc \u06a9\u0633\u0628\u060c\u0648\u06a9\u0627\u0631 \u0634\u0645\u0627</p>
          </div>
          <Link 
            href="/services" 
            className="hidden text-sm font-bold text-gold-primary hover:text-gold-400 transition-colors sm:block"
          >
            \u0645\u0634\u0627\u0647\u062f\u0647 \u0647\u0645\u0647 \u062e\u062f\u0645\u0627\u062a
          </Link>
        </div>
        
        {/* Services Grid - Mobile First */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="glass-card p-5 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:border-border-gold/40 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-3xl mb-3">{service.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">{service.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{service.desc}</p>
              <Link
                href="/consultation"
                className="inline-flex items-center gap-1 mt-4 text-gold-primary hover:text-gold-400 text-sm font-medium transition-colors"
              >
                \u0628\u06cc\u0634\u062a\u0631 \u0628\u062f\u0627\u0646\u06cc\u062f
                <span>\u2192</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="container-mobile py-10 md:py-12">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-white">\u062f\u0633\u062a\u0631\u0633\u06cc \u0633\u0631\u06cc\u0639 \u0639\u0644\u0644\u06cc\u0627\u062a\u06cc</h2>
            <p className="mt-2 text-sm text-text-secondary">\u062a\u0645\u0627\u0645 \u0633\u0631\u06cc\u0639\u0647\u0627\u06cc \u0627\u0635\u0644\u06cc \u0645\u062d\u0635\u0648\u0644 \u0627\u0632 \u0635\u0641\u062d\u0647 \u0627\u0648\u0644 \u0642\u0627\u0628\u0644 \u062f\u0633\u062a\u0644\u0644 \u0647\u0633\u062a\u0646\u062f.</p>
          </div>
          <Link 
            href="/services" 
            className="hidden text-sm font-bold text-gold-primary hover:text-gold-400 transition-colors sm:block"
          >
            \u0645\u0634\u0627\u0647\u062f\u0647 \u062e\u062f\u0645\u0627\u062a
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((item, index) => (
            <Link 
              key={item.href} 
              href={item.href} 
              className="glass-gold group rounded-xl md:rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-border-gold/40 min-h-[180px] flex flex-col animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-2xl mb-2">{item.icon}</div>
              <h3 className="text-lg font-black text-white group-hover:text-gold-primary transition-colors">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-text-secondary flex-1">{item.desc}</p>
              <span className="mt-4 inline-block text-gold-primary text-xl transform group-hover:translate-x-1 transition-transform duration-200">
                \u2192
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container-mobile pb-16 md:pb-20">
        <div className="rounded-2xl bg-gradient-to-r from-gold-900/10 to-gold-700/10 border border-border-gold/30 p-8 md:p-12 text-center animate-reveal-up">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-4">
            \u0622\u0645\u0627\u062f\u0647 \u0634\u0631\u0648\u0639 \u0647\u0633\u062a\u06cc\u062f\u061f
          </h2>
          <p className="text-text-secondary mb-8 max-w-2xl mx-auto">
            \u0628\u0627 \u062a\u06cc\u0645 \u0645\u062a\u062e\u0635\u0635 \u0622\u06cc\u0627\u0646 \u062a\u0631\u0627\u0632 \u062f\u0631 \u0627\u0631\u062a\u0628\u0627\u0637 \u0628\u0634\u06cc\u062f \u0648 \u0627\u0632 \u062e\u062f\u0645\u0627\u062a \u062d\u0641\u0647\u060c\u0627\u06cc \u0645\u0627 \u0628\u0647\u0631\u0647\u06cc\u0646 \u0634\u0648\u06cc\u062f.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/consultation"
              className="btn-gold"
            >
              \u062f\u0631\u06cc\u0627\u0641\u062a \u0645\u0634\u0627\u0648\u0631\u0647
            </Link>
            <Link
              href="/contact"
              className="btn-outline-gold"
            >
              \u062a\u0645\u0627\u0633 \u0628\u0627 \u0645\u0627
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
