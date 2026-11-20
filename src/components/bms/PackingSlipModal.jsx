import React from 'react';
import { X, Printer, Leaf } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

export const PackingSlipModal = ({ order, onClose }) => {
  const { formatPrice } = useCurrency();

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 animate-fadeIn">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-brand-leaf/30 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Controls Bar (Hidden during print) */}
        <div className="p-3 sm:p-4 bg-brand-surface border-b border-brand-leaf/20 flex items-center justify-between no-print sticky top-0 z-10">
          <span className="text-[11px] sm:text-xs font-bold uppercase text-brand-forest">
            Packing Slip & Dispatch Note
          </span>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-brand-forest hover:bg-brand-leaf text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white text-brand-charcoal"
              aria-label="Close packing slip"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div id="printable-slip" className="p-4 sm:p-8 text-brand-charcoal space-y-5 sm:space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b pb-4 sm:pb-6 gap-3">
            <div>
              <div className="flex items-center space-x-2.5">
                <img 
                  src="/logo.jpg" 
                  alt="SLIMFAST Logo" 
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border border-brand-leaf/30 shrink-0"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://i.postimg.cc/T3Pmj5Rf/Gemini-Generated-Image-omoe51omoe51omoe.jpg';
                  }}
                />
                <h1 className="text-xl sm:text-2xl font-black font-serif text-brand-forest tracking-wide">
                  SLIMFAST
                </h1>
              </div>
              <p className="text-[11px] sm:text-xs text-brand-muted mt-1">
                100% Organic Herbal Weight Management & Detox
              </p>
              <p className="text-[11px] sm:text-xs text-brand-charcoal mt-0.5">
                WhatsApp: +255 752 613 616 | slimfastslimmingtea@gmail.com
              </p>
            </div>

            <div className="text-left sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-brand-leaf/10">
              <span className="inline-block px-2.5 py-1 bg-brand-surface text-brand-forest text-xs font-black rounded-md uppercase">
                Order #{order.orderId}
              </span>
              <p className="text-[11px] text-brand-muted mt-1">
                Date: {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <p className="text-xs font-bold text-brand-forest mt-0.5">
                Status: {order.status || 'Pending'}
              </p>
            </div>
          </div>

          {/* Recipient & Shipping Details (Responsive 1-col on phone, 2-col on sm:) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 bg-brand-surface/40 p-3.5 sm:p-4 rounded-xl border border-brand-leaf/20 text-xs">
            <div>
              <h4 className="font-extrabold uppercase text-brand-forest mb-1">Deliver To:</h4>
              <p className="font-bold text-sm text-brand-charcoal">{order.customerName}</p>
              <p className="text-brand-charcoal/80 mt-1">{order.address}</p>
              <p className="text-brand-charcoal/80">{order.city}, {order.country}</p>
              <p className="font-mono font-bold mt-1 text-brand-forest">Tel: {order.phoneNumber}</p>
            </div>

            <div>
              <h4 className="font-extrabold uppercase text-brand-forest mb-1">Dispatch Logistics:</h4>
              <p><span className="text-brand-muted">Payment:</span> <strong>{order.paymentMethod || 'Mobile Money'}</strong></p>
              <p><span className="text-brand-muted">Channel:</span> <strong>{order.channel === 'pos' ? 'Shop Walk-in' : 'Online Store'}</strong></p>
              <p><span className="text-brand-muted">Verified By:</span> <strong>SLIMFAST Dispatch Desk</strong></p>
            </div>
          </div>

          {/* Items Table with Overflow Protection */}
          <div>
            <h4 className="font-extrabold text-xs uppercase text-brand-forest mb-2">Package Contents:</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-brand-leaf/20 rounded-lg overflow-hidden">
                <thead className="bg-brand-surface font-bold text-brand-forest border-b border-brand-leaf/20">
                  <tr>
                    <th className="p-2.5 sm:p-3">#</th>
                    <th className="p-2.5 sm:p-3">Item Description</th>
                    <th className="p-2.5 sm:p-3 text-center">Qty</th>
                    <th className="p-2.5 sm:p-3 text-right">Unit Price</th>
                    <th className="p-2.5 sm:p-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-leaf/10">
                  {(order.items || []).map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 sm:p-3 font-mono">{idx + 1}</td>
                      <td className="p-2.5 sm:p-3 font-semibold">{it.name}</td>
                      <td className="p-2.5 sm:p-3 text-center font-bold">{it.quantity}</td>
                      <td className="p-2.5 sm:p-3 text-right">{formatPrice(it.priceTZS, order.currency)}</td>
                      <td className="p-2.5 sm:p-3 text-right font-bold">{formatPrice(it.priceTZS * it.quantity, order.currency)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-brand-surface/60 font-bold border-t border-brand-leaf/20">
                  <tr>
                    <td colSpan="4" className="p-2.5 sm:p-3 text-right uppercase text-brand-forest">Grand Total:</td>
                    <td className="p-2.5 sm:p-3 text-right text-xs sm:text-sm text-brand-forest font-black">
                      {formatPrice(order.totalTZS, order.currency)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Customer Signature & Dispatch Footer */}
          <div className="pt-4 sm:pt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 text-[11px] text-brand-muted">
            <div className="border-t border-dashed pt-2">
              <p>Prepared / Inspected by (Fulfillment Agent)</p>
            </div>
            <div className="border-t border-dashed pt-2 sm:text-right">
              <p>Received in Good Condition (Customer Signature)</p>
            </div>
          </div>

          <div className="text-center text-[10px] text-brand-muted pt-3 border-t">
            Thank you for choosing SLIMFAST 100% Organic Herbal Solutions!
          </div>

        </div>
      </div>
    </div>
  );
};
