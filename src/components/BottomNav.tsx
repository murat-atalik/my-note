import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { TabType } from '../types';
import { CheckSquare, Users, BarChart3, Settings } from 'lucide-react';
import { motion } from 'motion/react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, lists, currentUser } = useAppStore();

  const myListsCount = lists.length;
  const sharedListsCount = lists.filter(
    (l) => l.members.length > 1 || l.ownerId !== currentUser.id
  ).length;

  const navItems: { id: TabType; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'lists',
      label: 'Listelerim',
      icon: <CheckSquare className="w-5 h-5" />,
      badge: myListsCount,
    },
    {
      id: 'shared',
      label: 'Ortak',
      icon: <Users className="w-5 h-5" />,
      badge: sharedListsCount > 0 ? sharedListsCount : undefined,
    },
    {
      id: 'analytics',
      label: 'Analiz & Bütçe',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      id: 'settings',
      label: 'Ayarlar',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 pb-safe shadow-lg">
      <div className="max-w-md mx-auto grid grid-cols-4 px-2 py-1.5">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-emerald-700 font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute inset-0 bg-emerald-50 rounded-xl -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              <div className="relative">
                {item.icon}
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 px-1.5 py-0.2 min-w-[16px] h-4 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>

              <span className="text-[11px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
