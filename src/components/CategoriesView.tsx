import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Category, ListType } from '../types';
import { CategoryModal, ICON_MAP } from './CategoryModal';
import {
  ArrowLeft,
  Plus,
  Search,
  Tag,
  Edit2,
  Trash2,
  ShoppingCart,
  CheckSquare,
  StickyNote,
  SlidersHorizontal,
  Package,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CategoriesViewProps {
  onBack: () => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({ onBack }) => {
  const { categories, deleteCategory, items } = useAppStore();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<'ALL' | ListType>('ALL');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryModalDefaultType, setCategoryModalDefaultType] = useState<ListType>('SHOPPING');

  // Filtered categories
  const filteredCategories = categories.filter((cat) => {
    const matchesType = selectedType === 'ALL' || cat.type === selectedType;
    const matchesSearch =
      !search ||
      cat.name.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const shoppingCount = categories.filter((c) => c.type === 'SHOPPING').length;
  const todoCount = categories.filter((c) => c.type === 'TODO').length;
  const noteCount = categories.filter((c) => c.type === 'NOTE').length;

  const handleOpenAddCategory = (type: 'ALL' | ListType = 'SHOPPING') => {
    setEditingCategory(null);
    setCategoryModalDefaultType(type === 'ALL' ? 'SHOPPING' : type);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryModalDefaultType(cat.type);
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = (cat: Category, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`"${cat.name}" kategorisini silmek istediğinize emin misiniz?`)) {
      deleteCategory(cat.id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-28">
      {/* Top Sticky Header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition active:scale-95 flex items-center gap-1 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Ayarlar</span>
            </button>
            <div className="h-4 w-px bg-slate-200" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-900 text-base leading-tight">
                  Kategori Yönetimi
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700">
                  {categories.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Alışveriş, Görev ve Not kategorilerini özelleştirin
              </p>
            </div>
          </div>

          <button
            onClick={() => handleOpenAddCategory(selectedType === 'ALL' ? 'SHOPPING' : selectedType)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Yeni Kategori</span>
            <span className="sm:hidden">Ekle</span>
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-4 space-y-4">
        {/* Search & Filter Tabs */}
        <div className="space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Kategorilerde ara..."
              className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition shadow-2xs"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedType('ALL')}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedType === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Tümü ({categories.length})
            </button>
            <button
              onClick={() => setSelectedType('SHOPPING')}
              className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                selectedType === 'SHOPPING'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-emerald-800 border-slate-200 hover:bg-emerald-50'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Alışveriş ({shoppingCount})</span>
            </button>
            <button
              onClick={() => setSelectedType('TODO')}
              className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                selectedType === 'TODO'
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-white text-amber-800 border-slate-200 hover:bg-amber-50'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Yapılacaklar ({todoCount})</span>
            </button>
            <button
              onClick={() => setSelectedType('NOTE')}
              className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                selectedType === 'NOTE'
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-purple-800 border-slate-200 hover:bg-purple-50'
              }`}
            >
              <StickyNote className="w-3.5 h-3.5" />
              <span>Notlar ({noteCount})</span>
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredCategories.map((cat) => {
              const IconComp = ICON_MAP[cat.icon] || Tag;
              const usedItemsCount = items.filter((i) => i.categoryId === cat.id).length;

              return (
                <motion.div
                  key={cat.id}
                  layout
                  onClick={() => handleOpenEditCategory(cat)}
                  className="group bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-slate-300 transition cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition group-hover:scale-105"
                      style={{ backgroundColor: cat.bgLight || '#f1f5f9', color: cat.color }}
                    >
                      <IconComp className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                          {cat.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                          style={{ backgroundColor: cat.bgLight, color: cat.color }}
                        >
                          {cat.type === 'SHOPPING' && 'Alışveriş'}
                          {cat.type === 'TODO' && 'Yapılacaklar'}
                          {cat.type === 'NOTE' && 'Not & Fikir'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {usedItemsCount} ürün/görev
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditCategory(cat);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                      title="Düzenle"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteCategory(cat, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-300 p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 mx-auto flex items-center justify-center">
              <Tag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Kategori Bulunamadı</p>
              <p className="text-xs text-slate-500 mt-1">
                Arama kriterinize uygun kategori yok veya henüz eklenmedi.
              </p>
            </div>
            <button
              onClick={() => handleOpenAddCategory(selectedType === 'ALL' ? 'SHOPPING' : selectedType)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Kategori Oluştur</span>
            </button>
          </div>
        )}
      </div>

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <CategoryModal
          initialCategory={editingCategory}
          defaultType={categoryModalDefaultType}
          onClose={() => {
            setIsCategoryModalOpen(false);
            setEditingCategory(null);
          }}
        />
      )}
    </div>
  );
};
