import { create } from 'zustand';
import {
  INITIAL_CATEGORIES,
  INITIAL_EXPENSES,
  INITIAL_ITEMS,
  INITIAL_LISTS,
  INITIAL_TEMPLATES,
  INITIAL_USERS,
} from '../data/initialData';
import { DEFAULT_AVATAR } from '../data/emojis';
import { AppList, Category, ExpenseLog, ListItem, ListTemplate, ListType, TabType, User } from '../types';
import {
  handleZodValidation,
  loginSchema,
  registerSchema,
  changePasswordSchema,
  inviteUserSchema,
  formatBilingualMessage,
  BilingualError,
} from '../lib/validations';

interface AppState {
  // Authentication & Session
  isAuthenticated: boolean;
  currentUser: User;
  users: User[];
  authModalOpen: boolean;
  authModalMode: 'login' | 'register';
  changePasswordModalOpen: boolean;
  sessionToken: string | null;

  // Navigation & View
  activeTab: TabType;
  selectedListId: string | null;

  // Core Data
  categories: Category[];
  templates: ListTemplate[];
  lists: AppList[];
  items: ListItem[];
  expenses: ExpenseLog[];
  monthlyBudget: number; // in TRY

  // Filter / Search
  searchQuery: string;
  selectedCategoryId: string | null;
  analyticsMonth: string; // "2026-08"

  // Auth Actions
  setAuthModalOpen: (open: boolean, mode?: 'login' | 'register') => void;
  setChangePasswordModalOpen: (open: boolean) => void;
  login: (credentials: { username: string; password?: string; rememberMe?: boolean }) => Promise<{ success: boolean; error?: string; bilingualError?: BilingualError }>;
  register: (data: { name: string; username: string; password?: string; confirmPassword?: string; avatar?: string; color?: string }) => Promise<{ success: boolean; error?: string; bilingualError?: BilingualError }>;
  changePassword: (data: { oldPassword: string; newPassword: string; confirmPassword: string }) => Promise<{ success: boolean; error?: string; bilingualError?: BilingualError }>;
  logout: () => void;
  updateUserProfile: (updates: Partial<User>) => void;

  // Navigation Actions
  setActiveTab: (tab: TabType) => void;
  setSelectedListId: (id: string | null) => void;
  setCurrentUser: (user: User) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategoryId: (id: string | null) => void;
  setAnalyticsMonth: (month: string) => void;
  setMonthlyBudget: (amount: number) => void;

  // List Actions
  createList: (data: { title: string; description?: string; type: ListType; color: string; icon: string }) => string;
  updateList: (id: string, updates: Partial<AppList>) => void;
  deleteList: (id: string) => void;
  inviteUserToList: (listId: string, emailOrCode: string) => { success: boolean; message: string; bilingualMessage?: BilingualError };

  // Item Actions
  addItem: (item: Omit<ListItem, 'id' | 'createdAt'>) => void;
  updateItem: (id: string, updates: Partial<ListItem>) => void;
  toggleItemComplete: (id: string) => void;
  deleteItem: (id: string) => void;
  uncheckAllItems: (listId: string) => void;
  clearCompletedItems: (listId: string) => void;

  // Shopping Checkout Action (Archive completed items into expenses)
  checkoutShoppingList: (listId: string) => { totalAmount: number; itemCount: number };

  // Category Actions
  addCategory: (category: Category) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Template Actions
  addTemplate: (template: ListTemplate) => void;
  updateTemplate: (id: string, updates: Partial<ListTemplate>) => void;
  deleteTemplate: (id: string) => void;
  createListFromTemplate: (templateId: string, customTitle?: string) => string;

  // Reset Data
  resetToDefaultData: () => void;
}

const LOCAL_STORAGE_KEY = 'akilli_liste_app_state_v5';
const SESSION_STORAGE_KEY = 'better_auth_session_user_v5';

