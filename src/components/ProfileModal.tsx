import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  X,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  AtSign,
  Smile,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import { EMOJI_AVATARS } from '../data/emojis';
import {
  profileUpdateSchema,
  handleZodValidation,
  FieldErrors,
  BilingualError,
} from '../lib/validations';

interface ProfileModalProps {
  onClose: () => void;
  onOpenChangePassword?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ onClose, onOpenChangePassword }) => {
  useLockBodyScroll();
  const { currentUser, updateUserProfile, setChangePasswordModalOpen, users } = useAppStore();

  const [name, setName] = useState(currentUser.name);
  const [username, setUsername] = useState(currentUser.username || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || '🐟');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState<BilingualError | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGlobalError(null);

    const cleanName = name.trim();
    const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');

    // Validate with Zod
    const val = handleZodValidation(profileUpdateSchema, {
      name: cleanName,
      username: cleanUsername,
      avatar,
    });

    if (!val.success) {
      if (val.fieldErrors) setFieldErrors(val.fieldErrors);
      if (val.error) setGlobalError(val.error);
      return;
    }

    // Check if another user already has this username
    const usernameTaken = users.some(
      (u) => u.id !== currentUser.id && u.username?.toLowerCase() === cleanUsername
    );
    if (usernameTaken) {
      const err: BilingualError = {
        tr: 'Bu kullanıcı adı başka bir kullanıcı tarafından kullanılıyor.',
        en: 'This username is already in use by another account.',
      };
      setFieldErrors({ username: err });
      setGlobalError(err);
      return;
    }

    updateUserProfile({
      name: cleanName,
      username: cleanUsername,
      avatar,
    });

    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleOpenPasswordModal = () => {
    onClose();
    if (onOpenChangePassword) {
      onOpenChangePassword();
    } else {
      setChangePasswordModalOpen(true);
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto relative"
      >
        <button
          id="close-profile-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-base font-bold text-slate-900 leading-tight">
          Profil Bilgileri & Emoji Avatar <span className="text-xs font-normal text-slate-400">/ Profile</span>
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Profil adınızı, kullanıcı adınızı ve emoji avatarınızı güncelleyin
        </p>

        {success && (
          <div className="p-3 mb-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <p>Profiliniz başarıyla güncellendi!</p>
              <p className="text-[10px] text-emerald-600 italic font-normal">Profile updated successfully!</p>
            </div>
          </div>
        )}

        {globalError && (
          <div className="p-3 mb-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p>{globalError.tr}</p>
              <p className="text-[10px] text-rose-500 italic font-normal">{globalError.en}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Emoji Selection */}
          <div className="text-center pb-1">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 border-4 border-emerald-500 text-4xl shadow-sm mb-2 select-none">
              {avatar}
            </div>

            <p className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-center gap-1.5">
              <Smile className="w-3.5 h-3.5 text-emerald-600" />
              <span>Emoji Avatarınızı Değiştirin / Choose Avatar:</span>
            </p>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 p-2 bg-slate-50 rounded-2xl border border-slate-200 max-h-36 overflow-y-auto">
              {EMOJI_AVATARS.map((emoji, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatar(emoji)}
                  className={`h-9 text-lg rounded-xl flex items-center justify-center transition ${
                    avatar === emoji
                      ? 'bg-emerald-600 text-white shadow-xs scale-110'
                      : 'bg-white hover:bg-slate-200/80 border border-slate-200/60'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Görünen Adınız <span className="text-slate-400 font-normal">/ Full Name</span>
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: undefined as any }));
                }}
                className={`w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 font-medium transition ${
                  fieldErrors.name
                    ? 'border-rose-400 focus:ring-rose-400/20 bg-rose-50/30'
                    : 'border-slate-200 focus:ring-emerald-500/20'
                }`}
              />
            </div>
            {fieldErrors.name && (
              <div className="mt-1.5 px-2 py-1 bg-rose-50 border border-rose-100 rounded-lg text-[11px]">
                <p className="font-semibold text-rose-700">{fieldErrors.name.tr}</p>
                <p className="text-[10px] text-rose-500 italic">{fieldErrors.name.en}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kullanıcı Adı <span className="text-slate-400 font-normal">/ Username</span>
            </label>
            <div className="relative">
              <AtSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (fieldErrors.username) setFieldErrors((p) => ({ ...p, username: undefined as any }));
                }}
                className={`w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 font-medium transition ${
                  fieldErrors.username
                    ? 'border-rose-400 focus:ring-rose-400/20 bg-rose-50/30'
                    : 'border-slate-200 focus:ring-emerald-500/20'
                }`}
              />
            </div>
            {fieldErrors.username ? (
              <div className="mt-1.5 px-2 py-1 bg-rose-50 border border-rose-100 rounded-lg text-[11px]">
                <p className="font-semibold text-rose-700">{fieldErrors.username.tr}</p>
                <p className="text-[10px] text-rose-500 italic">{fieldErrors.username.en}</p>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1">
                Arkadaşlarınız sizi bu kullanıcı adı ile listelere ekleyebilir.
              </p>
            )}
          </div>

          {/* Password Change Action inside Profile Modal */}
          <div className="pt-1">
            <button
              id="open-change-password-from-profile-btn"
              type="button"
              onClick={handleOpenPasswordModal}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold transition flex items-center justify-between group active:scale-[0.98]"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Hesap Şifresini Değiştir / Change Password</span>
              </div>
              <span className="text-[11px] font-semibold text-amber-700 group-hover:underline">
                Şifre Yenile →
              </span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
            >
              İptal / Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
            >
              Kaydet / Save
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
