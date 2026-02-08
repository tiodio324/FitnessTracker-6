export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export interface Meal { id: string; name: string; type: MealType; calories: number; protein: number; carbs: number; fat: number; date: string; isActive: boolean; createdAt: string; updatedAt: string; }
export interface MealFormData { name: string; type: MealType; calories: number; protein: number; carbs: number; fat: number; date: string; }
export const getMealTypeLabel = (t: MealType): string => ({ breakfast: 'Завтрак', lunch: 'Обед', dinner: 'Ужин', snack: 'Перекус' }[t]);
