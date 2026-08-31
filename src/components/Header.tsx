import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  Plus,
  Smartphone,
  LogOut,
  UserPlus,
  User as UserIcon,
  ChevronDown,
  ShieldCheck,
  LogIn,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProfileModal } from './ProfileModal';
import { UserAvatar } from './UserAvatar';

interface HeaderProps {
  onOpenCreateModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCreateModal }) => {
  const {
    currentUser,
    isAuthenticated,
    setAuthModalOpen,
    setChangePasswordModalOpen,
    logout,
  } = useAppStore();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [pwaInstalled, setPwaInstalled] = useState(false);

  const handleInstallClick = () => {
    setPwaInstalled(true);
    setTimeout(() => {
      alert(
        'Uygulama mobil ana ekranınıza başarıyla eklendi! Çevrimdışı ve tam ekran modunda çalışmaya hazır.'
      );
    }, 200);
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-sm shadow-emerald-200 text-lg">
              <span>₺</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-slate-900 text-base leading-tight tracking-tight">
                  Akıllı Liste
                </h1>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Ortak Liste & Bütçe Yönetimi
              </p>
            </div>
          </div>

          {/* Right Actions: Install App + User Dropdown */}
          <div className="flex items-center gap-2">
            {!pwaInstalled && (
              <button
                onClick={handleInstallClick}
                title="Ana Ekrana Ekle"
                className="hidden sm:flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Yükle</span>
              </button>
            )}

            {/* Single Active User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-1.5 p-1 rounded-full hover:bg-slate-100 border border-slate-200 transition"
                title="Kullanıcı Menüsü"
              >
                <UserAvatar avatar={currentUser.avatar} name={currentUser.name} size="sm" />
                <span className="text-xs font-medium text-slate-700 hidden md:inline pr-1">
                  {currentUser.name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 mr-1 hidden sm:inline" />
              </button>

              <AnimatePresence>
                {showUserDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 divide-y divide-slate-100"
                  >
                    {/* Single Active User Info */}
                    <div className="px-3.5 py-2.5">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          Aktif Oturum
                        </p>
                        <span className="text-[10px] font-bold text-slate-500">
                          @{currentUser.username || 'kullanici'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <UserAvatar avatar={currentUser.avatar} name={currentUser.name} size="xs" />
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {currentUser.name}
                        </p>
                      </div>

                      {/* Open Profile Modal */}
                      <button
                        id="edit-profile-dropdown-btn"
                        onClick={() => {
                          setShowUserDropdown(false);
                          setShowProfileModal(true);
                        }}
                        className="mt-2.5 w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-slate-600" />
                        <span>Profili Düzenle & Emoji Avatar</span>
                      </button>
                    </div>

                    {/* Actions: Logout */}
                    <div className="p-1 space-y-0.5">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl text-left transition"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Oturumu Kapat</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Create List Button */}
            <button
              onClick={onOpenCreateModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Yeni Liste</span>
            </button>
          </div>
        </div>
      </header>

      {showProfileModal && (
        <ProfileModal
          onClose={() => setShowProfileModal(false)}
          onOpenChangePassword={() => {
            setShowProfileModal(false);
            setChangePasswordModalOpen(true);
          }}
        />
      )}
    </>
  );
};
