export type MuscleGroup = 'chest' | 'back' | 'legs' | 'arms' | 'shoulders' | 'core' | 'full_body';
export interface Exercise { id: string; name: string; muscleGroup: MuscleGroup; description?: string; videoUrl?: string; isActive: boolean; createdAt: string; updatedAt: string; }
export interface ExerciseFormData { name: string; muscleGroup: MuscleGroup; description?: string; videoUrl?: string; }
export const getMuscleGroupLabel = (m: MuscleGroup): string => ({ chest: 'Грудь', back: 'Спина', legs: 'Ноги', arms: 'Руки', shoulders: 'Плечи', core: 'Кор', full_body: 'Всё тело' }[m]);
