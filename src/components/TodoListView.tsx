import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { AppList } from '../types';
import { ArrowLeft, Plus, Share2, Check, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { AddItemDrawer } from './AddItemDrawer';

interface TodoListViewProps {
  list: AppList;
  onBack: () => void;
  onOpenInvite: () => void;
}

export const TodoListView: React.FC<TodoListViewProps> = ({ list, onBack, onOpenInvite }) => {
  const { items, toggleItemComplete, deleteItem, categories } = useAppStore();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const listItems = items.filter((i) => i.listId === list.id);
  const uncompleted = listItems.filter((i) => !i.isCompleted);
  const completed = listItems.filter((i) => i.isCompleted);

  const getPriorityBadge = (p?: 'LOW' | 'MEDIUM' | 'HIGH') => {
    switch (p) {
      case 'HIGH':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700">Yüksek</span>;
      case 'MEDIUM':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-700">Orta</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">Düşük</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-28">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onBack}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-bold text-slate-900 text-base leading-tight">
                {list.title}
              </h1>
              <p className="text-[11px] text-slate-500">
                {completed.length} / {listItems.length} Görev Tamamlandı
              </p>
            </div>
          </div>

          <button
            onClick={onOpenInvite}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-semibold border border-amber-200 transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Paylaş</span>
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-4 space-y-4">
        {/* Uncompleted Tasks */}
        <div className="space-y-2">
          {uncompleted.map((item) => {
            const cat = categories.find((c) => c.id === item.categoryId);
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => toggleItemComplete(item.id)}
                    className="w-5 h-5 rounded-md border-2 border-slate-300 hover:border-amber-500 flex items-center justify-center text-transparent hover:text-amber-500 transition shrink-0"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 text-sm">{item.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getPriorityBadge(item.priority)}
                      {item.dueDate && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                          <Calendar className="w-3 h-3" />
                          {item.dueDate}
                        </span>
                      )}
                      {cat && (
                        <span className="text-[10px] text-slate-500">
                          • {cat.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="p-1 text-slate-300 hover:text-rose-600 rounded transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Completed Tasks */}
        {completed.length > 0 && (
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold text-slate-400 px-1">
              Tamamlanan Görevler ({completed.length})
            </h3>
            {completed.map((item) => (
              <div
                key={item.id}
                className="bg-slate-100/70 rounded-2xl border border-slate-200 p-3 flex items-center justify-between gap-3 opacity-75"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => toggleItemComplete(item.id)}
                    className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center transition shrink-0"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <p className="font-medium text-slate-600 text-sm line-through truncate">
                    {item.title}
                  </p>
                </div>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="p-1 text-slate-300 hover:text-rose-600 rounded transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Add Task Button */}
      <div className="fixed bottom-16 right-4 z-30">
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 py-3 px-5 rounded-full bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs shadow-lg shadow-amber-500/25 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Görev Ekle</span>
        </button>
      </div>

      <AnimatePresence>
        {isAddOpen && <AddItemDrawer list={list} onClose={() => setIsAddOpen(false)} />}
      </AnimatePresence>
    </div>
  );
};
