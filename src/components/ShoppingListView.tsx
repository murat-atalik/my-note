import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { AppList, ListItem } from '../types';
import {
  ArrowLeft,
  Plus,
  Share2,
  Check,
  Trash2,
  Search,
  Filter,
  ShoppingBag,
  Sparkles,
  DollarSign,
  TrendingDown,
  UserCheck,
  CheckCircle2,
  RotateCcw,
  ListFilter,
  CheckCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AddItemDrawer } from './AddItemDrawer';
import { CheckoutSummaryModal } from './CheckoutSummaryModal';

interface ShoppingListViewProps {
  list: AppList;
  onBack: () => void;
  onOpenInvite: () => void;
}

export const ShoppingListView: React.FC<ShoppingListViewProps> = ({
  list,
  onBack,
  onOpenInvite,
}) => {
  const {
    items,
    categories,
    users,
    toggleItemComplete,
    deleteItem,
    updateItem,
    checkoutShoppingList,
    uncheckAllItems,
    clearCompletedItems,
  } = useAppStore();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNCOMPLETED' | 'COMPLETED'>('ALL');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [checkoutResult, setCheckoutResult] = useState<{ totalAmount: number; itemCount: number } | null>(null);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');

  const listItems = items.filter((i) => i.listId === list.id);

  // Filtered items
  const filteredItems = listItems.filter((i) => {
    const matchesCategory = !selectedFilterCategory || i.categoryId === selectedFilterCategory;
    const matchesSearch = !search || i.title.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const uncompletedItems = filteredItems.filter((i) => !i.isCompleted);
  const completedItems = filteredItems.filter((i) => i.isCompleted);

  // Calculations
  const totalEstimated = listItems.reduce(
    (acc, i) => acc + (i.price || 0) * (i.quantity || 1),
    0
  );
  const totalInCart = listItems
    .filter((i) => i.isCompleted)
    .reduce((acc, i) => acc + (i.price || 0) * (i.quantity || 1), 0);
  const totalRemaining = totalEstimated - totalInCart;
  const progress = listItems.length > 0
    ? Math.round((listItems.filter((i) => i.isCompleted).length / listItems.length) * 100)
    : 0;

  const handleCheckout = () => {
    if (completedItems.length === 0 && listItems.filter((i) => i.isCompleted).length === 0) {
      alert('Lütfen önce sepetinize aldığınız en az bir ürünü işaretleyin.');
      return;
    }
    const result = checkoutShoppingList(list.id);
    setCheckoutResult(result);
  };

  const handleStartEditPrice = (item: ListItem) => {
    setEditingPriceId(item.id);
    setTempPrice(item.price.toString());
  };

  const handleSavePrice = (id: string) => {
    const parsed = parseFloat(tempPrice);
    if (!isNaN(parsed) && parsed >= 0) {
      updateItem(id, { price: parsed });
    }
    setEditingPriceId(null);
  };

  const handleQuantityChange = (item: ListItem, delta: number) => {
    const newQty = Math.max(0.5, (item.quantity || 1) + delta);
    updateItem(item.id, { quantity: newQty });
  };

  const shoppingCategories = categories.filter((c) => c.type === 'SHOPPING');

  return (
    <div className="min-h-screen bg-slate-50/50 pb-36">
      {/* Top Sticky Header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onBack}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition"
              title="Listelere Dön"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h1 className="font-bold text-slate-900 text-base leading-tight truncate max-w-[200px] sm:max-w-md">
                  {list.title}
                </h1>
              </div>
              <p className="text-[11px] text-slate-500">
                {list.members.length} Üye • Akıllı Alışveriş & Bütçe
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenInvite}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold border border-emerald-200 transition"
              title="Kişi Davet Et"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Paylaş</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-3.5">
        {/* Dynamic Live Calculation Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-5 shadow-lg shadow-emerald-950/10 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-emerald-300">
                Canlı Sepet & Bütçe Hesabı
              </span>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-200">
              %{progress} Tamamlandı ({listItems.filter((i) => i.isCompleted).length}/{listItems.length})
            </span>
          </div>

          {/* 3 Metric Column */}
          <div className="grid grid-cols-3 gap-2 text-center py-2 bg-white/5 rounded-2xl border border-white/10">
            <div className="px-2">
              <p className="text-[10px] uppercase font-semibold text-slate-400">
                Tahmini Toplam
              </p>
              <p className="text-sm sm:text-base font-bold text-white mt-0.5">
                {totalEstimated.toLocaleString('tr-TR', { minimumFractionDigits: 1 })} ₺
              </p>
            </div>

            <div className="px-2 border-x border-white/10">
              <p className="text-[10px] uppercase font-semibold text-emerald-400">
                Sepetteki / Alınan
              </p>
              <p className="text-sm sm:text-base font-black text-emerald-400 mt-0.5">
                {totalInCart.toLocaleString('tr-TR', { minimumFractionDigits: 1 })} ₺
              </p>
            </div>

            <div className="px-2">
              <p className="text-[10px] uppercase font-semibold text-amber-300">
                Kalan Tutar
              </p>
              <p className="text-sm sm:text-base font-bold text-amber-200 mt-0.5">
                {totalRemaining.toLocaleString('tr-TR', { minimumFractionDigits: 1 })} ₺
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3.5">
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Search, Status Tabs & Category Filter Chips */}
        <div className="space-y-2.5 mb-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Listede ürün ara..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
            />
          </div>

          {/* Status Tabs: Tümü, Alınacaklar, Alınanlar */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition text-center ${
                statusFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Tümü ({listItems.length})
            </button>
            <button
              onClick={() => setStatusFilter('UNCOMPLETED')}
              className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition text-center ${
                statusFilter === 'UNCOMPLETED'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-amber-800 border border-slate-200 hover:bg-amber-50'
              }`}
            >
              Alınacaklar ({listItems.filter((i) => !i.isCompleted).length})
            </button>
            <button
              onClick={() => setStatusFilter('COMPLETED')}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition text-center ${
                statusFilter === 'COMPLETED'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-emerald-800 border border-slate-200 hover:bg-emerald-50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Alınanlar ({listItems.filter((i) => i.isCompleted).length})</span>
            </button>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedFilterCategory(null)}
              className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold transition ${
                selectedFilterCategory === null
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Tüm Kategoriler
            </button>
            {shoppingCategories.map((cat) => {
              const count = listItems.filter((i) => i.categoryId === cat.id).length;
              if (count === 0) return null;
              const isSelected = selectedFilterCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedFilterCategory(isSelected ? null : cat.id)}
                  className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition border ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span>{cat.name} ({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Empty State when list has zero items at all */}
        {listItems.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-300 p-6">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Bu liste henüz boş</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Alışveriş sepetinize ürün ekleyin, birim fiyatları belirleyin ve anlık bütçenizi kontrol edin.
            </p>
            <button
              onClick={() => setIsAddOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>İlk Ürünü Ekle</span>
            </button>
          </div>
        )}

        {/* All Items Completed Celebratory Banner */}
        {listItems.length > 0 && uncompletedItems.length === 0 && (
          <div className="mb-5 p-4 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 rounded-2xl">
                <CheckCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm leading-tight">
                  Tüm Ürünler Alındı! 🎉
                </h3>
                <p className="text-xs text-emerald-100 mt-0.5">
                  Toplam {totalInCart.toLocaleString('tr-TR')} ₺ sepet tamamlandı. Tamamlanan ürünler aşağıda listeleniyor.
                </p>
              </div>
            </div>
            <button
              onClick={() => uncheckAllItems(list.id)}
              className="whitespace-nowrap px-3 py-1.5 bg-white text-emerald-800 hover:bg-emerald-50 active:scale-95 text-xs font-bold rounded-xl shadow-xs transition"
              title="Tümünü sıfırlayıp bir sonraki alışveriş için hazırla"
            >
              Tekrar Alınacak Yap
            </button>
          </div>
        )}

        {/* Uncompleted Section */}
        {(statusFilter === 'ALL' || statusFilter === 'UNCOMPLETED') && uncompletedItems.length > 0 && (
          <div className="space-y-2 mb-6">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
              <span>Alınacak Ürünler ({uncompletedItems.length})</span>
              <span className="text-slate-500">
                {uncompletedItems
                  .reduce((a, b) => a + (b.price || 0) * (b.quantity || 1), 0)
                  .toLocaleString('tr-TR')}{' '}
                ₺
              </span>
            </div>

            {uncompletedItems.map((item) => {
              const cat = categories.find((c) => c.id === item.categoryId);
              const itemTotal = (item.price || 0) * (item.quantity || 1);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-3 shadow-xs hover:border-slate-300 transition flex items-center justify-between gap-3"
                >
                  {/* Left: Checkbox & Name */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => toggleItemComplete(item.id)}
                      className="w-6 h-6 rounded-lg border-2 border-slate-300 hover:border-emerald-500 flex items-center justify-center text-transparent hover:text-emerald-500 transition shrink-0"
                      title="Sepete Ekle / Alındı Olarak İşaretle"
                    >
                      <Check className="w-4 h-4" />
                    </button>

                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 text-sm truncate">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {cat && (
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                            style={{ backgroundColor: cat.bgLight, color: cat.color }}
                          >
                            {cat.name}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quantity Stepper & Price & Delete */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Quantity Stepper */}
                    <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                      <button
                        onClick={() => handleQuantityChange(item, -1)}
                        className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-white rounded text-xs font-bold"
                      >
                        -
                      </button>
                      <span className="px-1.5 text-xs font-bold text-slate-700 min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item, 1)}
                        className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-white rounded text-xs font-bold"
                      >
                        +
                      </button>
                    </div>

                    {/* Price Editor */}
                    {editingPriceId === item.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="any"
                          min="0"
                          autoFocus
                          value={tempPrice}
                          onChange={(e) => setTempPrice(e.target.value)}
                          onBlur={() => handleSavePrice(item.id)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSavePrice(item.id)}
                          className="w-16 px-1.5 py-1 text-xs border border-emerald-500 rounded-md font-bold text-right"
                        />
                        <span className="text-xs font-bold text-slate-500">₺</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartEditPrice(item)}
                        title="Fiyatı Düzenle"
                        className="text-right px-2 py-1 rounded-lg hover:bg-slate-100 transition"
                      >
                        <p className="font-black text-slate-900 text-xs">
                          {itemTotal > 0 ? `${itemTotal.toLocaleString('tr-TR')} ₺` : '0.00 ₺'}
                        </p>
                        {item.quantity > 1 && item.price > 0 && (
                          <p className="text-[10px] text-slate-400">
                            ({item.price} ₺/{item.unit})
                          </p>
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-1 text-slate-300 hover:text-rose-600 rounded transition"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Completed Section (Always visible and clearly managed) */}
        {(statusFilter === 'ALL' || statusFilter === 'COMPLETED') && completedItems.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-800 px-1 pt-1">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Sepetteki & Alınan Ürünler ({completedItems.length})</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-emerald-700">
                  {completedItems
                    .reduce((a, b) => a + (b.price || 0) * (b.quantity || 1), 0)
                    .toLocaleString('tr-TR')}{' '}
                  ₺
                </span>
                <button
                  onClick={() => uncheckAllItems(list.id)}
                  className="text-[11px] text-slate-600 hover:text-emerald-700 bg-white border border-slate-200 px-2 py-0.5 rounded-lg transition font-medium flex items-center gap-1"
                  title="Tümünü tekrar alınacak yap"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Tümünü Geri Al</span>
                </button>
              </div>
            </div>

            {completedItems.map((item) => {
              const cat = categories.find((c) => c.id === item.categoryId);
              const completedUser = users.find((u) => u.id === item.completedBy);
              const itemTotal = (item.price || 0) * (item.quantity || 1);

              return (
                <div
                  key={item.id}
                  className="bg-emerald-50/50 rounded-2xl border border-emerald-200 p-3 transition flex items-center justify-between gap-3 hover:bg-emerald-50/80"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => toggleItemComplete(item.id)}
                      className="w-6 h-6 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition shrink-0 shadow-2xs"
                      title="İşareti Kaldır (Alınacak Yap)"
                    >
                      <Check className="w-4 h-4" />
                    </button>

                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-700 text-sm line-through truncate">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {cat && (
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                            style={{ backgroundColor: cat.bgLight, color: cat.color }}
                          >
                            {cat.name}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500 font-medium">
                          {item.quantity} {item.unit}
                        </span>
                        {completedUser && (
                          <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-100 px-1.5 py-0.2 rounded">
                            {completedUser.name.split(' ')[0]} aldı
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <p className="font-black text-emerald-900 text-xs">
                      {itemTotal.toLocaleString('tr-TR')} ₺
                    </p>
                    <button
                      onClick={() => toggleItemComplete(item.id)}
                      className="p-1 text-emerald-600 hover:text-emerald-800 rounded transition"
                      title="Geri Al (Alınacaklara Ekle)"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-1 text-slate-300 hover:text-rose-600 rounded transition"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Bottom Sticky Action Bar */}
      <div className="fixed bottom-14 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2.5 px-4 shadow-xl">
        <div className="max-w-3xl mx-auto flex items-center gap-2.5">
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Ürün Ekle</span>
          </button>

          {/* Checkout button */}
          <button
            onClick={handleCheckout}
            disabled={totalInCart === 0}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold shadow-xs transition active:scale-98 ${
              totalInCart > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Alışverişi Bitir ({totalInCart.toLocaleString('tr-TR')} ₺)</span>
          </button>
        </div>
      </div>

      {/* Add Item Drawer */}
      <AnimatePresence>
        {isAddOpen && (
          <AddItemDrawer list={list} onClose={() => setIsAddOpen(false)} />
        )}
      </AnimatePresence>

      {/* Checkout Receipt Modal */}
      <AnimatePresence>
        {checkoutResult && (
          <CheckoutSummaryModal
            totalAmount={checkoutResult.totalAmount}
            itemCount={checkoutResult.itemCount}
            listTitle={list.title}
            onClose={() => setCheckoutResult(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
