import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { AppList } from '../types';
import { ListCard } from './ListCard';
import { Users, KeyRound, ShieldCheck } from 'lucide-react';
import { UserAvatar } from './UserAvatar';

interface SharedListsViewProps {
  onOpenInvite: (list: AppList) => void;
  onOpenCreateModal: () => void;
}

export const SharedListsView: React.FC<SharedListsViewProps> = ({
  onOpenInvite,
  onOpenCreateModal,
}) => {
  const { lists, currentUser, users, inviteUserToList } = useAppStore();
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [joinMessage, setJoinMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Shared lists = list with >1 member or list where current user is not owner
  const sharedLists = lists.filter(
    (l) => l.members.length > 1 || l.ownerId !== currentUser.id
  );

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCodeInput.trim()) return;

    const targetList = lists.find(
      (l) => l.inviteCode.toUpperCase() === inviteCodeInput.trim().toUpperCase()
    );

    if (!targetList) {
      setJoinMessage({ text: 'Geçersiz veya bulunamayan davet kodu.', type: 'error' });
      return;
    }

    const res = inviteUserToList(targetList.id, currentUser.username || currentUser.email || '');
    if (res.success) {
      setJoinMessage({ text: `"${targetList.title}" listesine başarıyla katıldınız!`, type: 'success' });
      setInviteCodeInput('');
    } else {
      setJoinMessage({ text: res.message, type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-28">
      {/* Top Header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-base leading-tight">
                Ortak Çalışma & Paylaşılanlar
              </h1>
              <p className="text-[11px] text-slate-500">
                Aile üyeleri ve arkadaşlarla paylaşılan listeler
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-4 space-y-4">
        {/* Join by 6-digit invite code box */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-5 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <KeyRound className="w-4 h-4 text-indigo-300" />
            <h2 className="font-bold text-sm text-white">
              Davet Kodu ile Listeye Katıl
            </h2>
          </div>
          <p className="text-xs text-indigo-200 mb-3.5 leading-relaxed">
            Arkadaşınızın sizinle paylaştığı 6 haneli kodu (Örn: EV-8842) girerek listeye hemen dahil olun.
          </p>

          <form onSubmit={handleJoinByCode} className="flex gap-2">
            <input
              type="text"
              value={inviteCodeInput}
              onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
              placeholder="Örn: EV-8842"
              className="flex-1 px-3.5 py-2.5 text-xs uppercase font-mono bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition shrink-0"
            >
              Katıl
            </button>
          </form>

          {joinMessage && (
            <p
              className={`text-xs mt-2.5 font-medium ${
                joinMessage.type === 'success' ? 'text-emerald-300' : 'text-rose-300'
              }`}
            >
              {joinMessage.text}
            </p>
          )}
        </div>

        {/* Current Active Collaborators */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Sistemdeki Kayıtlı Kullanıcılar
            </p>
            <span className="text-[11px] text-slate-400">Canlı Eşzamanlı</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
            {users.map((u) => (
              <div
                key={u.id}
                className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition ${
                  currentUser.id === u.id
                    ? 'bg-emerald-50/70 border-emerald-300'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <UserAvatar avatar={u.avatar} name={u.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-900 text-xs truncate">{u.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">@{u.username}</p>
                </div>
                {currentUser.id === u.id && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-800">
                    Sen
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Shared Lists Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-slate-900 text-sm">
              Ortak Listeler ({sharedLists.length})
            </h2>
          </div>

          {sharedLists.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {sharedLists.map((list) => (
                <ListCard key={list.id} list={list} onOpenInvite={onOpenInvite} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">
                Henüz Paylaşılan Listeniz Yok
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                Kendi listelerinizi aile veya arkadaşlarınızla paylaşabilir ya da bir davet kodu ile ortak listeye katılabilirsiniz.
              </p>
              <button
                onClick={onOpenCreateModal}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-700 transition inline-flex items-center gap-1.5"
              >
                Yeni Ortak Liste Oluştur
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
