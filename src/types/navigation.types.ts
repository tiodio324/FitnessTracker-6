export type PageId = 'home' | 'workouts' | 'exercises' | 'nutrition' | 'admin' | 'admin-workouts' | 'admin-exercises' | 'admin-meals';
export interface PageConfig { id: PageId; title: string; icon: string; requiresAuth: boolean; requiredRole?: 'trainer' | 'admin'; showInNav: boolean; parentId?: PageId; }
export const PAGES_CONFIG: Record<PageId, PageConfig> = {
  home: { id: 'home', title: 'Главная', icon: 'home', requiresAuth: false, showInNav: true },
  workouts: { id: 'workouts', title: 'Тренировки', icon: 'dumbbell', requiresAuth: false, showInNav: true },
  exercises: { id: 'exercises', title: 'Упражнения', icon: 'activity', requiresAuth: false, showInNav: true },
  nutrition: { id: 'nutrition', title: 'Питание', icon: 'utensils', requiresAuth: false, showInNav: true },
  admin: { id: 'admin', title: 'Администрирование', icon: 'settings', requiresAuth: true, requiredRole: 'admin', showInNav: true },
  'admin-workouts': { id: 'admin-workouts', title: 'Управление тренировками', icon: 'edit', requiresAuth: true, requiredRole: 'admin', showInNav: false, parentId: 'admin' },
  'admin-exercises': { id: 'admin-exercises', title: 'Управление упражнениями', icon: 'list', requiresAuth: true, requiredRole: 'admin', showInNav: false, parentId: 'admin' },
  'admin-meals': { id: 'admin-meals', title: 'Управление питанием', icon: 'clipboard', requiresAuth: true, requiredRole: 'admin', showInNav: false, parentId: 'admin' },
};
