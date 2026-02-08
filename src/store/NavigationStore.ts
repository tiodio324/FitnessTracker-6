import { makeAutoObservable } from 'mobx';
import { PageId, PageConfig, PAGES_CONFIG } from '@/types';
import { authStore } from './AuthStore';

export class NavigationStore {
  currentPage: PageId = 'home'; sidebarOpen = true; mobileMenuOpen = false;
  constructor() { makeAutoObservable(this, {}, { autoBind: true }); }
  get navigationItems(): PageConfig[] { return Object.values(PAGES_CONFIG).filter(p => { if (!p.showInNav) return false; if (p.requiresAuth && !authStore.isAuthenticated) return false; if (p.requiredRole === 'admin' && !authStore.isAdmin) return false; if (p.requiredRole === 'trainer' && !authStore.isTrainer) return false; return true; }); }
  get currentPageConfig(): PageConfig { return PAGES_CONFIG[this.currentPage]; }
  get pageTitle(): string { return this.currentPageConfig.title; }
  navigate = (pageId: PageId): void => { const p = PAGES_CONFIG[pageId]; if (!p) return; if (p.requiresAuth && !authStore.isAuthenticated) { authStore.openLoginModal(); return; } if (p.requiredRole === 'admin' && !authStore.isAdmin) return; this.currentPage = pageId; this.closeMobileMenu(); };
  toggleSidebar = (): void => { this.sidebarOpen = !this.sidebarOpen; };
  closeMobileMenu = (): void => { this.mobileMenuOpen = false; };
  toggleMobileMenu = (): void => { this.mobileMenuOpen = !this.mobileMenuOpen; };
}
export const navigationStore = new NavigationStore();
