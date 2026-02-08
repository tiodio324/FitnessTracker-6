export type WorkoutType = 'strength' | 'cardio' | 'flexibility' | 'hiit' | 'other';
export interface Workout { id: string; name: string; type: WorkoutType; duration: number; calories: number; exercises: string[]; date: string; notes?: string; isActive: boolean; createdAt: string; updatedAt: string; }
export interface WorkoutFormData { name: string; type: WorkoutType; duration: number; calories: number; exercises?: string[]; date: string; notes?: string; }
export const getWorkoutTypeLabel = (t: WorkoutType): string => ({ strength: 'Силовая', cardio: 'Кардио', flexibility: 'Гибкость', hiit: 'HIIT', other: 'Другое' }[t]);
