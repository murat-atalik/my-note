import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { AppList } from '../types';
import { ArrowLeft, Plus, Share2, Pin, Trash2, Edit3 } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { AddItemDrawer } from './AddItemDrawer';

interface NoteListViewProps {
  list: AppList;
  onBack: () => void;
  onOpenInvite: () => void;
}

export const NoteListView: React.FC<NoteListViewProps> = ({ list, onBack, onOpenInvite }) => {
  const { items, deleteItem, updateItem, categories } = useAppStore();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const listItems = items.filter((i) => i.listId === list.id);
  const pinnedNotes = listItems.filter((i) => i.isPinned);
  const otherNotes = listItems.filter((i) => !i.isPinned);

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
                {listItems.length} Not Kayıtlı
              </p>
            </div>
          </div>

          <button
            onClick={onOpenInvite}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-50 text-purple-800 hover:bg-purple-100 text-xs font-semibold border border-purple-200 transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Paylaş</span>
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-4 space-y-4">
        {/* Pinned Notes */}
        {pinnedNotes.length > 0 && (
          <div>
            <p className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1">
              <Pin className="w-3 h-3 text-purple-600 fill-purple-600" />
              Sabitlenenler
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pinnedNotes.map((note) => {
                const cat = categories.find((c) => c.id === note.categoryId);
                return (
                  <div
                    key={note.id}
                    className="bg-purple-50/50 border border-purple-200/80 rounded-2xl p-4 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-slate-900 text-sm">{note.title}</h3>
                        <button
                          onClick={() => updateItem(note.id, { isPinned: false })}
                          className="text-purple-600 hover:text-purple-800 p-0.5"
                          title="Sabitlemeyi Kaldır"
                        >
                          <Pin className="w-3.5 h-3.5 fill-purple-600" />
                        </button>
                      </div>
                      {note.content && (
                        <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                          {note.content}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-purple-200/50">
                      {cat && (
                        <span className="text-[10px] font-semibold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-md">
                          {cat.name}
                        </span>
                      )}
                      <button
                        onClick={() => deleteItem(note.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Regular Notes */}
        <div>
          {pinnedNotes.length > 0 && otherNotes.length > 0 && (
            <p className="text-xs font-bold text-slate-400 mb-2">Diğer Notlar</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {otherNotes.map((note) => {
              const cat = categories.find((c) => c.id === note.categoryId);
              return (
                <div
                  key={note.id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-slate-900 text-sm">{note.title}</h3>
                      <button
                        onClick={() => updateItem(note.id, { isPinned: true })}
                        className="text-slate-400 hover:text-purple-600 p-0.5"
                        title="En Üste Sabitle"
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {note.content && (
                      <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">
                        {note.content}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                    {cat && (
                      <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {cat.name}
                      </span>
                    )}
                    <button
                      onClick={() => deleteItem(note.id)}
                      className="text-slate-300 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Add Note Button */}
      <div className="fixed bottom-16 right-4 z-30">
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 py-3 px-5 rounded-full bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs shadow-lg shadow-purple-600/25 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Not Ekle</span>
        </button>
      </div>

      <AnimatePresence>
        {isAddOpen && <AddItemDrawer list={list} onClose={() => setIsAddOpen(false)} />}
      </AnimatePresence>
    </div>
  );
};
