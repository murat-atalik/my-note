import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { ListTemplate, ListType, TemplateItem } from '../types';
import {
  X,
  Plus,
  Trash2,
  ShoppingCart,
  CheckSquare,
  StickyNote,
  Sparkles,
  Layers,
  Palette,
  Tag,
  Briefcase,
  Home,
  Utensils,
  Plane,
  Heart,
  Laptop,
  Check,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import { ICON_MAP } from './CategoryModal';

interface TemplateModalProps {
  initialTemplate?: ListTemplate | null;
  defaultType?: ListType;
  onClose: () => void;
}

const COLORS = [
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f97316', // orange
  '#f59e0b', // amber
  '#ef4444', // red
  '#64748b', // slate
];

const ICONS = [
  { name: 'ShoppingCart', label: 'Market' },
  { name: 'Sparkles', label: 'Temizlik' },
  { name: 'Utensils', label: 'Mutfak' },
  { name: 'Plane', label: 'Seyahat' },
  { name: 'Home', label: 'Ev' },
  { name: 'CheckSquare', label: 'Görev' },
  { name: 'Briefcase', label: 'İş' },
  { name: 'StickyNote', label: 'Not' },
  { name: 'Heart', label: 'Bakım' },
  { name: 'Laptop', label: 'Teknoloji' },
];

export const TemplateModal: React.FC<TemplateModalProps> = ({
  initialTemplate,
  defaultType = 'SHOPPING',
  onClose,
}) => {
  useLockBodyScroll();
  const { addTemplate, updateTemplate, categories } = useAppStore();

  const isEditing = !!initialTemplate;

  const [title, setTitle] = useState(initialTemplate?.title || '');
  const [description, setDescription] = useState(initialTemplate?.description || '');
  const [type, setType] = useState<ListType>(initialTemplate?.type || defaultType);
  const [color, setColor] = useState(initialTemplate?.color || '#10b981');
  const [icon, setIcon] = useState(
    initialTemplate?.icon || (type === 'SHOPPING' ? 'ShoppingCart' : type === 'TODO' ? 'CheckSquare' : 'StickyNote')
  );
  const [errorMessage, setErrorMessage] = useState('');

  // Items in template
  const [items, setItems] = useState<TemplateItem[]>(
    initialTemplate?.items && initialTemplate.items.length > 0
      ? initialTemplate.items
      : [
          {
            id: `ti-1`,
            title: '',
            quantity: 1,
            unit: 'adet',
            price: 0,
            priority: 'MEDIUM',
            categoryId: '',
          },
        ]
  );

  const typeCategories = categories.filter((c) => c.type === type);

  const handleAddItemRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `ti-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: '',
        quantity: 1,
        unit: 'adet',
        price: 0,
        priority: 'MEDIUM',
        categoryId: typeCategories[0]?.id || '',
      },
    ]);
  };

  const handleUpdateItem = (index: number, updates: Partial<TemplateItem>) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, ...updates } : item))
    );
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      setItems([{ id: `ti-1`, title: '', quantity: 1, unit: 'adet', price: 0, priority: 'MEDIUM', categoryId: '' }]);
      return;
    }
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim()) {
      setErrorMessage('Lütfen şablon için bir başlık girin.');
      return;
    }

    const validItems = items
      .filter((i) => i.title.trim().length > 0)
      .map((i) => ({
        ...i,
        title: i.title.trim(),
        categoryId: i.categoryId || typeCategories[0]?.id || '',
      }));

    if (validItems.length === 0) {
      setErrorMessage('Lütfen şablona en az 1 adet geçerli madde ekleyin.');
      return;
    }

    if (isEditing && initialTemplate) {
      updateTemplate(initialTemplate.id, {
        title: title.trim(),
        description: description.trim(),
        type,
        color,
        icon,
        items: validItems,
      });
    } else {
      const newTemplate: ListTemplate = {
        id: `tmpl-${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        type,
        color,
        icon,
        items: validItems,
        isCustom: true,
        createdAt: new Date().toISOString().split('T')[0],
      };
      addTemplate(newTemplate);
    }

    onClose();
  };

  const SelectedIconComp = ICON_MAP[icon] || ShoppingCart;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs shrink-0"
              style={{ backgroundColor: color }}
            >
              <SelectedIconComp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {isEditing ? 'Şablonu Düzenle' : 'Yeni Liste Şablonu Oluştur'}
              </h2>
              <p className="text-[11px] text-slate-500">
                Sık tekrarladığınız listeleri şablon olarak kaydedin
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto space-y-4 pt-4 pr-1 flex-1">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* List Type Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Şablon Türü
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setType('SHOPPING');
                  setIcon('ShoppingCart');
                  setColor('#10b981');
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition ${
                  type === 'SHOPPING'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <ShoppingCart className="w-4 h-4 mb-1 text-emerald-600" />
                <span className="text-xs">Alışveriş</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('TODO');
                  setIcon('CheckSquare');
                  setColor('#f59e0b');
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition ${
                  type === 'TODO'
                    ? 'border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-500/20 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <CheckSquare className="w-4 h-4 mb-1 text-amber-500" />
                <span className="text-xs">Yapılacaklar</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('NOTE');
                  setIcon('StickyNote');
                  setColor('#8b5cf6');
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition ${
                  type === 'NOTE'
                    ? 'border-purple-500 bg-purple-50 text-purple-800 ring-2 ring-purple-500/20 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <StickyNote className="w-4 h-4 mb-1 text-purple-600" />
                <span className="text-xs">Not & Fikir</span>
              </button>
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-2.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Şablon Başlığı *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Haftalık Organik Pazar, Kamp Malzemeleri..."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Açıklama (İsteğe bağlı)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Bu liste şablonunun amacı..."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Color & Icon Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tema Rengi
              </label>
              <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-6 h-6 rounded-full transition relative flex items-center justify-center hover:scale-105"
                    style={{ backgroundColor: c }}
                  >
                    {color === c && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Simge
              </label>
              <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200">
                {ICONS.map((ico) => {
                  const IcoComp = ICON_MAP[ico.name] || ShoppingCart;
                  return (
                    <button
                      key={ico.name}
                      type="button"
                      onClick={() => setIcon(ico.name)}
                      className={`p-1.5 rounded-lg transition ${
                        icon === ico.name
                          ? 'bg-white shadow-xs text-slate-900 ring-2 ring-slate-800'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
                      }`}
                      title={ico.label}
                    >
                      <IcoComp className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Pre-defined Items List */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  <span>Şablon Maddeleri ({items.filter((i) => i.title.trim()).length})</span>
                </label>
                <p className="text-[11px] text-slate-400">
                  Bu şablon kullanıldığında otomatik eklenecek ürün/maddeler
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddItemRow}
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition border border-emerald-200 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Madde Ekle</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400 w-4 text-center">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleUpdateItem(idx, { title: e.target.value })}
                      placeholder={`Madde / Ürün adı...`}
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0"
                      title="Maddeyi Çıkar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 pl-6 flex-wrap">
                    {type === 'SHOPPING' && (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0.1"
                          step="any"
                          value={item.quantity || 1}
                          onChange={(e) =>
                            handleUpdateItem(idx, { quantity: parseFloat(e.target.value) || 1 })
                          }
                          className="w-16 px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg text-center font-semibold"
                          title="Miktar"
                        />
                        <select
                          value={item.unit || 'adet'}
                          onChange={(e) => handleUpdateItem(idx, { unit: e.target.value })}
                          className="px-2 py-1 text-[11px] bg-white border border-slate-200 rounded-lg font-medium"
                        >
                          <option value="adet">adet</option>
                          <option value="kg">kg</option>
                          <option value="paket">paket</option>
                          <option value="lt">lt</option>
                          <option value="demet">demet</option>
                          <option value="gram">gram</option>
                          <option value="koli">koli</option>
                        </select>
                      </div>
                    )}

                    {type === 'TODO' && (
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-semibold text-slate-500">Öncelik:</span>
                        <select
                          value={item.priority || 'MEDIUM'}
                          onChange={(e) => handleUpdateItem(idx, { priority: e.target.value as any })}
                          className="px-2 py-1 text-[11px] bg-white border border-slate-200 rounded-lg font-semibold"
                        >
                          <option value="LOW">Düşük</option>
                          <option value="MEDIUM">Orta</option>
                          <option value="HIGH">Yüksek</option>
                        </select>
                      </div>
                    )}

                    <div className="flex items-center gap-1 flex-1 min-w-[130px]">
                      <span className="text-[10px] font-semibold text-slate-500">Kategori:</span>
                      <select
                        value={item.categoryId || ''}
                        onChange={(e) => handleUpdateItem(idx, { categoryId: e.target.value })}
                        className="flex-1 px-2 py-1 text-[11px] bg-white border border-slate-200 rounded-lg text-slate-700 font-medium truncate"
                      >
                        <option value="">Kategori Seç (Opsiyonel)</option>
                        {typeCategories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              {isEditing ? 'Şablonu Güncelle' : 'Şablonu Kaydet'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
