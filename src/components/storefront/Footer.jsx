import React from 'react';
import { Leaf, Phone, Mail, MapPin, ShieldCheck, Lock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Footer = ({ onOpenPortal }) => {
  const { t } = useLanguage();

  const phoneNumbers = [
    "+255 752 613 616",
    "+255 752 924 855",
    "+255 758 412 408",
    "+255 783 032 211"
  ];

  return (
    <footer id="contact" className="bg-[#152714] text-white pt-16 pb-8 border-t border-brand-leaf/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          
          {/* Brand Info */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md border border-brand-leaf/30 bg-white p-0.5">
                <img 
                  src="/logo.jpg" 
                  alt="SLIMFAST Logo" 
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://i.postimg.cc/T3Pmj5Rf/Gemini-Generated-Image-omoe51omoe51omoe.jpg';
                  }}
                />
              </div>
              <span className="text-2xl font-black font-serif tracking-wider text-white">
                SLIMFAST
              </span>
            </div>

            <p className="text-xs text-white/75 max-w-sm leading-relaxed">
              {t('footer.tagline')}
            </p>

            <div className="pt-2 text-xs text-white/60 space-y-1">
              <p>Dar es Salaam, Tanzania • Nairobi, Kenya • Kampala, Uganda</p>
              <p>Pan-African Shipping & Express Courier Services</p>
            </div>
          </div>

          {/* Official Phone Contacts */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-leaf">
              {t('footer.phones')}
            </h4>
            <div className="space-y-2 text-xs">
              {phoneNumbers.map((phone, i) => (
                <a
                  key={i}
                  href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-white/85 hover:text-brand-leaf transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-brand-leaf" />
                  <span className="font-mono">{phone}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Official Email & Support */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-leaf">
              {t('footer.email')}
            </h4>
            <a
              href="mailto:slimfastslimmingtea@gmail.com"
              className="flex items-center space-x-2 text-xs text-white/85 hover:text-brand-leaf transition-colors break-all"
            >
              <Mail className="w-3.5 h-3.5 text-brand-leaf shrink-0" />
              <span>slimfastslimmingtea@gmail.com</span>
            </a>

            <div className="pt-4">
              <a
                href="#products"
                className="inline-block px-4 py-2 bg-brand-forest hover:bg-brand-leaf text-white text-xs font-bold rounded-xl transition-colors"
              >
                {t('nav.products')}
              </a>
            </div>
          </div>

        </div>

        {/* Health Disclaimer */}
        <div className="pt-8 border-t border-white/10 text-[11px] text-white/60 leading-relaxed text-center max-w-3xl mx-auto">
          <p>{t('footer.legalDisclaimer')}</p>
        </div>

        {/* Bottom Bar & Staff/Owner Portal Link */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-white/60 gap-4">
          <p>© {new Date().getFullYear()} SLIMFAST. {t('footer.rights')}</p>

          {/* Subtle Secure Staff & Owner Portal Link */}
          <button
            type="button"
            onClick={onOpenPortal}
            className="group flex items-center space-x-1.5 text-xs text-white/50 hover:text-brand-leaf transition-colors py-1 px-2.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10"
            title="Access Business Management System"
          >
            <Lock className="w-3 h-3 text-white/40 group-hover:text-brand-leaf transition-colors" />
            <span className="font-medium">{t('footer.staffPortal')}</span>
          </button>
        </div>

      </div>
    </footer>
  );
};

