import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Check,
  Tag,
  ShoppingCart,
  Apple,
  Beef,
  Sparkles,
  Heart,
  Laptop,
  Shirt,
  Package,
  Briefcase,
  Activity,
  Home,
  CreditCard,
  GraduationCap,
  Plane,
  CheckCircle2,
  Lightbulb,
  Users,
  BookOpen,
  Utensils,
  Key,
  StickyNote,
  Dumbbell,
  Coffee,
  Car,
  Scissors,
  Music,
  Film,
  Baby,
  Shield,
  Smile,
  Gift,
  Wrench,
  Camera,
  Layers,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAppStore } from '../store/useAppStore';
import { Category, ListType } from '../types';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';

export const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ShoppingCart,
  Apple,
  Beef,
  Sparkles,
  Heart,
  Laptop,
  Shirt,
  Package,
  Briefcase,
  Activity,
  Home,
  CreditCard,
  GraduationCap,
  Plane,
  CheckCircle2,
  Lightbulb,
  Users,
  BookOpen,
  Utensils,
  Key,
  StickyNote,
  Dumbbell,
  Coffee,
  Car,
  Scissors,
  Music,
  Film,
  Baby,
  Shield,
  Smile,
  Gift,
  Wrench,
  Camera,
  Layers,
};

const COLOR_PRESETS = [
  { color: '#10b981', bgLight: '#ecfdf5', label: 'Zümrüt' },
  { color: '#84cc16', bgLight: '#f7fee7', label: 'Yeşil' },
  { color: '#06b6d4', bgLight: '#ecfeff', label: 'Turkuaz' },
  { color: '#3b82f6', bgLight: '#eff6ff', label: 'Mavi' },
  { color: '#6366f1', bgLight: '#eef2ff', label: 'İndigo' },
  { color: '#8b5cf6', bgLight: '#f5f3ff', label: 'Mor' },
  { color: '#ec4899', bgLight: '#fdf2f8', label: 'Pembe' },
  { color: '#ef4444', bgLight: '#fef2f2', label: 'Kırmızı' },
  { color: '#f97316', bgLight: '#fff7ed', label: 'Turuncu' },
  { color: '#f59e0b', bgLight: '#fffbeb', label: 'Amber' },
  { color: '#64748b', bgLight: '#f8fafc', label: 'Gri' },
  { color: '#0f172a', bgLight: '#f1f5f9', label: 'Koyu' },
];

interface CategoryModalProps {
  initialCategory?: Category | null;
  defaultType?: ListType;
  onClose: () => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  initialCategory,
  defaultType = 'SHOPPING',
  onClose,
}) => {
  useLockBodyScroll();
  const { addCategory, updateCategory, deleteCategory } = useAppStore();

  const isEditing = !!initialCategory;

  const [name, setName] = useState(initialCategory?.name || '');
  const [type, setType] = useState<ListType>(initialCategory?.type || defaultType);
  const [selectedColor, setSelectedColor] = useState(
    initialCategory?.color || COLOR_PRESETS[0].color
  );
  const [selectedBgLight, setSelectedBgLight] = useState(
    initialCategory?.bgLight || COLOR_PRESETS[0].bgLight
  );
  const [selectedIcon, setSelectedIcon] = useState(
    initialCategory?.icon || (type === 'SHOPPING' ? 'ShoppingCart' : type === 'TODO' ? 'CheckCircle2' : 'StickyNote')
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (initialCategory) {
      setName(initialCategory.name);
      setType(initialCategory.type);
      setSelectedColor(initialCategory.color);
      setSelectedBgLight(initialCategory.bgLight);
      setSelectedIcon(initialCategory.icon);
    }
  }, [initialCategory]);

  const handleColorSelect = (preset: (typeof COLOR_PRESETS)[0]) => {
    setSelectedColor(preset.color);
    setSelectedBgLight(preset.bgLight);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isEditing && initialCategory) {
      updateCategory(initialCategory.id, {
        name: name.trim(),
        type,
        color: selectedColor,
        bgLight: selectedBgLight,
        icon: selectedIcon,
      });
    } else {
      const newCat: Category = {
        id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: name.trim(),
        type,
        color: selectedColor,
        bgLight: selectedBgLight,
        icon: selectedIcon,
      };
      addCategory(newCat);
    }

    onClose();
  };

  const handleDelete = () => {
    if (initialCategory) {
      deleteCategory(initialCategory.id);
      onClose();
    }
  };

  const PreviewIconComponent = ICON_MAP[selectedIcon] || Tag;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: selectedBgLight, color: selectedColor }}
            >
              <PreviewIconComponent className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isEditing ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle'}
              </h2>
              <p className="text-xs text-slate-500">
                {isEditing ? 'Kategori bilgilerini güncelleyin' : 'Listeleriniz için yeni kategori oluşturun'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Pill */}
        <div className="mb-5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Önizleme:</span>
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xs transition"
            style={{ backgroundColor: selectedBgLight, color: selectedColor }}
          >
            <PreviewIconComponent className="w-3.5 h-3.5" />
            <span>{name.trim() || 'Kategori Adı'}</span>
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Kategori Türü *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('SHOPPING')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold text-center border transition ${
                  type === 'SHOPPING'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                🛒 Alışveriş
              </button>
              <button
                type="button"
                onClick={() => setType('TODO')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold text-center border transition ${
                  type === 'TODO'
                    ? 'border-amber-600 bg-amber-50 text-amber-900 ring-1 ring-amber-500'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                📋 Görev
              </button>
              <button
                type="button"
                onClick={() => setType('NOTE')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold text-center border transition ${
                  type === 'NOTE'
                    ? 'border-purple-600 bg-purple-50 text-purple-900 ring-1 ring-purple-500'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                📝 Not & Fikir
              </button>
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kategori Adı *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Kırtasiye, İlaç & Eczane, Kitaplar..."
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
            />
          </div>

          {/* Color Palette */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Renk Seçimi
            </label>
            <div className="grid grid-cols-6 gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.color}
                  type="button"
                  onClick={() => handleColorSelect(preset)}
                  className={`h-9 rounded-xl flex items-center justify-center transition border ${
                    selectedColor === preset.color
                      ? 'border-slate-900 ring-2 ring-slate-900/30 scale-105'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: preset.color }}
                  title={preset.label}
                >
                  {selectedColor === preset.color && (
                    <Check className="w-4 h-4 text-white drop-shadow-xs" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              İkon Seçimi
            </label>
            <div className="grid grid-cols-6 gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
              {Object.keys(ICON_MAP).map((iconKey) => {
                const IconComp = ICON_MAP[iconKey];
                const isSelected = selectedIcon === iconKey;
                return (
                  <button
                    key={iconKey}
                    type="button"
                    onClick={() => setSelectedIcon(iconKey)}
                    className={`p-2 rounded-xl flex items-center justify-center transition ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs scale-105'
                        : 'text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                    }`}
                    title={iconKey}
                  >
                    <IconComp className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Delete Confirmation Box */}
          {showDeleteConfirm && isEditing && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl">
              <p className="text-xs font-bold text-rose-900 mb-2">
                Bu kategoriyi silmek istediğinizden emin misiniz?
              </p>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-lg transition"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3 py-1 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition"
                >
                  Evet, Sil
                </button>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            {isEditing ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Kategoriyi Sil</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-white rounded-xl shadow-xs transition"
              >
                {isEditing ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Kaydet</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Kategori Oluştur</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
