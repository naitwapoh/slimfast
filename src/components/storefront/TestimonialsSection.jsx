import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, Quote, Sparkles, MapPin, MessageSquare, ArrowRight, Heart } from 'lucide-react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { useLanguage } from '../../context/LanguageContext';

export const TestimonialsSection = () => {
  const { t, language } = useLanguage();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    try {
      const q = collection(db, 'testimonials');
      const unsub = onSnapshot(q, (snapshot) => {
        const list = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.isPublished !== false) {
            list.push({ id: doc.id, ...data });
          }
        });
        // Sort newest first
        list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setTestimonials(list);
        setLoading(false);
      }, (err) => {
        console.warn('Testimonials listener notice:', err.message);
        setLoading(false);
      });

      return () => unsub();
    } catch (e) {
      console.error('Failed to listen to testimonials:', e);
      setLoading(false);
    }
  }, []);

  return (
    <section id="testimonials" className="py-14 sm:py-24 bg-gradient-to-b from-white via-brand-surface/50 to-white relative overflow-hidden">
      {/* Background Herbal Decors */}
      <div className="absolute top-1/2 left-0 -ml-32 -mt-32 w-80 h-80 rounded-full bg-brand-leaf/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 -mr-32 -mb-32 w-80 h-80 rounded-full bg-brand-forest/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 space-y-2.5 sm:space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-brand-surface border border-brand-leaf/30 text-brand-forest text-[11px] sm:text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-brand-leaf" />
            <span>{language === 'sw' ? 'Matokeo Halisi ya Wateja' : 'Real Customer Results'}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black font-serif text-brand-forest">
            {language === 'sw' ? 'Mabadiliko Halisi na Ushuhuda' : 'Real Transformations & Stories'}
          </h2>

          <p className="text-sm sm:text-base text-brand-charcoal/80 leading-relaxed font-normal max-w-2xl mx-auto">
            {language === 'sw'
              ? 'Tazama picha za mabadiliko na maoni ya wateja waliopata matokeo mazuri kwa kutumia SLIMFAST kote Afrika Mashariki.'
              : 'See authentic transformations and verified customer reviews from people across East Africa who reached their wellness goals with SLIMFAST.'}
          </p>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-brand-leaf/30 border-t-brand-forest rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-brand-muted mt-2">{t('loading')}</p>
          </div>
        ) : testimonials.length === 0 ? (

          /* Clean Empty State when Admin hasn't uploaded yet */
          <div className="bg-white rounded-3xl p-8 sm:p-14 text-center border border-dashed border-brand-leaf/30 max-w-2xl mx-auto shadow-sm space-y-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-brand-surface flex items-center justify-center text-brand-forest">
              <Heart className="w-7 h-7 sm:w-8 sm:h-8 text-brand-leaf fill-brand-leaf/20" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-serif text-brand-forest">
              {language === 'sw' ? 'Ushuhuda Mpya Unaandaliwa' : 'Customer Stories & Transformations'}
            </h3>
            <p className="text-xs sm:text-sm text-brand-charcoal/70 leading-relaxed max-w-md mx-auto">
              {language === 'sw'
                ? 'Picha za mabadiliko ya wateja wetu zinaandaliwa na usimamizi wa SLIMFAST. Anza safari yako ya afya leo ili uwe mmoja wa washuhudiaji wetu!'
                : 'Customer transformation photos and verified reviews are being updated by our wellness team. Start your organic journey today and be our next success story!'}
            </p>
            <div className="pt-2">
              <a
                href="#products"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-brand-forest hover:bg-brand-leaf text-white font-bold text-xs sm:text-sm transition-all shadow-md"
              >
                <span>{language === 'sw' ? 'Anza Safari Yako Leo' : 'Start Your Transformation'}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

        ) : (

          /* Testimonials Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((item) => (
              <div 
                key={item.id}
                className="bg-white rounded-3xl border border-brand-leaf/25 shadow-herbal hover:shadow-herbal-lg transition-all duration-300 flex flex-col overflow-hidden group"
              >
                {/* Customer Photo Container */}
                {item.imageUrl && (
                  <div className="relative h-60 sm:h-64 w-full overflow-hidden bg-brand-surface">
                    <img 
                      src={item.imageUrl} 
                      alt={item.customerName || 'Customer transformation'}
                      className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/logo.jpg';
                      }}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                    {/* Highlight Result Tag Floating on Image */}
                    {item.resultTag && (
                      <div className="absolute top-3.5 left-3.5 px-3 py-1 bg-brand-forest/90 backdrop-blur-md text-white text-[11px] font-black rounded-full shadow-md border border-brand-leaf/30 uppercase tracking-wide">
                        🔥 {item.resultTag}
                      </div>
                    )}

                    {/* Location Badge at Bottom-Left of Image */}
                    {item.location && (
                      <div className="absolute bottom-3 left-3 text-white text-xs font-bold flex items-center space-x-1 drop-shadow">
                        <MapPin className="w-3.5 h-3.5 text-brand-leaf" />
                        <span>{item.location}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Card Body */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    {/* Rating Stars & Verified Customer Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-amber-400">
                        {[...Array(Number(item.rating) || 5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>

                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        <span>{language === 'sw' ? 'Mteja Aliyethibitishwa' : 'Verified Buyer'}</span>
                      </span>
                    </div>

                    {/* Customer Review Quote */}
                    <div className="relative">
                      <Quote className="w-6 h-6 text-brand-leaf/20 absolute -top-2 -left-2 pointer-events-none" />
                      <p className="text-xs sm:text-sm text-brand-charcoal/85 leading-relaxed italic pl-3 border-l-2 border-brand-leaf/30">
                        "{item.quote || item.reviewText}"
                      </p>
                    </div>
                  </div>

                  {/* Customer Identity Footer */}
                  <div className="pt-3 border-t border-brand-surface flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold font-serif text-brand-forest">
                        {item.customerName}
                      </h4>
                      <p className="text-[10px] text-brand-muted">
                        {item.productUsed || (language === 'sw' ? 'Mtumiaji wa SLIMFAST' : 'SLIMFAST User')}
                      </p>
                    </div>

                    {item.date && (
                      <span className="text-[10px] text-brand-muted font-mono">
                        {item.date}
                      </span>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>

        )}

      </div>
    </section>
  );
};
