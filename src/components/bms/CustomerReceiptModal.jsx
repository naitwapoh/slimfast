import React from 'react';
import { X, Printer, MessageSquare, CheckCircle, ShieldCheck, Phone, Mail, MapPin, Receipt, Share2 } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

export const CustomerReceiptModal = ({ order, onClose }) => {
  const { formatPrice } = useCurrency();

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  // WhatsApp formatted receipt text generator
  const generateWhatsAppReceiptText = () => {
    const itemsList = (order.items || [])
      .map((it, idx) => `  ${idx + 1}. *${it.name}*\n     ${it.quantity} x ${formatPrice(it.priceTZS, order.currency)} = *${formatPrice(it.priceTZS * it.quantity, order.currency)}*`)
      .join('\n');

    const message = 
`🌿 *SLIMFAST OFFICIAL CUSTOMER RECEIPT* 🌿
----------------------------------------
*Receipt No:* #${order.orderId}
*Date:* ${new Date(order.createdAt).toLocaleDateString()} ${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
*Customer:* ${order.customerName || 'Customer'}
*Phone:* ${order.phoneNumber || 'N/A'}
*Payment Method:* ${order.paymentMethod || 'Cash'}
*Channel:* ${order.channel === 'pos' ? 'Shop Walk-in Counter' : 'Online Store Delivery'}
----------------------------------------
*PURCHASED ITEMS:*
${itemsList}
----------------------------------------
*TOTAL PAID:* *${formatPrice(order.totalTZS, order.currency)}*
*STATUS:* PAID & CONFIRMED ✅
----------------------------------------
*SERVED BY:* ${order.recordedByStaffName || 'SLIMFAST Attendant'}

🍃 *HERBAL WELLNESS ADVICE:*
For best results, drink 1 cup daily with consistent hydration. 
For personalized dosage & brewing guidelines, contact our wellness consultants:
📞 WhatsApp: +255 752 613 616
✉️ Email: slimfastslimmingtea@gmail.com
Dar es Salaam • Nairobi • Kampala • Kigali

_Thank you for choosing SLIMFAST 100% Organic Weight Management!_`;

    const targetPhone = (order.phoneNumber || '').replace(/[^0-9]/g, '');
    const baseUrl = targetPhone && targetPhone.length >= 9
      ? `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/255752613616?text=${encodeURIComponent(message)}`;

    return baseUrl;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 animate-fadeIn">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full max-h-[94vh] overflow-y-auto shadow-2xl border border-brand-leaf/30 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Hidden during printing) */}
        <div className="p-3.5 sm:p-4 bg-brand-surface border-b border-brand-leaf/20 flex items-center justify-between no-print sticky top-0 z-20">
          <div className="flex items-center space-x-2">
            <Receipt className="w-4 h-4 text-brand-forest" />
            <span className="text-xs font-black uppercase text-brand-forest tracking-wider">
              Customer Official Receipt
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* WhatsApp Share Button */}
            <a
              href={generateWhatsAppReceiptText()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors shadow-sm"
              title="Send Receipt to Customer on WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">WhatsApp Receipt</span>
            </a>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-brand-forest hover:bg-brand-leaf text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white text-brand-charcoal transition-colors"
              aria-label="Close receipt"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Official Customer Receipt Sheet */}
        <div id="printable-receipt" className="p-5 sm:p-8 text-brand-charcoal space-y-5 bg-white">
          
          {/* Receipt Brand Header */}
          <div className="text-center pb-5 border-b border-dashed border-brand-leaf/30 space-y-2">
            <div className="flex items-center justify-center space-x-2.5">
              <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-sm border border-brand-leaf/30 p-0.5 bg-white">
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
              <div className="text-left">
                <h1 className="text-2xl font-black font-serif text-brand-forest tracking-wider leading-none">
                  SLIMFAST
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-widest text-brand-leaf block mt-0.5">
                  Herbal Detox & Slimming
                </span>
              </div>
            </div>

            <p className="text-xs text-brand-charcoal/80 font-medium">
              100% Organic Herbal Weight Management & Detox
            </p>

            {/* Official Contact Lines */}
            <div className="text-[11px] text-brand-muted space-y-0.5 pt-1">
              <p className="font-mono">
                WhatsApp: <strong className="text-brand-forest">+255 752 613 616</strong> | +255 752 924 855
              </p>
              <p className="font-mono">
                Support: +255 758 412 408 | +255 783 032 211
              </p>
              <p>
                Email: slimfastslimmingtea@gmail.com
              </p>
              <p className="text-[10px] text-brand-charcoal/60">
                Dar es Salaam • Nairobi • Kampala • Kigali • Arusha
              </p>
            </div>
          </div>

          {/* Receipt Meta & Paid Seal Banner */}
          <div className="bg-brand-surface/60 rounded-2xl p-4 border border-brand-leaf/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-brand-muted">Receipt No:</span>
                <span className="font-mono font-black text-brand-forest text-sm">#{order.orderId}</span>
              </div>
              <div className="text-brand-muted">
                Date: <strong className="text-brand-charcoal">{new Date(order.createdAt).toLocaleDateString()}</strong> at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-brand-muted">
                Channel: <strong className="text-brand-charcoal">{order.channel === 'pos' ? 'Shop Walk-in Counter' : 'Online Store Delivery'}</strong>
              </div>
            </div>

            {/* Official Paid Stamp */}
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 font-black text-xs uppercase tracking-wider flex items-center space-x-1.5 self-start sm:self-auto">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>PAID IN FULL</span>
            </div>
          </div>

          {/* Customer & Attendant Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border border-brand-leaf/20 rounded-2xl p-3.5 bg-white">
            <div>
              <span className="text-[10px] uppercase font-bold text-brand-muted block">Customer Information:</span>
              <p className="font-bold text-sm text-brand-charcoal mt-0.5">{order.customerName || 'Walk-in Customer'}</p>
              {order.phoneNumber && (
                <p className="text-brand-forest font-mono font-semibold mt-0.5 flex items-center space-x-1">
                  <Phone className="w-3 h-3 text-brand-leaf" />
                  <span>{order.phoneNumber}</span>
                </p>
              )}
              {order.address && (
                <p className="text-brand-muted text-[11px] mt-0.5 flex items-start space-x-1">
                  <MapPin className="w-3 h-3 text-brand-leaf shrink-0 mt-0.5" />
                  <span>{order.address}, {order.city || ''} {order.country || ''}</span>
                </p>
              )}
            </div>

            <div className="border-t sm:border-t-0 sm:border-l border-brand-leaf/15 pt-2 sm:pt-0 sm:pl-3">
              <span className="text-[10px] uppercase font-bold text-brand-muted block">Payment & Attendant:</span>
              <p className="mt-0.5"><span className="text-brand-muted">Payment Mode:</span> <strong className="text-brand-charcoal">{order.paymentMethod || 'Cash'}</strong></p>
              <p className="mt-0.5"><span className="text-brand-muted">Served By:</span> <strong className="text-brand-charcoal">{order.recordedByStaffName || 'SLIMFAST Attendant'}</strong></p>
              <p className="mt-0.5"><span className="text-brand-muted">Delivery Status:</span> <strong className="text-brand-leaf">{order.status || 'Confirmed'}</strong></p>
            </div>
          </div>

          {/* Itemized Table */}
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-brand-leaf/20 rounded-xl overflow-hidden">
                <thead className="bg-brand-surface font-bold text-brand-forest border-b border-brand-leaf/20">
                  <tr>
                    <th className="p-2.5 sm:p-3">#</th>
                    <th className="p-2.5 sm:p-3">Item Description</th>
                    <th className="p-2.5 sm:p-3 text-center">Qty</th>
                    <th className="p-2.5 sm:p-3 text-right">Price</th>
                    <th className="p-2.5 sm:p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-leaf/10">
                  {(order.items || []).map((it, idx) => (
                    <tr key={idx} className="hover:bg-brand-surface/20">
                      <td className="p-2.5 sm:p-3 font-mono text-brand-muted">{idx + 1}</td>
                      <td className="p-2.5 sm:p-3 font-bold text-brand-charcoal">{it.name}</td>
                      <td className="p-2.5 sm:p-3 text-center font-bold text-brand-forest">{it.quantity}</td>
                      <td className="p-2.5 sm:p-3 text-right text-brand-charcoal">{formatPrice(it.priceTZS, order.currency)}</td>
                      <td className="p-2.5 sm:p-3 text-right font-black text-brand-forest">
                        {formatPrice(it.priceTZS * it.quantity, order.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-brand-surface/60 border-t border-brand-leaf/25 text-xs font-bold">
                  <tr>
                    <td colSpan="4" className="p-2.5 sm:p-3 text-right text-brand-charcoal">Subtotal:</td>
                    <td className="p-2.5 sm:p-3 text-right">{formatPrice(order.totalTZS, order.currency)}</td>
                  </tr>
                  <tr>
                    <td colSpan="4" className="p-2 sm:p-2.5 text-right text-brand-muted">VAT / Tax:</td>
                    <td className="p-2 sm:p-2.5 text-right text-brand-muted">0.00 (Inclusive)</td>
                  </tr>
                  <tr className="border-t border-brand-leaf/30 text-sm font-black text-brand-forest bg-brand-surface">
                    <td colSpan="4" className="p-3 text-right font-serif uppercase">Total Amount Paid:</td>
                    <td className="p-3 text-right text-base text-brand-forest font-serif font-black">
                      {formatPrice(order.totalTZS, order.currency)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Usage Note & Botanical Guarantee */}
          <div className="bg-brand-surface/40 p-3.5 rounded-2xl border border-brand-leaf/20 space-y-1.5 text-[11px] text-brand-charcoal/80">
            <div className="flex items-center space-x-1.5 text-brand-forest font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-leaf" />
              <span>Authentic 100% Herbal Guarantee</span>
            </div>
            <p className="leading-relaxed">
              Moringa oleifera, Garcinia Cambogia & Unroasted Arabica beans are natural thermogenic botanicals. For optimal weight loss results, maintain hydration and store tightly sealed in a dry place.
            </p>
          </div>

          {/* Customer Signature & Attendant Footer */}
          <div className="pt-4 grid grid-cols-2 gap-6 text-[10px] text-brand-muted border-t border-dashed border-brand-leaf/30">
            <div>
              <p className="font-bold text-brand-charcoal">Issued by SLIMFAST:</p>
              <p className="mt-4 border-t border-brand-leaf/30 pt-1">Authorized Cashier / Attendant</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-brand-charcoal">Customer Confirmation:</p>
              <p className="mt-4 border-t border-brand-leaf/30 pt-1">Signed / Received</p>
            </div>
          </div>

          {/* Thank You Note */}
          <div className="text-center text-[11px] text-brand-muted pt-2 border-t border-brand-leaf/20">
            <p className="font-bold text-brand-forest">Thank you for choosing SLIMFAST!</p>
            <p className="text-[10px] text-brand-muted mt-0.5">
              For free consultation & reorders, WhatsApp <strong className="text-brand-forest">+255 752 613 616</strong>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
