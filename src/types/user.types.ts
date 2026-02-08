export type UserRole = 'viewer' | 'trainer' | 'admin';
export interface User { role: UserRole; }
export interface RolePermissions { canViewWorkouts: boolean; canViewExercises: boolean; canViewMeals: boolean; canManageWorkouts: boolean; canManageExercises: boolean; canManageMeals: boolean; canAccessAdmin: boolean; }
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  viewer: { canViewWorkouts: true, canViewExercises: true, canViewMeals: true, canManageWorkouts: false, canManageExercises: false, canManageMeals: false, canAccessAdmin: false },
  trainer: { canViewWorkouts: true, canViewExercises: true, canViewMeals: true, canManageWorkouts: true, canManageExercises: true, canManageMeals: true, canAccessAdmin: false },
  admin: { canViewWorkouts: true, canViewExercises: true, canViewMeals: true, canManageWorkouts: true, canManageExercises: true, canManageMeals: true, canAccessAdmin: true },
};
