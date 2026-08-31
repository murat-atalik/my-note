import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  X,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import {
  changePasswordSchema,
  handleZodValidation,
  FieldErrors,
  BilingualError,
} from '../lib/validations';

interface ChangePasswordModalProps {
  onClose?: () => void;
}

export function ChangePasswordModal({ onClose }: ChangePasswordModalProps = {}) {
  useLockBodyScroll();
  const { currentUser, changePassword, changePasswordModalOpen, setChangePasswordModalOpen } = useAppStore();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState<BilingualError | null>(null);
  const [success, setSuccess] = useState(false);

  if (!changePasswordModalOpen && !onClose) return null;

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setChangePasswordModalOpen(false);
    }
  };

  // Password strength calculation
  const getStrength = (pass: string) => {
    if (!pass) return { score: 0, text: '', color: 'bg-slate-200' };
    let s = 0;
    if (pass.length >= 6) s += 1;
    if (pass.length >= 8) s += 1;
    if (/[A-Z]/.test(pass) || /[0-9]/.test(pass)) s += 1;
    if (/[^A-Za-z0-9]/.test(pass)) s += 1;

    if (s <= 1) return { score: 1, text: 'Zayıf / Weak', color: 'bg-rose-500', width: 'w-1/4' };
    if (s === 2) return { score: 2, text: 'Orta / Medium', color: 'bg-amber-500', width: 'w-2/4' };
    if (s === 3) return { score: 3, text: 'İyi / Good', color: 'bg-emerald-500', width: 'w-3/4' };
    return { score: 4, text: 'Güçlü / Strong', color: 'bg-emerald-600', width: 'w-full' };
  };

  const strength = getStrength(newPassword);
  const isMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGlobalError(null);

    // Validate with Zod
    const val = handleZodValidation(changePasswordSchema, {
      oldPassword,
      newPassword,
      confirmPassword,
    });

    if (!val.success) {
      if (val.fieldErrors) setFieldErrors(val.fieldErrors);
      if (val.error) setGlobalError(val.error);
      return;
    }

    setLoading(true);
    const result = await changePassword({
      oldPassword,
      newPassword,
      confirmPassword,
    });
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1400);
    } else {
      if (result.bilingualError) {
        setGlobalError(result.bilingualError);
      } else {
        setGlobalError({
          tr: result.error || 'Şifre güncellenirken bir hata oluştu.',
          en: 'An error occurred while updating your password.',
        });
      }
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', duration: 0.35, bounce: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden z-10"
      >
        {/* Header with badge */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Şifre Değiştir <span className="text-xs font-normal text-slate-400">/ Change Password</span>
              </h2>
              <p className="text-xs text-slate-500">
                Kullanıcı: <span className="font-semibold text-slate-700">@{currentUser?.username || 'kullanici'}</span>
              </p>
            </div>
          </div>
          <button
            id="close-change-password-modal-btn"
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-6 space-y-3"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Şifreniz Başarıyla Değiştirildi</h3>
              <p className="text-xs text-emerald-700 font-medium">Password changed successfully!</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Yeni şifreniz kaydedildi. Bir sonraki girişinizde bu şifreyi kullanabilirsiniz.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Global Error Banner */}
              {globalError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">{globalError.tr}</p>
                    <p className="text-[10px] text-rose-500 italic">{globalError.en}</p>
                  </div>
                </motion.div>
              )}

              {/* 1. Eski Şifre */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Eski (Mevcut) Şifre <span className="text-slate-400 font-normal">/ Current Password</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="input-old-password"
                    type={showOld ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => {
                      setOldPassword(e.target.value);
                      if (fieldErrors.oldPassword) setFieldErrors((p) => ({ ...p, oldPassword: undefined as any }));
                    }}
                    placeholder="Mevcut şifrenizi girin"
                    className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition font-medium ${
                      fieldErrors.oldPassword
                        ? 'border-rose-400 focus:ring-rose-400/20 bg-rose-50/30'
                        : 'border-slate-200 focus:ring-amber-500/20 focus:border-amber-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOld(!showOld)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                  >
                    {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.oldPassword && (
                  <div className="px-2 py-1 bg-rose-50 border border-rose-100 rounded-lg text-[11px]">
                    <p className="font-semibold text-rose-700">{fieldErrors.oldPassword.tr}</p>
                    <p className="text-[10px] text-rose-500 italic">{fieldErrors.oldPassword.en}</p>
                  </div>
                )}
              </div>

              {/* 2. Yeni Şifre */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Yeni Şifre <span className="text-slate-400 font-normal">/ New Password</span>
                  </label>
                  {newPassword && (
                    <span className="text-[11px] font-semibold text-slate-500">
                      Güç: <span className="font-bold text-slate-700">{strength.text}</span>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    id="input-new-password"
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (fieldErrors.newPassword) setFieldErrors((p) => ({ ...p, newPassword: undefined as any }));
                    }}
                    placeholder="En az 6 karakter yeni şifre"
                    className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition font-medium ${
                      fieldErrors.newPassword
                        ? 'border-rose-400 focus:ring-rose-400/20 bg-rose-50/30'
                        : 'border-slate-200 focus:ring-amber-500/20 focus:border-amber-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {fieldErrors.newPassword && (
                  <div className="px-2 py-1 bg-rose-50 border border-rose-100 rounded-lg text-[11px]">
                    <p className="font-semibold text-rose-700">{fieldErrors.newPassword.tr}</p>
                    <p className="text-[10px] text-rose-500 italic">{fieldErrors.newPassword.en}</p>
                  </div>
                )}

                {/* Strength bar */}
                {newPassword && (
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                    <div className={`h-full ${strength.color} transition-all duration-300 ${strength.width}`} />
                  </div>
                )}
              </div>

              {/* 3. Yeni Şifre Tekrarı */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Yeni Şifre Tekrarı <span className="text-slate-400 font-normal">/ Confirm</span>
                  </label>
                  {confirmPassword && (
                    <span
                      className={`text-[11px] font-semibold flex items-center gap-1 ${
                        isMatch ? 'text-emerald-600' : 'text-rose-500'
                      }`}
                    >
                      {isMatch ? (
                        <>
                          <Check className="w-3 h-3" /> Eşleşti / Matches
                        </>
                      ) : (
                        'Eşleşmiyor / Does not match'
                      )}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <input
                    id="input-confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (fieldErrors.confirmPassword) setFieldErrors((p) => ({ ...p, confirmPassword: undefined as any }));
                    }}
                    placeholder="Yeni şifrenizi tekrar yazın"
                    className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition font-medium ${
                      fieldErrors.confirmPassword
                        ? 'border-rose-400 focus:ring-rose-500/20 bg-rose-50/30'
                        : confirmPassword && isMatch
                        ? 'border-emerald-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                        : 'border-slate-200 focus:ring-amber-500/20 focus:border-amber-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <div className="px-2 py-1 bg-rose-50 border border-rose-100 rounded-lg text-[11px]">
                    <p className="font-semibold text-rose-700">{fieldErrors.confirmPassword.tr}</p>
                    <p className="text-[10px] text-rose-500 italic">{fieldErrors.confirmPassword.en}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
                >
                  İptal / Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Kaydediliyor...' : 'Şifreyi Güncelle / Save'}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
