import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  AtSign,
  User as UserIcon,
  Check,
  Languages,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import { EMOJI_AVATARS, DEFAULT_AVATAR } from '../data/emojis';
import { UserAvatar } from './UserAvatar';
import {
  loginSchema,
  registerSchema,
  handleZodValidation,
  FieldErrors,
  BilingualError,
} from '../lib/validations';

const USER_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4'];

export const AuthModal: React.FC = () => {
  useLockBodyScroll();
  const {
    authModalOpen,
    authModalMode,
    login,
    register,
    users,
    isAuthenticated,
  } = useAppStore();

  const [mode, setMode] = useState<'login' | 'register'>(authModalMode || 'login');
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(DEFAULT_AVATAR);
  const [selectedColor, setSelectedColor] = useState(USER_COLORS[0]);
  const [rememberMe, setRememberMe] = useState(true);

  // Validation States
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState<BilingualError | null>(null);
  const [successMessage, setSuccessMessage] = useState<{ tr: string; en: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // If user is not authenticated, AuthModal MUST be shown.
  if (!authModalOpen && isAuthenticated) return null;

  const handleModeSwitch = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setFieldErrors({});
    setGlobalError(null);
    setSuccessMessage(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGlobalError(null);
    setSuccessMessage(null);

    const cleanUser = username.trim();
    // Validate with Zod
    const val = handleZodValidation(loginSchema, {
      username: cleanUser,
      password,
      rememberMe,
    });

    if (!val.success) {
      if (val.fieldErrors) setFieldErrors(val.fieldErrors);
      if (val.error) setGlobalError(val.error);
      return;
    }

    setIsLoading(true);
    try {
      const res = await login({ username: cleanUser, password, rememberMe });
      if (!res.success) {
        if (res.bilingualError) {
          setGlobalError(res.bilingualError);
        } else {
          setGlobalError({
            tr: res.error || 'Giriş yapılamadı.',
            en: 'Login failed. Please verify your credentials.',
          });
        }
      } else {
        setSuccessMessage({
          tr: 'Giriş başarılı! Hoş geldiniz.',
          en: 'Login successful! Welcome back.',
        });
      }
    } catch {
      setGlobalError({
        tr: 'Bir hata oluştu. Lütfen tekrar deneyin.',
        en: 'An error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGlobalError(null);
    setSuccessMessage(null);

    const cleanName = name.trim();
    const cleanUser = username.trim().toLowerCase().replace(/^@/, '');

    // Validate with Zod
    const val = handleZodValidation(registerSchema, {
      name: cleanName,
      username: cleanUser,
      password,
      confirmPassword,
      avatar: selectedAvatar,
      color: selectedColor,
    });

    if (!val.success) {
      if (val.fieldErrors) setFieldErrors(val.fieldErrors);
      if (val.error) setGlobalError(val.error);
      return;
    }

    setIsLoading(true);
    try {
      const res = await register({
        name: cleanName,
        username: cleanUser,
        password,
        confirmPassword,
        avatar: selectedAvatar,
        color: selectedColor,
      });

      if (!res.success) {
        if (res.bilingualError) {
          setGlobalError(res.bilingualError);
        } else {
          setGlobalError({
            tr: res.error || 'Kayıt işlemi gerçekleştirilemedi.',
            en: 'Registration failed.',
          });
        }
      } else {
        setSuccessMessage({
          tr: 'Hesabınız başarıyla oluşturuldu! Hoş geldiniz.',
          en: 'Your account has been successfully created! Welcome.',
        });
      }
    } catch {
      setGlobalError({
        tr: 'Kayıt esnasında bir hata oluştu.',
        en: 'An unexpected error occurred during registration.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (userUsername: string) => {
    setUsername(userUsername);
    setPassword('password123');
    setFieldErrors({});
    setGlobalError(null);
    setIsLoading(true);
    const res = await login({ username: userUsername, password: 'password123' });
    setIsLoading(false);
    if (!res.success) {
      setGlobalError(
        res.bilingualError || {
          tr: res.error || 'Giriş yapılamadı.',
          en: 'Quick login failed.',
        }
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-7 shadow-2xl border border-slate-100 max-h-[94vh] overflow-y-auto relative"
      >
        {/* Top Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-3xl shadow-lg shadow-emerald-200/50 mb-2 select-none">
            {mode === 'register' ? selectedAvatar : '🐟'}
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {mode === 'login' ? 'Giriş Yapın / Sign In' : 'Hesap Oluşturun / Create Account'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'login'
              ? 'Lütfen oturum açın / Please log in to continue'
              : 'Yeni üye olun ve listelerinizi yönetin / Register to start'}
          </p>
        </div>

        {/* Mode Selector Tabs (Login / Register) */}
        <div className="flex p-1 bg-slate-100 rounded-2xl mb-4">
          <button
            type="button"
            onClick={() => handleModeSwitch('login')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              mode === 'login'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Giriş Yap / Sign In
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch('register')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              mode === 'register'
                ? 'bg-white text-emerald-800 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Kayıt Ol / Sign Up
          </button>
        </div>

        {/* Global Bilingual Alerts */}
        <AnimatePresence>
          {globalError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs font-medium space-y-1 mb-4"
            >
              <div className="flex items-center gap-1.5 font-bold text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Hata / Error</span>
              </div>
              <p className="pl-5 text-rose-800 font-semibold">{globalError.tr}</p>
              <p className="pl-5 text-[11px] text-rose-600 italic">{globalError.en}</p>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-medium space-y-1 mb-4"
            >
              <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Başarılı / Success</span>
              </div>
              <p className="pl-5 text-emerald-800 font-semibold">{successMessage.tr}</p>
              <p className="pl-5 text-[11px] text-emerald-600 italic">{successMessage.en}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Kullanıcı Adı <span className="text-slate-400 font-normal">/ Username</span>
                </label>
              </div>
              <div className="relative">
                <AtSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (fieldErrors.username) {
                      setFieldErrors((prev) => ({ ...prev, username: undefined as any }));
                    }
                  }}
                  placeholder="örn: murat, ayse, can"
                  className={`w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition font-medium ${
                    fieldErrors.username
                      ? 'border-rose-400 focus:ring-rose-400/20 focus:border-rose-500 bg-rose-50/30'
                      : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-600'
                  }`}
                />
              </div>
              {fieldErrors.username && (
                <div className="mt-1.5 px-2 py-1 bg-rose-50 border border-rose-100 rounded-lg text-[11px]">
                  <p className="font-semibold text-rose-700">{fieldErrors.username.tr}</p>
                  <p className="text-[10px] text-rose-500 italic">{fieldErrors.username.en}</p>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Şifre <span className="text-slate-400 font-normal">/ Password</span>
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors((prev) => ({ ...prev, password: undefined as any }));
                    }
                  }}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-9 py-2.5 text-xs bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition font-medium ${
                    fieldErrors.password
                      ? 'border-rose-400 focus:ring-rose-400/20 focus:border-rose-500 bg-rose-50/30'
                      : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-600'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {fieldErrors.password && (
                <div className="mt-1.5 px-2 py-1 bg-rose-50 border border-rose-100 rounded-lg text-[11px]">
                  <p className="font-semibold text-rose-700">{fieldErrors.password.tr}</p>
                  <p className="text-[10px] text-rose-500 italic">{fieldErrors.password.en}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500/20"
                />
                <span className="text-xs text-slate-600 select-none">
                  Beni hatırla <span className="text-slate-400 text-[10px]">/ Remember me</span>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Giriş Yapılıyor... / Signing in...</span>
              ) : (
                <>
                  <span>Giriş Yap / Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Adınız & Soyadınız <span className="text-slate-400 font-normal">/ Full Name</span> *
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
                  placeholder="Örn: Ahmet Yılmaz"
                  className={`w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition font-medium ${
                    fieldErrors.name
                      ? 'border-rose-400 focus:ring-rose-400/20 focus:border-rose-500 bg-rose-50/30'
                      : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-600'
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
                Kullanıcı Adı <span className="text-slate-400 font-normal">/ Username</span> *
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
                  placeholder="örn: ahmetyilmaz (boşluksuz)"
                  className={`w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition font-medium ${
                    fieldErrors.username
                      ? 'border-rose-400 focus:ring-rose-400/20 focus:border-rose-500 bg-rose-50/30'
                      : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-600'
                  }`}
                />
              </div>
              {fieldErrors.username && (
                <div className="mt-1.5 px-2 py-1 bg-rose-50 border border-rose-100 rounded-lg text-[11px]">
                  <p className="font-semibold text-rose-700">{fieldErrors.username.tr}</p>
                  <p className="text-[10px] text-rose-500 italic">{fieldErrors.username.en}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Şifre <span className="text-slate-400 font-normal">/ Password</span> *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined as any }));
                    }}
                    placeholder="En az 6 karakter"
                    className={`w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition font-medium ${
                      fieldErrors.password
                        ? 'border-rose-400 focus:ring-rose-400/20 focus:border-rose-500 bg-rose-50/30'
                        : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-600'
                    }`}
                  />
                </div>
                {fieldErrors.password && (
                  <div className="mt-1.5 px-2 py-1 bg-rose-50 border border-rose-100 rounded-lg text-[11px]">
                    <p className="font-semibold text-rose-700">{fieldErrors.password.tr}</p>
                    <p className="text-[10px] text-rose-500 italic">{fieldErrors.password.en}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Şifre Onayı <span className="text-slate-400 font-normal">/ Confirm</span> *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (fieldErrors.confirmPassword) setFieldErrors((p) => ({ ...p, confirmPassword: undefined as any }));
                    }}
                    placeholder="Şifreyi onaylayın"
                    className={`w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition font-medium ${
                      fieldErrors.confirmPassword
                        ? 'border-rose-400 focus:ring-rose-400/20 focus:border-rose-500 bg-rose-50/30'
                        : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-600'
                    }`}
                  />
                </div>
                {fieldErrors.confirmPassword && (
                  <div className="mt-1.5 px-2 py-1 bg-rose-50 border border-rose-100 rounded-lg text-[11px]">
                    <p className="font-semibold text-rose-700">{fieldErrors.confirmPassword.tr}</p>
                    <p className="text-[10px] text-rose-500 italic">{fieldErrors.confirmPassword.en}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Emoji Avatar Picker (includes fish emojis) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Emoji Avatarı Seçin <span className="text-slate-400 font-normal">/ Pick Avatar</span>:
                </label>
                <span className="text-xl leading-none bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                  {selectedAvatar}
                </span>
              </div>
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 p-2 bg-slate-50 rounded-2xl border border-slate-200 max-h-36 overflow-y-auto">
                {EMOJI_AVATARS.map((emoji, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(emoji)}
                    className={`h-9 text-lg rounded-xl flex items-center justify-center transition ${
                      selectedAvatar === emoji
                        ? 'bg-emerald-600 text-white shadow-xs scale-110'
                        : 'bg-white hover:bg-slate-200/80 border border-slate-200/60'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Accent Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Profil Teması Rengi <span className="text-slate-400 font-normal">/ Accent Color</span>:
              </label>
              <div className="flex items-center gap-2">
                {USER_COLORS.map((c, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform ${
                      selectedColor === c ? 'scale-125 ring-2 ring-offset-2 ring-slate-800' : 'opacity-80 hover:opacity-100'
                    }`}
                  >
                    {selectedColor === c && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Hesap Oluşturuluyor... / Creating...</span>
              ) : (
                <>
                  <span>Kayıt Ol ve Başla / Sign Up</span>
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Existing Accounts 1-Click Login List for Quick Testing */}
        {mode === 'login' && users.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Kayıtlı Kullanıcılar / Registered Users
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {users.slice(0, 3).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickLogin(u.username)}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-left transition flex items-center gap-2 group active:scale-95"
                >
                  <UserAvatar avatar={u.avatar} name={u.name} size="xs" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-slate-800 truncate group-hover:text-emerald-900">
                      {u.name.split(' ')[0]}
                    </p>
                    <p className="text-[9px] text-slate-400 truncate">@{u.username}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
