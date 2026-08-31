export type ListType = 'SHOPPING' | 'TODO' | 'NOTE';

export type Role = 'OWNER' | 'EDITOR';

export interface User {
  id: string;
  name: string;
  username: string;
  email?: string;
  avatar: string; // Emoji character, e.g. '🦊'
  color: string;
  password?: string;
  createdAt?: string;
  phone?: string;
  provider?: 'username';
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  bgLight: string;
  type: ListType;
}

export interface ListItem {
  id: string;
  listId: string;
  title: string;
  isCompleted: boolean;
  price: number; // for shopping
  quantity: number; // for shopping
  unit: string; // adet, kg, paket, lt, etc.
  categoryId: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH'; // for to-do
  dueDate?: string; // for to-do
  content?: string; // for notes
  isPinned?: boolean; // for notes
  assignedTo?: string; // user id
  completedBy?: string; // user id
  completedAt?: string;
  createdAt: string;
}

export interface ListMember {
  userId: string;
  role: Role;
  joinedAt: string;
}

export interface AppList {
  id: string;
  title: string;
  description?: string;
  type: ListType;
  ownerId: string;
  members: ListMember[];
  inviteCode: string;
  color: string;
  icon: string;
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseLog {
  id: string;
  userId: string;
  listId?: string;
  listTitle: string;
  amount: number;
  categoryId: string;
  categoryName: string;
  date: string; // ISO string e.g. "2026-08-30"
  itemCount: number;
  itemsSummary: string[];
}

export interface TemplateItem {
  id: string;
  title: string;
  price?: number;
  quantity?: number;
  unit?: string;
  categoryId?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  content?: string;
}

export interface ListTemplate {
  id: string;
  title: string;
  description?: string;
  type: ListType;
  icon: string;
  color: string;
  bgLight?: string;
  items: TemplateItem[];
  isCustom?: boolean;
  createdAt: string;
}

export type TabType = 'lists' | 'shared' | 'analytics' | 'settings';
