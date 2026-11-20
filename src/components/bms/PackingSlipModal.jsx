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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-brand-leaf/30 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Controls Bar (Hidden during print) */}
        <div className="p-4 bg-brand-surface border-b border-brand-leaf/20 flex items-center justify-between no-print">
          <span className="text-xs font-bold uppercase text-brand-forest">
            Packing Slip & Dispatch Note
          </span>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-brand-forest hover:bg-brand-leaf text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white text-brand-charcoal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div id="printable-slip" className="p-8 text-brand-charcoal space-y-6">
          
          {/* Header */}
          <div className="flex items-start justify-between border-b pb-6">
            <div>
              <div className="flex items-center space-x-2">
                <Leaf className="w-6 h-6 text-brand-forest" />
                <h1 className="text-2xl font-black font-serif text-brand-forest tracking-wide">
                  SLIMFAST
                </h1>
              </div>
              <p className="text-xs text-brand-muted mt-1">
                100% Organic Herbal Weight Management & Detox
              </p>
              <p className="text-xs text-brand-charcoal mt-1">
                WhatsApp: +255 752 613 616 | slimfastslimmingtea@gmail.com
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-brand-surface text-brand-forest text-xs font-black rounded-md uppercase">
                Order #{order.orderId}
              </span>
              <p className="text-xs text-brand-muted mt-1.5">
                Date: {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <p className="text-xs font-bold text-brand-forest mt-0.5">
                Status: {order.status || 'Pending'}
              </p>
            </div>
          </div>

          {/* Recipient & Shipping Details */}
          <div className="grid grid-cols-2 gap-6 bg-brand-surface/40 p-4 rounded-xl border border-brand-leaf/20 text-xs">
            <div>
              <h4 className="font-extrabold uppercase text-brand-forest mb-1.5">Deliver To:</h4>
              <p className="font-bold text-sm text-brand-charcoal">{order.customerName}</p>
              <p className="text-brand-charcoal/80 mt-1">{order.address}</p>
              <p className="text-brand-charcoal/80">{order.city}, {order.country}</p>
              <p className="font-mono font-bold mt-1.5 text-brand-forest">Tel: {order.phoneNumber}</p>
            </div>

            <div>
              <h4 className="font-extrabold uppercase text-brand-forest mb-1.5">Dispatch Logistics:</h4>
              <p><span className="text-brand-muted">Payment Method:</span> <strong>{order.paymentMethod || 'Mobile Money'}</strong></p>
              <p><span className="text-brand-muted">Channel:</span> <strong>{order.channel === 'pos' ? 'Shop Walk-in' : 'Online Store'}</strong></p>
              <p><span className="text-brand-muted">Verified By:</span> <strong>SLIMFAST Fulfillment Desk</strong></p>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h4 className="font-extrabold text-xs uppercase text-brand-forest mb-2">Package Contents:</h4>
            <table className="w-full text-left text-xs border border-brand-leaf/20 rounded-lg overflow-hidden">
              <thead className="bg-brand-surface font-bold text-brand-forest border-b border-brand-leaf/20">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Item Description</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-leaf/10">
                {(order.items || []).map((it, idx) => (
                  <tr key={idx}>
                    <td className="p-3 font-mono">{idx + 1}</td>
                    <td className="p-3 font-semibold">{it.name}</td>
                    <td className="p-3 text-center font-bold">{it.quantity}</td>
                    <td className="p-3 text-right">{formatPrice(it.priceTZS, order.currency)}</td>
                    <td className="p-3 text-right font-bold">{formatPrice(it.priceTZS * it.quantity, order.currency)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-brand-surface/60 font-bold border-t border-brand-leaf/20">
                <tr>
                  <td colSpan="4" className="p-3 text-right uppercase text-brand-forest">Grand Total:</td>
                  <td className="p-3 text-right text-sm text-brand-forest font-black">
                    {formatPrice(order.totalTZS, order.currency)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Customer Signature & Dispatch Footer */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-[11px] text-brand-muted">
            <div className="border-t border-dashed pt-2">
              <p>Prepared / Inspected by (Fulfillment Agent)</p>
            </div>
            <div className="border-t border-dashed pt-2 text-right">
              <p>Received in Good Condition (Customer Signature)</p>
            </div>
          </div>

          <div className="text-center text-[10px] text-brand-muted pt-4 border-t">
            Thank you for choosing SLIMFAST 100% Organic Herbal Solutions!
          </div>

        </div>
      </div>
    </div>
  );
};
