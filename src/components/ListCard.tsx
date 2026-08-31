import React from 'react';
import { AppList } from '../types';
import { useAppStore } from '../store/useAppStore';
import { ShoppingCart, CheckSquare, StickyNote, ArrowRight, Trash2, Share2 } from 'lucide-react';
import { UserAvatar } from './UserAvatar';

interface ListCardProps {
  list: AppList;
  onOpenInvite: (list: AppList) => void;
}

export const ListCard: React.FC<ListCardProps> = ({ list, onOpenInvite }) => {
  const { items, setSelectedListId, users, deleteList, currentUser } = useAppStore();

  const listItems = items.filter((i) => i.listId === list.id);
  const totalItems = listItems.length;
  const completedItems = listItems.filter((i) => i.isCompleted).length;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Calculate total price if shopping list
  const totalPrice = listItems.reduce(
    (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
    0
  );
  const purchasedPrice = listItems
    .filter((i) => i.isCompleted)
    .reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);

  // List members
  const memberUsers = list.members
    .map((m) => users.find((u) => u.id === m.userId))
    .filter(Boolean);

  const isOwner = list.ownerId === currentUser.id;

  const getTypeIcon = () => {
    switch (list.type) {
      case 'SHOPPING':
        return <ShoppingCart className="w-4 h-4 text-emerald-600" />;
      case 'TODO':
        return <CheckSquare className="w-4 h-4 text-amber-600" />;
      case 'NOTE':
        return <StickyNote className="w-4 h-4 text-purple-600" />;
    }
  };

  const getTypeName = () => {
    switch (list.type) {
      case 'SHOPPING':
        return 'Akıllı Alışveriş';
      case 'TODO':
        return 'Yapılacaklar';
      case 'NOTE':
        return 'Notlar & Fikirler';
    }
  };

  const getTypeBadgeClass = () => {
    switch (list.type) {
      case 'SHOPPING':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'TODO':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'NOTE':
        return 'bg-purple-50 text-purple-700 border-purple-200';
    }
  };

  return (
    <div
      onClick={() => setSelectedListId(list.id)}
      className="group relative bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Header: Type Badge & Action Buttons */}
        <div className="flex items-center justify-between mb-2.5">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getTypeBadgeClass()}`}
          >
            {getTypeIcon()}
            {getTypeName()}
          </span>

          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onOpenInvite(list)}
              title="Kullanıcı Davet Et / Paylaş"
              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {isOwner && (
              <button
                onClick={() => {
                  if (confirm(`"${list.title}" listesini silmek istediğinize emin misiniz?`)) {
                    deleteList(list.id);
                  }
                }}
                title="Listeyi Sil"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-emerald-700 transition">
          {list.title}
        </h3>
        {list.description && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {list.description}
          </p>
        )}
      </div>

      {/* Stats & Progress */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        {list.type === 'SHOPPING' && (
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-500 font-medium">
              Sepet: <strong className="text-slate-900 font-semibold">{purchasedPrice.toLocaleString('tr-TR')} ₺</strong>
            </span>
            <span className="text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded-md">
              Toplam: {totalPrice.toLocaleString('tr-TR')} ₺
            </span>
          </div>
        )}

        {/* Progress Bar (Shopping & Todo) */}
        {list.type !== 'NOTE' && (
          <div className="mb-2.5">
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
              <span>{completedItems} / {totalItems} tamamlandı</span>
              <span className="font-semibold text-slate-700">%{progressPercent}</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer: Member avatars + Open Button */}
        <div className="flex items-center justify-between mt-2">
          {/* Members with UserAvatar */}
          <div className="flex items-center -space-x-1.5">
            {memberUsers.map((m, idx) => (
              <UserAvatar
                key={m?.id || idx}
                avatar={m?.avatar}
                name={`${m?.name} (${list.ownerId === m?.id ? 'Sahip' : 'Düzenleyici'})`}
                size="xs"
                className="border-2 border-white"
              />
            ))}
            {list.members.length > 3 && (
              <span className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white text-[10px] font-bold text-slate-600 flex items-center justify-center">
                +{list.members.length - 3}
              </span>
            )}
          </div>

          <span className="text-xs font-semibold text-emerald-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
            Görüntüle
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
