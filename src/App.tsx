import React, { useState } from 'react';
import { useAppStore } from './store/useAppStore';
import { AppList, ListType } from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ListCard } from './components/ListCard';
import { ShoppingListView } from './components/ShoppingListView';
import { TodoListView } from './components/TodoListView';
import { NoteListView } from './components/NoteListView';
import { AnalyticsView } from './components/AnalyticsView';
import { SharedListsView } from './components/SharedListsView';
import { SettingsView } from './components/SettingsView';
import { CreateListModal } from './components/CreateListModal';
import { InviteModal } from './components/InviteModal';
import { AuthModal } from './components/AuthModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import {
  Plus,
  Search,
  ShoppingCart,
  CheckSquare,
  StickyNote,
} from 'lucide-react';
import { AnimatePresence } from 'motion/react';

export default function App() {
  const {
    isAuthenticated,
    activeTab,
    selectedListId,
    setSelectedListId,
    lists,
    items,
  } = useAppStore();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [inviteTargetList, setInviteTargetList] = useState<AppList | null>(null);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'ALL' | ListType>('ALL');
  const [search, setSearch] = useState('');

  // Selected list details
  const selectedList = lists.find((l) => l.id === selectedListId);

  // Filtered lists for the main tab
  const filteredLists = lists.filter((l) => {
    const matchesType = selectedTypeFilter === 'ALL' || l.type === selectedTypeFilter;
    const matchesSearch =
      !search ||
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      (l.description && l.description.toLowerCase().includes(search.toLowerCase()));
    return matchesType && matchesSearch;
  });

  // Calculate quick metrics for the home view
  const totalShoppingBudget = items
    .filter((i) => {
      const list = lists.find((l) => l.id === i.listId);
      return list?.type === 'SHOPPING' && !i.isCompleted;
    })
    .reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

  const pendingTodos = items.filter((i) => {
    const list = lists.find((l) => l.id === i.listId);
    return list?.type === 'TODO' && !i.isCompleted;
  }).length;

  // STRICT AUTH ENFORCEMENT: If user is not authenticated, do not show system content, show AuthModal only
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <AuthModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/60 font-sans antialiased text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* If a list is selected, show that specific detailed list screen */}
      {selectedList ? (
        <>
          {selectedList.type === 'SHOPPING' && (
            <ShoppingListView
              list={selectedList}
              onBack={() => setSelectedListId(null)}
              onOpenInvite={() => setInviteTargetList(selectedList)}
            />
          )}
          {selectedList.type === 'TODO' && (
            <TodoListView
              list={selectedList}
              onBack={() => setSelectedListId(null)}
              onOpenInvite={() => setInviteTargetList(selectedList)}
            />
          )}
          {selectedList.type === 'NOTE' && (
            <NoteListView
              list={selectedList}
              onBack={() => setSelectedListId(null)}
              onOpenInvite={() => setInviteTargetList(selectedList)}
            />
          )}
        </>
      ) : (
        <>
          {/* Main App Layout */}
          <Header onOpenCreateModal={() => setIsCreateOpen(true)} />

          <main className="max-w-4xl mx-auto px-4 pt-4 pb-28">
            {/* TAB: LISTELERİM (Home View) */}
            {activeTab === 'lists' && (
              <div className="space-y-4">
                {/* Hero Summary Cards for Quick Glance */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-4 rounded-3xl shadow-sm">
                    <div className="flex items-center gap-1.5 text-emerald-100 text-xs font-semibold mb-1">
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Alınacaklar Bütçesi</span>
                    </div>
                    <p className="text-xl sm:text-2xl font-black">
                      {totalShoppingBudget.toLocaleString('tr-TR')} ₺
                    </p>
                    <p className="text-[11px] text-emerald-200 mt-1">
                      Açık alışveriş listelerinde kalan
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-4 rounded-3xl shadow-sm">
                    <div className="flex items-center gap-1.5 text-indigo-200 text-xs font-semibold mb-1">
                      <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                      <span>Bekleyen Görevler</span>
                    </div>
                    <p className="text-xl sm:text-2xl font-black">
                      {pendingTodos} Görev
                    </p>
                    <p className="text-[11px] text-indigo-200 mt-1">
                      Tamamlanması gereken işler
                    </p>
                  </div>
                </div>

                {/* Search & Type Filter Tabs */}
                <div className="space-y-2.5">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Listelerde ara..."
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition shadow-2xs"
                    />
                  </div>

                  {/* List Type Tabs */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    <button
                      onClick={() => setSelectedTypeFilter('ALL')}
                      className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                        selectedTypeFilter === 'ALL'
                          ? 'bg-slate-900 text-white'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Tüm Listeler ({lists.length})
                    </button>
                    <button
                      onClick={() => setSelectedTypeFilter('SHOPPING')}
                      className={`whitespace-nowrap flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition border ${
                        selectedTypeFilter === 'SHOPPING'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-emerald-800 border-slate-200 hover:bg-emerald-50'
                      }`}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Alışveriş</span>
                    </button>
                    <button
                      onClick={() => setSelectedTypeFilter('TODO')}
                      className={`whitespace-nowrap flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition border ${
                        selectedTypeFilter === 'TODO'
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-white text-amber-800 border-slate-200 hover:bg-amber-50'
                      }`}
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Yapılacaklar</span>
                    </button>
                    <button
                      onClick={() => setSelectedTypeFilter('NOTE')}
                      className={`whitespace-nowrap flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition border ${
                        selectedTypeFilter === 'NOTE'
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-purple-800 border-slate-200 hover:bg-purple-50'
                      }`}
                    >
                      <StickyNote className="w-3.5 h-3.5" />
                      <span>Notlar</span>
                    </button>
                  </div>
                </div>

                {/* Lists Grid */}
                {filteredLists.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {filteredLists.map((list) => (
                      <ListCard
                        key={list.id}
                        list={list}
                        onOpenInvite={(l) => setInviteTargetList(l)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-300 p-6">
                    <p className="text-xs font-bold text-slate-700">Aramanıza uygun liste bulunamadı</p>
                    <button
                      onClick={() => setIsCreateOpen(true)}
                      className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Yeni Liste Aç</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB: ORTAK LİSTELER */}
            {activeTab === 'shared' && (
              <SharedListsView
                onOpenInvite={(l) => setInviteTargetList(l)}
                onOpenCreateModal={() => setIsCreateOpen(true)}
              />
            )}

            {/* TAB: HARCAMA ANALİZİ & RECHARTS */}
            {activeTab === 'analytics' && <AnalyticsView />}

            {/* TAB: AYARLAR */}
            {activeTab === 'settings' && <SettingsView />}
          </main>

          {/* Bottom Navigation */}
          <BottomNav />
        </>
      )}

      {/* Global Auth Modal (Login / Register) */}
      <AnimatePresence>
        <AuthModal />
      </AnimatePresence>

      {/* Change Password Modal */}
      <AnimatePresence>
        <ChangePasswordModal />
      </AnimatePresence>

      {/* Create List Modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <CreateListModal onClose={() => setIsCreateOpen(false)} />
        )}
      </AnimatePresence>

      {/* Invite Modal */}
      <AnimatePresence>
        {inviteTargetList && (
          <InviteModal
            list={inviteTargetList}
            onClose={() => setInviteTargetList(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