const getInitialState = () => {
  try {
    const saved =
      localStorage.getItem(LOCAL_STORAGE_KEY) ||
      localStorage.getItem('akilli_liste_app_state_v4') ||
      localStorage.getItem('akilli_liste_app_state_v3');

    const sessionSaved = localStorage.getItem(SESSION_STORAGE_KEY);
    const sessionUser = sessionSaved ? JSON.parse(sessionSaved) : null;

    if (saved) {
      const parsed = JSON.parse(saved);
      const hasTypedCategories = parsed.categories && parsed.categories.some((c: Category) => c.type === 'TODO');
      const rawUsers: User[] = parsed.users && parsed.users.length > 0 ? parsed.users : INITIAL_USERS;
      const loadedUsers = rawUsers.map((u, idx) => ({
        ...u,
        avatar: u.avatar && !u.avatar.startsWith('http') ? u.avatar : (INITIAL_USERS[idx]?.avatar || DEFAULT_AVATAR),
        username: u.username || (u.email ? u.email.split('@')[0] : `user_${idx + 1}`),
        provider: 'username' as const,
      }));

      const rawCurrentUser = sessionUser || parsed.currentUser || loadedUsers[0];
      const currentUser: User = {
        ...rawCurrentUser,
        avatar: rawCurrentUser.avatar && !rawCurrentUser.avatar.startsWith('http') ? rawCurrentUser.avatar : DEFAULT_AVATAR,
        username: rawCurrentUser.username || (rawCurrentUser.email ? rawCurrentUser.email.split('@')[0] : 'kullanici'),
        provider: 'username',
      };

      return {
        lists: parsed.lists || INITIAL_LISTS,
        items: parsed.items || INITIAL_ITEMS,
        expenses: parsed.expenses || INITIAL_EXPENSES,
        categories: hasTypedCategories ? parsed.categories : INITIAL_CATEGORIES,
        templates: parsed.templates && parsed.templates.length > 0 ? parsed.templates : INITIAL_TEMPLATES,
        monthlyBudget: parsed.monthlyBudget || 10000,
        users: loadedUsers,
        currentUser,
        isAuthenticated: sessionUser ? true : (parsed.isAuthenticated !== undefined ? parsed.isAuthenticated : true),
      };
    }
  } catch (e) {
    console.error('LocalStorage parse error', e);
  }

  return {
    lists: INITIAL_LISTS,
    items: INITIAL_ITEMS,
    expenses: INITIAL_EXPENSES,
    categories: INITIAL_CATEGORIES,
    templates: INITIAL_TEMPLATES,
    monthlyBudget: 10000,
    users: INITIAL_USERS,
    currentUser: INITIAL_USERS[0],
    isAuthenticated: true,
  };
};

const initialPersisted = getInitialState();

