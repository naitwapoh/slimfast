import React from 'react';
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, HeartHandshake, Award } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Hero = () => {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:py-20 bg-gradient-to-b from-brand-surface via-brand-surface/60 to-white">
      {/* Background Herbal Decors */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-brand-leaf/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-brand-forest/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Story & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-forest/10 border border-brand-forest/20 text-brand-forest text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-brand-leaf" />
              <span>{t('hero.organicCert')}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-brand-forest font-serif leading-[1.15] tracking-tight">
              {t('hero.title')}
            </h1>

            <p className="text-base sm:text-lg text-brand-charcoal/80 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              {t('hero.subtitle')}
            </p>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <a
                href="#products"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-forest hover:bg-brand-forest/90 text-white font-bold text-base shadow-herbal-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
              >
                <span>{t('hero.shopNow')}</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto px-7 py-4 rounded-xl bg-white hover:bg-brand-surface text-brand-forest border border-brand-leaf/40 font-bold text-base transition-colors flex items-center justify-center shadow-sm"
              >
                <span>{t('hero.howToBrew')}</span>
              </a>
            </div>

            {/* Key Trust Stats */}
            <div className="pt-8 border-t border-brand-leaf/20 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <div className="text-2xl sm:text-3xl font-extrabold text-brand-forest font-serif">{t('hero.stat1Number')}</div>
                <div className="text-xs sm:text-sm text-brand-charcoal/70 font-medium mt-0.5">{t('hero.stat1Label')}</div>
              </div>
              <div className="text-center lg:text-left border-x border-brand-leaf/20 px-2 sm:px-4">
                <div className="text-2xl sm:text-3xl font-extrabold text-brand-forest font-serif">{t('hero.stat2Number')}</div>
                <div className="text-xs sm:text-sm text-brand-charcoal/70 font-medium mt-0.5">{t('hero.stat2Label')}</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl sm:text-3xl font-extrabold text-brand-leaf font-serif">{t('hero.stat3Number')}</div>
                <div className="text-xs sm:text-sm text-brand-charcoal/70 font-medium mt-0.5">{t('hero.stat3Label')}</div>
              </div>
            </div>
          </div>

          {/* Right Column: Botanical Visual Banner */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Botanical Frame Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-herbal-lg border border-brand-leaf/30 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-brand-leaf/20 rounded-full blur-2xl" />

                {/* Hero Showcase Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-brand-leaf animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-forest">SLIMFAST Signature</span>
                  </div>
                  <span className="px-3 py-1 bg-brand-forest text-white text-[11px] font-black rounded-full uppercase tracking-wider">
                    Pure Organic
                  </span>
                </div>

                {/* Product Imagery Graphics Container with Woman Ambassador Image */}
                <div className="relative rounded-2xl overflow-hidden border border-brand-leaf/30 shadow-md group">
                  <div className="relative h-72 sm:h-80 w-full overflow-hidden bg-brand-surface">
                    <img 
                      src="/signature-woman.jpg" 
                      alt="SLIMFAST Signature Herbal Ambassador"
                      className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://lh3.googleusercontent.com/gg/AJWXcNfEFJjOWo1rUN172RiEFZ4s6i4HjXBUCbw5Qvo3TV2HBGpMrriRpB_YwQlbUWE0H1mZWEG1B7Y2DccIGOkWbLrAuAOQ8qtuUuUnnPSjvM2ebS1xMv874HRx43wyrY-dB3i5ht8J7VlV1FzwZbSeFwzgxkesRT9-dTtA1wjgSOPxDmFZ9fsr=s1024-rj';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-5 text-white">
                      <span className="text-[10px] font-black uppercase tracking-widest text-brand-leaf">
                        SLIMFAST Natural Results
                      </span>
                      <h3 className="text-lg font-black font-serif text-white leading-tight">
                        Authentic Botanical Transformation
                      </h3>
                      <p className="text-[11px] text-white/90 mt-1 line-clamp-2">
                        Real results with Moringa oleifera, Unroasted Arabica & Garcinia herbal blends.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mini Features List */}
                <div className="mt-6 space-y-2.5">
                  <div className="flex items-center space-x-2.5 text-xs text-brand-charcoal font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-brand-forest shrink-0" />
                    <span>Thermogenic Fat Burn & Belly Detox</span>
                  </div>
                  <div className="flex items-center space-x-2.5 text-xs text-brand-charcoal font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-brand-forest shrink-0" />
                    <span>Appetite Suppression & Healthy Blood Sugar</span>
                  </div>
                  <div className="flex items-center space-x-2.5 text-xs text-brand-charcoal font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-brand-forest shrink-0" />
                    <span>100% Herbal: No Laxatives or Chemical Preservatives</span>
                  </div>
                </div>

                {/* Shipping badge */}
                <div className="mt-6 p-3 bg-brand-surface rounded-xl flex items-center space-x-3 border border-brand-leaf/20">
                  <HeartHandshake className="w-5 h-5 text-brand-forest shrink-0" />
                  <p className="text-[11px] text-brand-charcoal leading-tight">
                    <strong className="text-brand-forest">Direct African Delivery:</strong> Same-day dispatch in Dar es Salaam, Nairobi, Kampala, Kigali & Arusha.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

