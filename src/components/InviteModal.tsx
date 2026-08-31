import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { AppList } from '../types';
import { X, Copy, Check, Users, AtSign, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import { UserAvatar } from './UserAvatar';
import {
  inviteUserSchema,
  handleZodValidation,
  FieldErrors,
  BilingualError,
} from '../lib/validations';

interface InviteModalProps {
  list: AppList;
  onClose: () => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({ list, onClose }) => {
  useLockBodyScroll();
  const { inviteUserToList, users, currentUser } = useAppStore();
  const [usernameInput, setUsernameInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [feedback, setFeedback] = useState<{ success: boolean; message: string; bilingualMessage?: BilingualError } | null>(null);

  const listMembers = list.members
    .map((m) => ({
      ...m,
      user: users.find((u) => u.id === m.userId),
    }))
    .filter((m) => m.user);

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(list.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setFeedback(null);

    const val = handleZodValidation(inviteUserSchema, {
      username: usernameInput.trim(),
    });

    if (!val.success) {
      if (val.fieldErrors) setFieldErrors(val.fieldErrors);
      return;
    }

    const res = inviteUserToList(list.id, usernameInput.trim());
    setFeedback(res);
    if (res.success) {
      setUsernameInput('');
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
      >
        <button
          id="close-invite-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900 text-base">
              Listeyi Paylaş & Davet Et <span className="text-xs font-normal text-slate-400">/ Share</span>
            </h2>
            <p className="text-xs text-slate-500">{list.title}</p>
          </div>
        </div>

        {/* 6-Digit Code Box */}
        <div className="my-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500 mb-1">
            Özel Liste Davet Kodu / Invite Code
          </p>
          <div className="flex items-center justify-between gap-2">
            <span className="text-base font-black tracking-widest font-mono text-slate-900">
              {list.inviteCode}
            </span>
            <button
              id="copy-invite-code-btn"
              onClick={handleCopyCode}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition active:scale-95"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Kopyalandı / Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Kodu Kopyala</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Username Invite Form */}
        <form onSubmit={handleInviteSubmit} className="space-y-2 mb-5">
          <label className="block text-xs font-semibold text-slate-700">
            Kullanıcı Adı ile Davet Gönder <span className="text-slate-400 font-normal">/ Invite by Username</span>
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <AtSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="invite-username-input"
                type="text"
                value={usernameInput}
                onChange={(e) => {
                  setUsernameInput(e.target.value);
                  if (fieldErrors.username) setFieldErrors((p) => ({ ...p, username: undefined as any }));
                }}
                placeholder="örn: ayse, can, murat"
                className={`w-full pl-8 pr-3.5 py-2 text-xs bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 font-medium transition ${
                  fieldErrors.username
                    ? 'border-rose-400 focus:ring-rose-400/20 bg-rose-50/30'
                    : 'border-slate-200 focus:ring-emerald-500/20'
                }`}
              />
            </div>
            <button
              id="send-invite-btn"
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              Davet Et
            </button>
          </div>

          {fieldErrors.username && (
            <div className="px-2 py-1 bg-rose-50 border border-rose-100 rounded-lg text-[11px]">
              <p className="font-semibold text-rose-700">{fieldErrors.username.tr}</p>
              <p className="text-[10px] text-rose-500 italic">{fieldErrors.username.en}</p>
            </div>
          )}

          {feedback && (
            <div
              className={`p-2.5 rounded-xl text-xs font-medium flex items-start gap-2 ${
                feedback.success
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border border-rose-200 text-rose-900'
              }`}
            >
              {feedback.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                {feedback.bilingualMessage ? (
                  <>
                    <p className="font-semibold">{feedback.bilingualMessage.tr}</p>
                    <p className="text-[10px] italic opacity-80">{feedback.bilingualMessage.en}</p>
                  </>
                ) : (
                  <p>{feedback.message}</p>
                )}
              </div>
            </div>
          )}
        </form>

        {/* Current Members List */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 mb-2">
            Mevcut Liste Üyeleri ({listMembers.length}) <span className="text-[10px] font-normal">/ Members</span>
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {listMembers.map((m) => (
              <div
                key={m.userId}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <UserAvatar avatar={m.user?.avatar} name={m.user?.name} size="sm" />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">
                      {m.user?.name}{' '}
                      {m.userId === currentUser.id && (
                        <span className="text-[10px] text-emerald-600 font-semibold">(Sen)</span>
                      )}
                    </p>
                    <p className="text-[10px] text-slate-400">@{m.user?.username}</p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    m.role === 'OWNER'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-indigo-100 text-indigo-800'
                  }`}
                >
                  {m.role === 'OWNER' ? 'Sahip / Owner' : 'Düzenleyici / Editor'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