export const useAppStore = create<AppState>((set, get) => {
  const persist = () => {
    try {
      const state = get();
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          lists: state.lists,
          items: state.items,
          expenses: state.expenses,
          categories: state.categories,
          templates: state.templates,
          monthlyBudget: state.monthlyBudget,
          currentUser: state.currentUser,
          users: state.users,
          isAuthenticated: state.isAuthenticated,
        })
      );
      if (state.isAuthenticated && state.currentUser) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state.currentUser));
      } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch (e) {
      console.error('LocalStorage save error', e);
    }
  };

  return {
    // Auth initial states
    isAuthenticated: initialPersisted.isAuthenticated,
    currentUser: initialPersisted.currentUser,
    users: initialPersisted.users,
    authModalOpen: !initialPersisted.isAuthenticated,
    authModalMode: 'login',
    changePasswordModalOpen: false,
    sessionToken: 'auth_sess_' + Math.random().toString(36).substring(2, 9),

    // Navigation & Data
    activeTab: 'lists',
    selectedListId: null,
    categories: initialPersisted.categories,
    templates: initialPersisted.templates,
    lists: initialPersisted.lists,
    items: initialPersisted.items,
    expenses: initialPersisted.expenses,
    monthlyBudget: initialPersisted.monthlyBudget,
    searchQuery: '',
    selectedCategoryId: null,
    analyticsMonth: '2026-08',

    setAuthModalOpen: (open, mode = 'login') => {
      set({ authModalOpen: open, authModalMode: mode });
    },

    setChangePasswordModalOpen: (open) => {
      set({ changePasswordModalOpen: open });
    },

    login: async ({ username, password, rememberMe }) => {
      // Run Zod validation
      const val = handleZodValidation(loginSchema, { username, password, rememberMe });
      if (!val.success && val.error) {
        return {
          success: false,
          error: formatBilingualMessage(val.error),
          bilingualError: val.error,
        };
      }

      const state = get();
      const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');
      const existingUser = state.users.find(
        (u) =>
          (u.username && u.username.toLowerCase() === cleanUsername) ||
          (u.email && u.email.toLowerCase() === cleanUsername) ||
          u.name.toLowerCase() === cleanUsername
      );

      if (!existingUser) {
        const err: BilingualError = {
          tr: 'Bu kullanıcı adına ait kayıtlı bir hesap bulunamadı.',
          en: 'No registered account found with this username.',
        };
        return { success: false, error: formatBilingualMessage(err), bilingualError: err };
      }

      // Check password if set
      if (existingUser.password && password && existingUser.password !== password) {
        const err: BilingualError = {
          tr: 'Girdiğiniz şifre hatalı. Lütfen tekrar deneyin.',
          en: 'Incorrect password. Please try again.',
        };
        return { success: false, error: formatBilingualMessage(err), bilingualError: err };
      }

      set({
        currentUser: existingUser,
        isAuthenticated: true,
        authModalOpen: false,
      });
      persist();
      return { success: true };
    },

    register: async ({ name, username, password, confirmPassword, avatar, color }) => {
      // Run Zod validation
      const val = handleZodValidation(registerSchema, {
        name,
        username,
        password,
        confirmPassword: confirmPassword || password,
        avatar: avatar || DEFAULT_AVATAR,
        color,
      });

      if (!val.success && val.error) {
        return {
          success: false,
          error: formatBilingualMessage(val.error),
          bilingualError: val.error,
        };
      }

      const state = get();
      const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');
      const trimmedName = name.trim();

      const alreadyExists = state.users.some(
        (u) => u.username?.toLowerCase() === cleanUsername
      );
      if (alreadyExists) {
        const err: BilingualError = {
          tr: 'Bu kullanıcı adı zaten kullanılıyor. Lütfen başka bir kullanıcı adı seçin.',
          en: 'This username is already taken. Please choose another username.',
        };
        return { success: false, error: formatBilingualMessage(err), bilingualError: err };
      }

      const randomColors = ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4'];
      const pickedColor = color || randomColors[Math.floor(Math.random() * randomColors.length)];

      const newUser: User = {
        id: `user-${Date.now()}`,
        name: trimmedName,
        username: cleanUsername,
        password: password || 'password123',
        avatar: avatar || DEFAULT_AVATAR,
        color: pickedColor,
        createdAt: new Date().toISOString().split('T')[0],
        provider: 'username',
      };

      set((s) => ({
        users: [...s.users, newUser],
        currentUser: newUser,
        isAuthenticated: true,
        authModalOpen: false,
      }));
      persist();
      return { success: true };
    },

    changePassword: async ({ oldPassword, newPassword, confirmPassword }) => {
      // Run Zod validation
      const val = handleZodValidation(changePasswordSchema, {
        oldPassword,
        newPassword,
        confirmPassword,
      });

      if (!val.success && val.error) {
        return {
          success: false,
          error: formatBilingualMessage(val.error),
          bilingualError: val.error,
        };
      }

      const state = get();
      const user = state.currentUser;

      if (!user) {
        const err: BilingualError = {
          tr: 'Oturum açmış kullanıcı bulunamadı.',
          en: 'No active logged-in user found.',
        };
        return { success: false, error: formatBilingualMessage(err), bilingualError: err };
      }

      // Check current / old password
      if (user.password && user.password !== oldPassword) {
        const err: BilingualError = {
          tr: 'Mevcut (eski) şifreniz hatalı. Lütfen kontrol edip tekrar deneyin.',
          en: 'Current password is incorrect. Please check and retry.',
        };
        return { success: false, error: formatBilingualMessage(err), bilingualError: err };
      }

      // Update password
      state.updateUserProfile({ password: newPassword });
      return { success: true };
    },

    logout: () => {
      set({
        isAuthenticated: false,
        authModalOpen: true,
        authModalMode: 'login',
      });
      localStorage.removeItem(SESSION_STORAGE_KEY);
      persist();
    },

    updateUserProfile: (updates) => {
      set((state) => {
        const updatedCurrent = { ...state.currentUser, ...updates };
        const updatedUsers = state.users.map((u) => (u.id === updatedCurrent.id ? updatedCurrent : u));
        return {
          currentUser: updatedCurrent,
          users: updatedUsers,
        };
      });
      persist();
    },

    // Navigation & Filter Actions
    setActiveTab: (tab) => set({ activeTab: tab, selectedListId: null }),
    setSelectedListId: (id) => set({ selectedListId: id }),
    setCurrentUser: (user) => {
      set({ currentUser: user });
      persist();
    },
    setSearchQuery: (query) => set({ searchQuery: query }),
    setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
    setAnalyticsMonth: (month) => set({ analyticsMonth: month }),
    setMonthlyBudget: (amount) => {
      set({ monthlyBudget: amount });
      persist();
    },

    // List Actions
    createList: (data) => {
      const state = get();
      const id = `list-${Date.now()}`;
      const code = Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
      
      const newList: AppList = {
        id,
        title: data.title,
        description: data.description,
        type: data.type,
        color: data.color,
        icon: data.icon,
        ownerId: state.currentUser.id,
        inviteCode: code,
        members: [
          {
            userId: state.currentUser.id,
            role: 'OWNER',
            joinedAt: new Date().toISOString().split('T')[0],
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      set((s) => ({
        lists: [newList, ...s.lists],
        selectedListId: id,
      }));
      persist();
      return id;
    },

    updateList: (id, updates) => {
      set((state) => ({
        lists: state.lists.map((l) =>
          l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
        ),
      }));
      persist();
    },

    deleteList: (id) => {
      set((state) => ({
        lists: state.lists.filter((l) => l.id !== id),
        items: state.items.filter((i) => i.listId !== id),
        selectedListId: state.selectedListId === id ? null : state.selectedListId,
      }));
      persist();
    },

    inviteUserToList: (listId, emailOrCode) => {
      const state = get();
      const targetList = state.lists.find((l) => l.id === listId);
      if (!targetList) {
        const err = { tr: 'Liste bulunamadı.', en: 'List not found.' };
        return { success: false, message: formatBilingualMessage(err), bilingualMessage: err };
      }

      const cleanInput = emailOrCode.trim().toLowerCase().replace(/^@/, '');
      const foundUser = state.users.find(
        (u) =>
          u.username?.toLowerCase() === cleanInput ||
          u.email?.toLowerCase() === cleanInput ||
          u.name.toLowerCase() === cleanInput
      );

      if (!foundUser) {
        const err = {
          tr: 'Bu kullanıcı adına veya e-postaya ait bir hesap bulunamadı.',
          en: 'No registered user found with this username or email.',
        };
        return { success: false, message: formatBilingualMessage(err), bilingualMessage: err };
      }

      if (targetList.members.some((m) => m.userId === foundUser.id)) {
        const err = {
          tr: `${foundUser.name} zaten bu listenin üyesi.`,
          en: `${foundUser.name} is already a member of this list.`,
        };
        return { success: false, message: formatBilingualMessage(err), bilingualMessage: err };
      }

      const updatedMembers = [
        ...targetList.members,
        {
          userId: foundUser.id,
          role: 'EDITOR' as const,
          joinedAt: new Date().toISOString().split('T')[0],
        },
      ];

      set((s) => ({
        lists: s.lists.map((l) =>
          l.id === listId ? { ...l, members: updatedMembers, updatedAt: new Date().toISOString() } : l
        ),
      }));
      persist();

      const successMsg = {
        tr: `${foundUser.name} başarıyla listeye eklendi!`,
        en: `${foundUser.name} was successfully added to the list!`,
      };
      return { success: true, message: formatBilingualMessage(successMsg), bilingualMessage: successMsg };
    },

    // Item Actions
    addItem: (itemData) => {
      const newItem: ListItem = {
        ...itemData,
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        createdAt: new Date().toISOString(),
      };

      set((state) => ({
        items: [newItem, ...state.items],
        lists: state.lists.map((l) =>
          l.id === itemData.listId ? { ...l, updatedAt: new Date().toISOString() } : l
        ),
      }));
      persist();
    },

    updateItem: (id, updates) => {
      set((state) => ({
        items: state.items.map((i) => (i.id === id ? { ...i, ...updates } : i)),
      }));
      persist();
    },

    toggleItemComplete: (id) => {
      const state = get();
      const currentItem = state.items.find((i) => i.id === id);
      if (!currentItem) return;

      const nextCompleted = !currentItem.isCompleted;

      set((s) => ({
        items: s.items.map((i) =>
          i.id === id
            ? {
                ...i,
                isCompleted: nextCompleted,
                completedBy: nextCompleted ? s.currentUser.id : undefined,
                completedAt: nextCompleted ? new Date().toISOString() : undefined,
              }
            : i
        ),
      }));
      persist();
    },

    deleteItem: (id) => {
      set((state) => ({
        items: state.items.filter((i) => i.id !== id),
      }));
      persist();
    },

    uncheckAllItems: (listId) => {
      set((state) => ({
        items: state.items.map((i) =>
          i.listId === listId
            ? { ...i, isCompleted: false, completedBy: undefined, completedAt: undefined }
            : i
        ),
      }));
      persist();
    },

    clearCompletedItems: (listId) => {
      set((state) => ({
        items: state.items.filter((i) => !(i.listId === listId && i.isCompleted)),
      }));
      persist();
    },

    // Shopping Checkout
    checkoutShoppingList: (listId) => {
      const state = get();
      const list = state.lists.find((l) => l.id === listId);
      if (!list) return { totalAmount: 0, itemCount: 0 };

      const completedItems = state.items.filter((i) => i.listId === listId && i.isCompleted);
      if (completedItems.length === 0) return { totalAmount: 0, itemCount: 0 };

      const totalAmount = completedItems.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
        0
      );

      // Group into expense by dominant category or generic
      const firstCat = state.categories.find((c) => c.id === completedItems[0]?.categoryId);

      const newExpense: ExpenseLog = {
        id: `exp-${Date.now()}`,
        userId: state.currentUser.id,
        listId: list.id,
        listTitle: list.title,
        amount: totalAmount,
        categoryId: firstCat?.id || 'cat-market',
        categoryName: firstCat?.name || 'Süpermarket & Gıda',
        date: new Date().toISOString().split('T')[0],
        itemCount: completedItems.length,
        itemsSummary: completedItems.map((i) => `${i.title} (${i.quantity || 1} ${i.unit || 'adet'})`),
      };

      set((s) => ({
        expenses: [newExpense, ...s.expenses],
        items: s.items.filter((i) => !(i.listId === listId && i.isCompleted)),
        lists: s.lists.map((l) =>
          l.id === listId ? { ...l, updatedAt: new Date().toISOString() } : l
        ),
      }));
      persist();

      return { totalAmount, itemCount: completedItems.length };
    },

    // Category Actions
    addCategory: (category) => {
      set((state) => ({
        categories: [...state.categories, category],
      }));
      persist();
    },

    updateCategory: (id, updates) => {
      set((state) => ({
        categories: state.categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      }));
      persist();
    },

    deleteCategory: (id) => {
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
      }));
      persist();
    },

    // Template Actions
    addTemplate: (template) => {
      set((state) => ({
        templates: [template, ...state.templates],
      }));
      persist();
    },

    updateTemplate: (id, updates) => {
      set((state) => ({
        templates: state.templates.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      }));
      persist();
    },

    deleteTemplate: (id) => {
      set((state) => ({
        templates: state.templates.filter((t) => t.id !== id),
      }));
      persist();
    },

    createListFromTemplate: (templateId, customTitle) => {
      const state = get();
      const template = state.templates.find((t) => t.id === templateId);
      if (!template) return '';

      const listId = `list-${Date.now()}`;
      const code = Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);

      const newList: AppList = {
        id: listId,
        title: customTitle || template.title,
        description: template.description || 'Şablondan otomatik oluşturuldu',
        type: template.type,
        color: template.color,
        icon: template.icon,
        ownerId: state.currentUser.id,
        inviteCode: code,
        members: [
          {
            userId: state.currentUser.id,
            role: 'OWNER',
            joinedAt: new Date().toISOString().split('T')[0],
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const newItems: ListItem[] = template.items.map((item, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        listId,
        title: item.title,
        isCompleted: false,
        price: item.price || 0,
        quantity: item.quantity || 1,
        unit: item.unit || 'adet',
        categoryId: item.categoryId || (template.type === 'SHOPPING' ? 'cat-market' : template.type === 'TODO' ? 'cat-todo-ev' : 'cat-note-fikir'),
        priority: item.priority || 'MEDIUM',
        content: item.content || '',
        createdAt: new Date().toISOString(),
      }));

      set((s) => ({
        lists: [newList, ...s.lists],
        items: [...newItems, ...s.items],
        selectedListId: listId,
        activeTab: 'lists',
      }));
      persist();

      return listId;
    },

    resetToDefaultData: () => {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem(SESSION_STORAGE_KEY);
      set({
        lists: INITIAL_LISTS,
        items: INITIAL_ITEMS,
        expenses: INITIAL_EXPENSES,
        categories: INITIAL_CATEGORIES,
        templates: INITIAL_TEMPLATES,
        monthlyBudget: 10000,
        currentUser: INITIAL_USERS[0],
        users: INITIAL_USERS,
        isAuthenticated: true,
      });
    },
  };
});
