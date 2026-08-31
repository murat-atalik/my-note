import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { ListTemplate, ListType } from '../types';
import { TemplateModal } from './TemplateModal';
import { ICON_MAP } from './CategoryModal';
import {
  ArrowLeft,
  Plus,
  Search,
  ShoppingCart,
  CheckSquare,
  StickyNote,
  Sparkles,
  Layers,
  Edit2,
  Trash2,
  CheckCircle2,
  ArrowRight,
  Zap,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TemplatesViewProps {
  onBack: () => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({ onBack }) => {
  const { templates, deleteTemplate, createListFromTemplate, categories } = useAppStore();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<'ALL' | ListType>('ALL');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ListTemplate | null>(null);
  const [templateModalDefaultType, setTemplateModalDefaultType] = useState<ListType>('SHOPPING');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const filteredTemplates = templates.filter((tmpl) => {
    const matchesType = selectedType === 'ALL' || tmpl.type === selectedType;
    const matchesSearch =
      !search ||
      tmpl.title.toLowerCase().includes(search.toLowerCase()) ||
      (tmpl.description && tmpl.description.toLowerCase().includes(search.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const shoppingCount = templates.filter((t) => t.type === 'SHOPPING').length;
  const todoCount = templates.filter((t) => t.type === 'TODO').length;
  const noteCount = templates.filter((t) => t.type === 'NOTE').length;

  const handleOpenAddTemplate = (type: 'ALL' | ListType = 'SHOPPING') => {
    setEditingTemplate(null);
    setTemplateModalDefaultType(type === 'ALL' ? 'SHOPPING' : type);
    setIsTemplateModalOpen(true);
  };

  const handleOpenEditTemplate = (tmpl: ListTemplate) => {
    setEditingTemplate(tmpl);
    setTemplateModalDefaultType(tmpl.type);
    setIsTemplateModalOpen(true);
  };

  const handleDeleteTemplate = (tmpl: ListTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`"${tmpl.title}" şablonunu silmek istediğinize emin misiniz?`)) {
      deleteTemplate(tmpl.id);
    }
  };

  const handleUseTemplate = (tmpl: ListTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    const newListId = createListFromTemplate(tmpl.id);
    if (newListId) {
      setSuccessToast(`"${tmpl.title}" şablonu ile yeni liste oluşturuldu!`);
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
                  Hazır Liste Şablonları
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  {templates.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Sık kullandığınız listeleri tek dokunuşla başlatın veya yeni şablon oluşturun
              </p>
            </div>
          </div>

          <button
            onClick={() => handleOpenAddTemplate(selectedType === 'ALL' ? 'SHOPPING' : selectedType)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Yeni Şablon</span>
            <span className="sm:hidden">Ekle</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-3xl mx-auto px-4 pt-3"
          >
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-900 text-xs font-semibold shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successToast}</span>
              </div>
              <button
                onClick={() => setSuccessToast(null)}
                className="text-emerald-700 hover:text-emerald-900 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-3xl mx-auto px-4 pt-4 space-y-4">
        {/* Search & Filter Tabs */}
        <div className="space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Şablon başlığı veya maddelerde ara..."
              className="w-full pl-9 pr-8 py-2.5 text-xs bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition shadow-2xs"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedType('ALL')}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedType === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Tümü ({templates.length})
            </button>
            <button
              onClick={() => setSelectedType('SHOPPING')}
              className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                selectedType === 'SHOPPING'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
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
                  ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
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
                  ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                  : 'bg-white text-purple-800 border-slate-200 hover:bg-purple-50'
              }`}
            >
              <StickyNote className="w-3.5 h-3.5" />
              <span>Notlar ({noteCount})</span>
            </button>
          </div>
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((tmpl) => {
              const IconComp = ICON_MAP[tmpl.icon] || ShoppingCart;
              return (
                <motion.div
                  key={tmpl.id}
                  layout
                  className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-sm hover:border-slate-300 transition flex flex-col justify-between"
                >
                  <div>
                    {/* Header Top Bar */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs"
                          style={{ backgroundColor: tmpl.color }}
                        >
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-900 text-sm leading-snug truncate">
                            {tmpl.title}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                              style={{
                                backgroundColor:
                                  tmpl.type === 'SHOPPING'
                                    ? '#ecfdf5'
                                    : tmpl.type === 'TODO'
                                    ? '#fffbeb'
                                    : '#f5f3ff',
                                color:
                                  tmpl.type === 'SHOPPING'
                                    ? '#065f46'
                                    : tmpl.type === 'TODO'
                                    ? '#92400e'
                                    : '#5b21b6',
                              }}
                            >
                              {tmpl.type === 'SHOPPING' && 'Alışveriş'}
                              {tmpl.type === 'TODO' && 'Yapılacaklar'}
                              {tmpl.type === 'NOTE' && 'Not & Fikir'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                              <Layers className="w-3 h-3 text-slate-400" />
                              {tmpl.items.length} Madde
                            </span>
                            {tmpl.isCustom && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                Özel Şablon
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Edit & Delete Action Buttons */}
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEditTemplate(tmpl)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                          title="Şablonu Düzenle"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteTemplate(tmpl, e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Şablonu Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    {tmpl.description && (
                      <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">
                        {tmpl.description}
                      </p>
                    )}

                    {/* Items preview box */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 mb-4 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          İçerik Önizleme
                        </p>
                        <span className="text-[10px] text-slate-400 font-medium">
                          Toplam {tmpl.items.length} madde
                        </span>
                      </div>
                      <div className="space-y-1.5 pt-0.5">
                        {tmpl.items.slice(0, 4).map((item, idx) => (
                          <div
                            key={item.id || idx}
                            className="flex items-center justify-between text-xs text-slate-700 font-medium gap-2"
                          >
                            <span className="truncate flex items-center gap-1.5 min-w-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                              <span className="truncate">{item.title}</span>
                            </span>
                            {item.quantity && (
                              <span className="text-[11px] text-slate-500 font-semibold shrink-0 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                {item.quantity} {item.unit}
                              </span>
                            )}
                            {item.priority && (
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                                  item.priority === 'HIGH'
                                    ? 'bg-rose-50 text-rose-700'
                                    : item.priority === 'MEDIUM'
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {item.priority === 'HIGH' ? 'Yüksek' : item.priority === 'MEDIUM' ? 'Orta' : 'Düşük'}
                              </span>
                            )}
                          </div>
                        ))}
                        {tmpl.items.length > 4 && (
                          <p className="text-[11px] text-slate-500 font-medium pt-1">
                            +{tmpl.items.length - 4} diğer madde daha...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 1-Click Launch Button */}
                  <button
                    type="button"
                    onClick={(e) => handleUseTemplate(tmpl, e)}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-black active:scale-[0.98] text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-2 group"
                  >
                    <Zap className="w-4 h-4 text-amber-400 group-hover:scale-110 transition" />
                    <span>Bu Şablonla Liste Oluştur</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-0.5 transition" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-300 p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Şablon Bulunamadı</p>
              <p className="text-xs text-slate-500 mt-1">
                Arama kriterinize uygun şablon bulunamadı. Hemen yeni bir şablon oluşturabilirsiniz.
              </p>
            </div>
            <button
              onClick={() => handleOpenAddTemplate(selectedType === 'ALL' ? 'SHOPPING' : selectedType)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Şablon Oluştur</span>
            </button>
          </div>
        )}
      </div>

      {/* Template Modal */}
      {isTemplateModalOpen && (
        <TemplateModal
          initialTemplate={editingTemplate}
          defaultType={templateModalDefaultType}
          onClose={() => {
            setIsTemplateModalOpen(false);
            setEditingTemplate(null);
          }}
        />
      )}
    </div>
  );
};
