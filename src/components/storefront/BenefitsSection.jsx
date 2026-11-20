import React from 'react';
import { Flame, Activity, ShieldCheck, HeartPulse, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const BenefitsSection = () => {
  const { t } = useLanguage();

  const benefitsList = [
    {
      icon: Flame,
      title: t('benefits.fatBurnTitle'),
      desc: t('benefits.fatBurnDesc'),
      color: 'bg-amber-500/10 text-amber-600 border-amber-200'
    },
    {
      icon: Activity,
      title: t('benefits.metabolismTitle'),
      desc: t('benefits.metabolismDesc'),
      color: 'bg-brand-leaf/15 text-brand-leaf border-brand-leaf/30'
    },
    {
      icon: ShieldCheck,
      title: t('benefits.appetiteTitle'),
      desc: t('benefits.appetiteDesc'),
      color: 'bg-brand-forest/10 text-brand-forest border-brand-forest/30'
    },
    {
      icon: HeartPulse,
      title: t('benefits.sugarTitle'),
      desc: t('benefits.sugarDesc'),
      color: 'bg-rose-500/10 text-rose-600 border-rose-200'
    },
    {
      icon: RefreshCw,
      title: t('benefits.digestiveTitle'),
      desc: t('benefits.digestiveDesc'),
      color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200'
    }
  ];

  return (
    <section id="benefits" className="py-20 bg-brand-surface relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs uppercase font-extrabold text-brand-leaf tracking-widest block">
            SLIMFAST Botanical Wellness
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-serif text-brand-forest">
            {t('benefits.sectionTitle')}
          </h2>
          <p className="text-base text-brand-charcoal/80 leading-relaxed font-normal">
            {t('benefits.sectionSubtitle')}
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefitsList.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-3xl p-8 border border-brand-leaf/20 shadow-herbal hover:shadow-herbal-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border mb-6 ${item.color}`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold font-serif text-brand-forest mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-brand-charcoal/80 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-brand-surface flex items-center space-x-2 text-[11px] font-bold text-brand-leaf uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-brand-leaf" />
                  <span>100% Herbal Efficacy</span>
                </div>
              </div>
            );
          })}

          {/* Bonus Guarantee Card */}
          <div className="bg-gradient-to-br from-brand-forest to-[#1e4817] text-white rounded-3xl p-8 shadow-herbal-lg flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 mb-6">
                <ShieldCheck className="w-7 h-7 text-brand-leaf" />
              </div>
              <h3 className="text-xl font-bold font-serif text-white mb-3">
                Laboratory Tested & Certified
              </h3>
              <p className="text-sm text-white/80 leading-relaxed">
                Zero harmful chemicals, no artificial stimulants or dehydrating laxatives. Safe for daily wellness and long-term vitality.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center space-x-2 text-[11px] font-bold text-brand-leaf uppercase tracking-wider">
              <span>Authentic African Quality</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
