import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { AppList, Category } from '../types';
import { X, Plus, Sparkles, Tag } from 'lucide-react';
import { motion } from 'motion/react';
import { CategoryModal } from './CategoryModal';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';

interface AddItemDrawerProps {
  list: AppList;
  onClose: () => void;
}

const COMMON_UNITS = ['adet', 'kg', 'paket', 'lt', 'demet', 'kutu', 'gr'];

export const AddItemDrawer: React.FC<AddItemDrawerProps> = ({ list, onClose }) => {
  useLockBodyScroll();
  const { categories, addItem } = useAppStore();

  const typeCategories = categories.filter((c) => c.type === list.type);
  const displayedCategories = typeCategories.length > 0 ? typeCategories : categories;

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('adet');
  const [categoryId, setCategoryId] = useState(displayedCategories[0]?.id || 'cat-market');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Quick suggestions based on list type
  const shoppingSuggestions = [
    { title: 'Süt 1L', price: '42.50', categoryId: 'cat-market', unit: 'lt' },
    { title: 'Yumurta (15li)', price: '85.00', categoryId: 'cat-market', unit: 'paket' },
    { title: 'Ekmek', price: '15.00', categoryId: 'cat-market', unit: 'adet' },
    { title: 'Domates', price: '35.00', categoryId: 'cat-manav', unit: 'kg' },
    { title: 'Dana Kıyma', price: '460.00', categoryId: 'cat-sarkuteri', unit: 'kg' },
    { title: 'Deterjan', price: '190.00', categoryId: 'cat-temizlik', unit: 'paket' },
  ];

  const todoSuggestions = [
    { title: 'Fatura Ödemesi', priority: 'HIGH' as const, categoryId: 'cat-todo-finans' },
    { title: 'Haftalık İş Raporu', priority: 'HIGH' as const, categoryId: 'cat-todo-is' },
    { title: 'Ev Temizliği & Düzen', priority: 'MEDIUM' as const, categoryId: 'cat-todo-ev' },
    { title: 'Doktor / Diş Randevusu', priority: 'HIGH' as const, categoryId: 'cat-todo-saglik' },
    { title: 'Kitap Oku (20 sayfa)', priority: 'LOW' as const, categoryId: 'cat-todo-egitim' },
  ];

  const noteSuggestions = [
    { title: 'Yeni Proje / Uygulama Fikri', categoryId: 'cat-note-fikir' },
    { title: 'Haftalık Değerlendirme Notu', categoryId: 'cat-note-toplanti' },
    { title: 'Nefis Yemek Tarifi', categoryId: 'cat-note-tarif' },
    { title: 'Önemli Hesap & Şifre Notu', categoryId: 'cat-note-onemli' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (list.type === 'SHOPPING') {
      addItem({
        listId: list.id,
        title: title.trim(),
        isCompleted: false,
        price: parseFloat(price) || 0,
        quantity: parseFloat(quantity) || 1,
        unit: unit,
        categoryId: categoryId,
      });
    } else if (list.type === 'TODO') {
      addItem({
        listId: list.id,
        title: title.trim(),
        isCompleted: false,
        price: 0,
        quantity: 1,
        unit: 'adet',
        categoryId: categoryId,
        priority: priority,
        dueDate: dueDate || undefined,
      });
    } else {
      // NOTE
      addItem({
        listId: list.id,
        title: title.trim(),
        content: content.trim(),
        isCompleted: false,
        price: 0,
        quantity: 1,
        unit: 'adet',
        categoryId: categoryId,
        isPinned: isPinned,
      });
    }

    onClose();
  };

  const applyShoppingSuggestion = (sug: typeof shoppingSuggestions[0]) => {
    setTitle(sug.title);
    setPrice(sug.price);
    setCategoryId(sug.categoryId);
    setUnit(sug.unit);
  };

  const applyTodoSuggestion = (sug: typeof todoSuggestions[0]) => {
    setTitle(sug.title);
    setPriority(sug.priority);
    setCategoryId(sug.categoryId);
  };

  const applyNoteSuggestion = (sug: typeof noteSuggestions[0]) => {
    setTitle(sug.title);
    setCategoryId(sug.categoryId);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4"
    >
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">
                {list.type === 'SHOPPING' && 'Yeni Ürün Ekle'}
                {list.type === 'TODO' && 'Yeni Görev Ekle'}
                {list.type === 'NOTE' && 'Yeni Not Ekle'}
              </h2>
              <p className="text-xs text-slate-500">
                {list.title} listesine eklenecek
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestions */}
        <div className="mb-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Hızlı Şablon & Öneriler
          </p>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
            {list.type === 'SHOPPING' &&
              shoppingSuggestions.map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyShoppingSuggestion(sug)}
                  className="whitespace-nowrap px-2.5 py-1 text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-slate-200 rounded-lg text-slate-700 transition active:scale-95"
                >
                  {sug.title} ({sug.price}₺)
                </button>
              ))}
            {list.type === 'TODO' &&
              todoSuggestions.map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyTodoSuggestion(sug)}
                  className="whitespace-nowrap px-2.5 py-1 text-xs bg-slate-100 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200 border border-slate-200 rounded-lg text-slate-700 transition active:scale-95"
                >
                  {sug.title}
                </button>
              ))}
            {list.type === 'NOTE' &&
              noteSuggestions.map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyNoteSuggestion(sug)}
                  className="whitespace-nowrap px-2.5 py-1 text-xs bg-slate-100 hover:bg-purple-50 hover:text-purple-800 hover:border-purple-200 border border-slate-200 rounded-lg text-slate-700 transition active:scale-95"
                >
                  {sug.title}
                </button>
              ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {list.type === 'NOTE' ? 'Not Başlığı' : list.type === 'TODO' ? 'Görev Başlığı' : 'Ürün Adı'} *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                list.type === 'SHOPPING'
                  ? 'Örn: Süt, Dana Kıyma, Bulaşık Tableti'
                  : list.type === 'TODO'
                  ? 'Örn: Faturayı öde, Randevu al'
                  : 'Not başlığı...'
              }
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
            />
          </div>

          {/* Shopping Specific Fields: Price, Quantity, Unit */}
          {list.type === 'SHOPPING' && (
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Birim Fiyat (₺)
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Miktar
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.001"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="1"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Birim
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-2.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                >
                  {COMMON_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Note Specific Content */}
          {list.type === 'NOTE' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Not Detayı & İçerik
              </label>
              <textarea
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Not içeriğini buraya yazın..."
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition resize-none"
              />
            </div>
          )}

          {/* To-Do Specific Fields: Priority & Due Date */}
          {list.type === 'TODO' && (
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Öncelik
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition"
                >
                  <option value="LOW">🟢 Düşük Öncelik</option>
                  <option value="MEDIUM">🟡 Orta Öncelik</option>
                  <option value="HIGH">🔴 Yüksek Öncelik</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Son Tarih
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition"
                />
              </div>
            </div>
          )}

          {/* Category Selector (Filtered for current list type) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                {list.type === 'SHOPPING' && 'Alışveriş Kategorisi'}
                {list.type === 'TODO' && 'Görev Kategorisi'}
                {list.type === 'NOTE' && 'Not Kategorisi'}
              </label>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(true)}
                className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800 hover:underline flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" />
                <span>Yeni Kategori</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-40 overflow-y-auto p-1.5 bg-slate-50 rounded-2xl border border-slate-200">
              {displayedCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium text-left transition border ${
                    categoryId === cat.id
                      ? 'border-emerald-600 bg-white text-slate-900 shadow-xs font-bold ring-1 ring-emerald-500/30'
                      : 'border-transparent text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="truncate">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pin note toggle */}
          {list.type === 'NOTE' && (
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
              />
              Bu notu en üste sabitle (Pin)
            </label>
          )}

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl shadow-xs transition"
            >
              {list.type === 'SHOPPING' ? 'Sepete Ekle' : list.type === 'TODO' ? 'Görevi Kaydet' : 'Notu Kaydet'}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Quick Category Modal */}
      {isCategoryModalOpen && (
        <CategoryModal
          defaultType={list.type}
          onClose={() => setIsCategoryModalOpen(false)}
        />
      )}
    </div>
  );
};
