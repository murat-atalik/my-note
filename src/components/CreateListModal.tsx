import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { ListType } from '../types';
import { X, ShoppingCart, CheckSquare, StickyNote, Sparkles, ArrowRight, Search, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import { ICON_MAP } from './CategoryModal';
import {
  createListSchema,
  handleZodValidation,
  FieldErrors,
  BilingualError,
} from '../lib/validations';

interface CreateListModalProps {
  onClose: () => void;
}

const LIST_TYPES: { type: ListType; title: string; desc: string; icon: React.ReactNode; color: string }[] = [
  {
    type: 'SHOPPING',
    title: 'Akıllı Alışveriş & Bütçe',
    desc: 'Birim fiyatlar, canlı sepet toplamı ve harcama grafiği takibi',
    icon: <ShoppingCart className="w-5 h-5 text-emerald-600" />,
    color: '#10b981',
  },
  {
    type: 'TODO',
    title: 'Yapılacaklar & Görevler',
    desc: 'Öncelik etiketleri, son tarihler ve görev tamamlama',
    icon: <CheckSquare className="w-5 h-5 text-amber-600" />,
    color: '#f59e0b',
  },
  {
    type: 'NOTE',
    title: 'Notlar & Fikirler',
    desc: 'Hızlı karalamalar, alışveriş ipuçları ve serbest metinler',
    icon: <StickyNote className="w-5 h-5 text-purple-600" />,
    color: '#8b5cf6',
  },
];

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#ef4444'];

export const CreateListModal: React.FC<CreateListModalProps> = ({ onClose }) => {
  useLockBodyScroll();
  const { createList, setSelectedListId, templates, createListFromTemplate } = useAppStore();

  const [tab, setTab] = useState<'scratch' | 'template'>('scratch');
  const [templateSearch, setTemplateSearch] = useState('');
  const [type, setType] = useState<ListType>('SHOPPING');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState<BilingualError | null>(null);

  const filteredTemplates = templates.filter(
    (t) =>
      !templateSearch ||
      t.title.toLowerCase().includes(templateSearch.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(templateSearch.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGlobalError(null);

    const iconMap = {
      SHOPPING: 'ShoppingCart',
      TODO: 'CheckSquare',
      NOTE: 'StickyNote',
    };

    // Validate with Zod
    const val = handleZodValidation(createListSchema, {
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      color: selectedColor,
      icon: iconMap[type],
    });

    if (!val.success) {
      if (val.fieldErrors) setFieldErrors(val.fieldErrors);
      if (val.error) setGlobalError(val.error);
      return;
    }

    const newId = createList({
      title: title.trim(),
      description: description.trim(),
      type: type,
      color: selectedColor,
      icon: iconMap[type],
    });

    setSelectedListId(newId);
    onClose();
  };

  const handleSelectTemplate = (templateId: string) => {
    const newId = createListFromTemplate(templateId);
    if (newId) {
      onClose();
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="font-extrabold text-slate-900 text-lg mb-1">
          Yeni Liste Oluştur <span className="text-xs font-normal text-slate-400">/ Create New List</span>
        </h2>
        <p className="text-xs text-slate-500 mb-3.5">
          Sıfırdan özel bir liste oluşturun veya hazır şablonlardan birini seçin
        </p>

        {/* Global Error */}
        {globalError && (
          <div className="p-3 mb-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p>{globalError.tr}</p>
              <p className="text-[10px] text-rose-500 italic font-normal">{globalError.en}</p>
            </div>
          </div>
        )}

        {/* Tab switcher */}
        <div className="flex p-1 bg-slate-100 rounded-2xl mb-4">
          <button
            type="button"
            onClick={() => setTab('scratch')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              tab === 'scratch'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sıfırdan Liste / Custom
          </button>
          <button
            type="button"
            onClick={() => setTab('template')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
              tab === 'template'
                ? 'bg-white text-emerald-800 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Hazır Şablonlar / Templates ({templates.length})</span>
          </button>
        </div>

        {tab === 'template' ? (
          <div className="space-y-3">
            {/* Search within templates */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                placeholder="Şablonlarda ara..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {filteredTemplates.map((tmpl) => {
                const IconComp = ICON_MAP[tmpl.icon] || ShoppingCart;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => handleSelectTemplate(tmpl.id)}
                    className="group flex items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-emerald-50/40 hover:border-emerald-300 transition cursor-pointer active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                        style={{ backgroundColor: tmpl.color }}
                      >
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-slate-900 text-xs truncate">
                            {tmpl.title}
                          </h4>
                          {tmpl.isCustom && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                              Özel
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {tmpl.description || `${tmpl.items.length} hazır madde`}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-semibold text-slate-400">
                            {tmpl.items.length} madde
                          </span>
                          <span className="text-[10px] text-slate-300">•</span>
                          <span className="text-[10px] font-semibold text-slate-500">
                            {tmpl.type === 'SHOPPING' ? 'Alışveriş' : tmpl.type === 'TODO' ? 'Yapılacaklar' : 'Not'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold group-hover:bg-emerald-600 transition shadow-2xs"
                    >
                      <span>Kullan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}

              {filteredTemplates.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs font-medium">
                  Arama kriterinize uygun şablon bulunamadı.
                </div>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Liste Türü <span className="text-slate-400 font-normal">/ List Type</span>
              </label>
              <div className="space-y-1.5">
                {LIST_TYPES.map((lt) => (
                  <button
                    key={lt.type}
                    type="button"
                    onClick={() => {
                      setType(lt.type);
                      setSelectedColor(lt.color);
                    }}
                    className={`w-full flex items-start gap-3 p-3 rounded-2xl border text-left transition ${
                      type === lt.type
                        ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="p-2 bg-white rounded-xl shadow-xs shrink-0">
                      {lt.icon}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{lt.title}</p>
                      <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                        {lt.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Liste Başlığı <span className="text-slate-400 font-normal">/ Title</span> *
              </label>
              <input
                type="text"
                autoFocus
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (fieldErrors.title) setFieldErrors((p) => ({ ...p, title: undefined as any }));
                }}
                placeholder={
                  type === 'SHOPPING'
                    ? 'Örn: Haftalık Pazar & Market Listesi'
                    : type === 'TODO'
                    ? 'Örn: Eylül Ayı Ödemeleri ve Görevler'
                    : 'Örn: Yeni Proje Notları'
                }
                className={`w-full px-3.5 py-2.5 text-xs bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition ${
                  fieldErrors.title
                    ? 'border-rose-400 focus:ring-rose-400/20 bg-rose-50/30'
                    : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-600'
                }`}
              />
              {fieldErrors.title && (
                <div className="mt-1.5 px-2 py-1 bg-rose-50 border border-rose-100 rounded-lg text-[11px]">
                  <p className="font-semibold text-rose-700">{fieldErrors.title.tr}</p>
                  <p className="text-[10px] text-rose-500 italic">{fieldErrors.title.en}</p>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Açıklama / Not <span className="text-slate-400 font-normal">/ Description (Optional)</span>
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Örn: Hafta sonu alınacaklar..."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
              />
            </div>

            {/* Color theme selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tema Rengi <span className="text-slate-400 font-normal">/ Color Theme</span>
              </label>
              <div className="flex items-center gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      selectedColor === c ? 'scale-115 ring-2 ring-offset-2 ring-slate-900' : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                İptal / Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl shadow-xs transition"
              >
                Listeyi Oluştur / Create
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
