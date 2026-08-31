import React, { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import confetti from 'canvas-confetti';
import { CheckCircle2, ShoppingBag, ArrowRight, BarChart3, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';

interface CheckoutSummaryModalProps {
  totalAmount: number;
  itemCount: number;
  listTitle: string;
  onClose: () => void;
}

export const CheckoutSummaryModal: React.FC<CheckoutSummaryModalProps> = ({
  totalAmount,
  itemCount,
  listTitle,
  onClose,
}) => {
  useLockBodyScroll();
  const { setActiveTab } = useAppStore();

  useEffect(() => {
    // Fire festive celebratory confetti!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'],
      });
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleGoToAnalytics = () => {
    onClose();
    setActiveTab('analytics');
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl text-center relative border border-slate-100"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3.5 shadow-sm shadow-emerald-200">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        {/* Title */}
        <h2 className="font-extrabold text-xl text-slate-900 leading-tight">
          Alışveriş Tamamlandı!
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {listTitle} sepetindeki {itemCount} adet ürün başarıyla harcama kayıtlarına işlendi.
        </p>

        {/* Receipt Box */}
        <div className="my-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-200">
            <span>Tarih</span>
            <span className="font-semibold text-slate-700">
              {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 py-2 border-b border-slate-200">
            <span>Alınan Ürün Sayısı</span>
            <span className="font-semibold text-slate-700">{itemCount} Kalem</span>
          </div>

          <div className="flex items-center justify-between pt-2.5">
            <span className="text-sm font-bold text-slate-900">Toplam Harcanan:</span>
            <span className="text-lg font-black text-emerald-600">
              {totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={handleGoToAnalytics}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition active:scale-98"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Harcama Grafiğinde Gör</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
          >
            Listeye Geri Dön
          </button>
        </div>
      </motion.div>
    </div>
  );
};
