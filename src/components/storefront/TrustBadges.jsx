import React from 'react';
import { ShieldCheck, Truck, Sparkles, Award } from 'lucide-react';

export const TrustBadges = () => {
  const badges = [
    {
      icon: Sparkles,
      title: "100% Pure Organic",
      subtitle: "Unadulterated African herbs & roots"
    },
    {
      icon: ShieldCheck,
      title: "Lab Verified",
      subtitle: "Tested for purity, zero heavy metals"
    },
    {
      icon: Truck,
      title: "Fast Africa Delivery",
      subtitle: "Express door-to-door courier"
    },
    {
      icon: Award,
      title: "Direct WhatsApp Care",
      subtitle: "Live personal dosage guidance"
    }
  ];

  return (
    <section className="bg-brand-forest text-white py-12 border-y border-brand-leaf/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {badges.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div key={idx} className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-2 sm:space-y-0 sm:space-x-3.5">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-brand-leaf shrink-0 border border-white/15">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold tracking-wide">{b.title}</h4>
                  <p className="text-xs text-white/70 mt-0.5">{b.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

