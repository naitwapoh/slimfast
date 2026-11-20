import React from 'react';
import { Coffee, Droplet, Moon, Heart } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const HowItWorksSection = () => {
  const { t } = useLanguage();

  const steps = [
    {
      icon: Coffee,
      title: t('howToUse.step1Title'),
      desc: t('howToUse.step1Desc'),
      time: '07:00 AM'
    },
    {
      icon: Droplet,
      title: t('howToUse.step2Title'),
      desc: t('howToUse.step2Desc'),
      time: 'Throughout Day'
    },
    {
      icon: Moon,
      title: t('howToUse.step3Title'),
      desc: t('howToUse.step3Desc'),
      time: '09:00 PM'
    },
    {
      icon: Heart,
      title: t('howToUse.step4Title'),
      desc: t('howToUse.step4Desc'),
      time: '14 - 30 Days'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs uppercase font-extrabold text-brand-leaf tracking-widest block">
            Daily Ritual
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-serif text-brand-forest">
            {t('howToUse.title')}
          </h2>
          <p className="text-base text-brand-charcoal/80 leading-relaxed font-normal">
            {t('howToUse.subtitle')}
          </p>
        </div>

        {/* Ritual Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={index}
                className="bg-brand-surface/60 rounded-3xl p-6 border border-brand-leaf/20 relative flex flex-col justify-between hover:bg-brand-surface transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 rounded-full bg-brand-forest text-white text-[10px] font-black uppercase tracking-wider">
                      Step {index + 1}
                    </span>
                    <span className="text-[11px] font-bold text-brand-muted">
                      {step.time}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-white border border-brand-leaf/30 flex items-center justify-center text-brand-forest mb-4 shadow-sm">
                    <Icon className="w-6 h-6 text-brand-forest" />
                  </div>

                  <h3 className="text-lg font-bold font-serif text-brand-forest mb-2">
                    {step.title}
                  </h3>

                  <p className="text-xs text-brand-charcoal/80 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-brand-leaf/15 flex items-center text-[10px] font-bold text-brand-leaf uppercase">
                  <span>Ritual Complete</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
