import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  Settings as SettingsIcon,
  Wallet,
  Tag,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  LogIn,
  LogOut,
  UserPlus,
  AtSign,
} from 'lucide-react';
import { CategoriesView } from './CategoriesView';
import { TemplatesView } from './TemplatesView';
import { ProfileModal } from './ProfileModal';
import { UserAvatar } from './UserAvatar';

export const SettingsView: React.FC = () => {
  const {
    currentUser,
    monthlyBudget,
    setMonthlyBudget,
    categories,
    templates,
    resetToDefaultData,
    setAuthModalOpen,
    setChangePasswordModalOpen,
    logout,
  } = useAppStore();

  const [subView, setSubView] = useState<'main' | 'categories' | 'templates'>('main');
  const [budgetInput, setBudgetInput] = useState(monthlyBudget.toString());
  const [budgetSaved, setBudgetSaved] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val > 0) {
      setMonthlyBudget(val);
      setBudgetSaved(true);
      setTimeout(() => setBudgetSaved(false), 2000);
    }
  };

  if (subView === 'categories') {
    return <CategoriesView onBack={() => setSubView('main')} />;
  }

  if (subView === 'templates') {
    return <TemplatesView onBack={() => setSubView('main')} />;
  }

  const shoppingCategoriesCount = categories.filter((c) => c.type === 'SHOPPING').length;
  const todoCategoriesCount = categories.filter((c) => c.type === 'TODO').length;
  const noteCategoriesCount = categories.filter((c) => c.type === 'NOTE').length;

  return (
    <div className="min-h-screen bg-slate-50/60 pb-28">
      {/* Top Header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <SettingsIcon className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-base leading-tight">
                Ayarlar & Hesap
              </h1>
              <p className="text-[11px] text-slate-500">
                Hesap Yönetimi, Profil, Emoji Avatar, Kategoriler ve Bütçe
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-4 space-y-4">
        {/* User Profile & Auth Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <UserAvatar
                avatar={currentUser.avatar}
                name={currentUser.name}
                size="lg"
                className="border-2 border-emerald-500"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-slate-900 text-sm truncate">
                    {currentUser.name}
                  </h2>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded shrink-0 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Aktif Oturum (1/1)
                  </span>
                </div>
                <p className="text-xs font-semibold text-emerald-700 truncate mt-0.5 flex items-center gap-1">
                  <AtSign className="w-3 h-3 inline" />
                  {currentUser.username || 'kullanici'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Kayıt Tarihi: {currentUser.createdAt || '2026-01-15'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                id="edit-profile-settings-btn"
                onClick={() => setShowProfileModal(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-2xs active:scale-95"
              >
                Profili Düzenle
              </button>
            </div>
          </div>

          {/* Account Actions */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
              <span>Şifre değiştirmek için profili düzenleyin</span>
            </p>

            <button
              onClick={logout}
              className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Oturumu Kapat</span>
            </button>
          </div>
        </div>

        {/* Management Subpage Navigation Cards */}
        <div className="space-y-2.5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Yönetim & Şablonlar
          </p>

          {/* Category Management Entry Card */}
          <button
            onClick={() => setSubView('categories')}
            className="w-full text-left bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-purple-300 transition group flex items-center justify-between gap-3 active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <Tag className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">
                    Kategori Yönetimi
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700">
                    {categories.length} Kategori
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  {shoppingCategoriesCount} Alışveriş • {todoCategoriesCount} Görev • {noteCategoriesCount} Not kategorisini düzenle veya ekle
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-purple-600 font-semibold text-xs shrink-0">
              <span className="hidden sm:inline">Yönet</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </button>

          {/* Template Management Entry Card */}
          <button
            onClick={() => setSubView('templates')}
            className="w-full text-left bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-emerald-300 transition group flex items-center justify-between gap-3 active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">
                    Hazır Liste Şablonları
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                    {templates.length} Şablon
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  Hazır paket listeler, tatil hazırlıkları veya kendi özel şablonlarınızı oluşturun
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-emerald-600 font-semibold text-xs shrink-0">
              <span className="hidden sm:inline">İncele</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </button>
        </div>

        {/* Monthly Budget Setting */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5">
            <Wallet className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Aylık Hedef Bütçe Belirle
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-3.5">
            Harcama analizi sayfasında bütçe aşımını takip etmek için aylık tavan tutarı girin.
          </p>

          <form onSubmit={handleSaveBudget} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                step="any"
                min="0"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                ₺ / Ay
              </span>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              Kaydet
            </button>
          </form>
          {budgetSaved && (
            <p className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Bütçe güncellendi!
            </p>
          )}
        </div>

        {/* Reset / Demo Data */}
        <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-2xs">
          <h3 className="font-bold text-rose-900 text-sm mb-1">
            Örnek Verileri Sıfırla
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Uygulamayı başlangıçtaki zengin örnek alışveriş listeleri, to-do görevleri, kategoriler ve şablonlara geri döndürür.
          </p>
          <button
            onClick={() => {
              if (confirm('Tüm verileri varsayılan örnek duruma getirmek istiyor musunuz?')) {
                resetToDefaultData();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Varsayılan Verilere Sıfırla</span>
          </button>
        </div>
      </div>

      {showProfileModal && (
        <ProfileModal
          onClose={() => setShowProfileModal(false)}
          onOpenChangePassword={() => {
            setShowProfileModal(false);
            setChangePasswordModalOpen(true);
          }}
        />
      )}
    </div>
  );
};
