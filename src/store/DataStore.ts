import { makeAutoObservable, runInAction } from 'mobx';
import { v4 as uuidv4 } from 'uuid';
import { Workout, WorkoutFormData, Exercise, ExerciseFormData, Meal, MealFormData, FilterParams } from '@/types';
import FirebaseService from '@/firebase';
import { authStore } from './AuthStore';

export class DataStore {
  workouts: Workout[] = []; exercises: Exercise[] = []; meals: Meal[] = [];
  workoutsLoading = false; exercisesLoading = false; mealsLoading = false;
  error: string | null = null; filters: FilterParams = {};

  constructor() { makeAutoObservable(this, {}, { autoBind: true }); }

  get filteredWorkouts(): Workout[] { let r = this.workouts.filter(w => w.isActive); if (this.filters.type) r = r.filter(w => w.type === this.filters.type); if (this.filters.search) { const s = this.filters.search.toLowerCase(); r = r.filter(w => w.name.toLowerCase().includes(s)); } return r.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); }
  get activeExercises(): Exercise[] { return this.exercises.filter(e => e.isActive).sort((a, b) => a.name.localeCompare(b.name, 'ru')); }
  get todayMeals(): Meal[] { const today = new Date().toISOString().split('T')[0]; return this.meals.filter(m => m.isActive && m.date.startsWith(today)); }
  get todayCalories(): number { return this.todayMeals.reduce((s, m) => s + m.calories, 0); }
  get weekWorkouts(): Workout[] { const week = Date.now() - 7 * 24 * 60 * 60 * 1000; return this.workouts.filter(w => w.isActive && new Date(w.date).getTime() > week); }

  getExerciseById = (id: string): Exercise | undefined => this.exercises.find(e => e.id === id);

  loadAllData = async (): Promise<void> => { await Promise.all([this.loadWorkouts(), this.loadExercises(), this.loadMeals()]); };

  loadWorkouts = async (): Promise<void> => { this.workoutsLoading = true; try { const d = await FirebaseService.getData<Record<string, Workout>>('workouts'); runInAction(() => { this.workouts = d ? Object.values(d) : []; this.workoutsLoading = false; }); } catch { runInAction(() => { this.error = 'Ошибка загрузки тренировок'; this.workoutsLoading = false; }); } };
  loadExercises = async (): Promise<void> => { this.exercisesLoading = true; try { const d = await FirebaseService.getData<Record<string, Exercise>>('exercises'); runInAction(() => { this.exercises = d ? Object.values(d) : []; this.exercisesLoading = false; }); } catch { runInAction(() => { this.error = 'Ошибка загрузки упражнений'; this.exercisesLoading = false; }); } };
  loadMeals = async (): Promise<void> => { this.mealsLoading = true; try { const d = await FirebaseService.getData<Record<string, Meal>>('meals'); runInAction(() => { this.meals = d ? Object.values(d) : []; this.mealsLoading = false; }); } catch { runInAction(() => { this.error = 'Ошибка загрузки питания'; this.mealsLoading = false; }); } };

  createWorkout = async (data: WorkoutFormData): Promise<Workout | null> => { if (!authStore.canManageWorkouts()) return null; const now = new Date().toISOString(); const w: Workout = { id: uuidv4(), ...data, notes: data.notes || '', exercises: data.exercises || [], isActive: true, createdAt: now, updatedAt: now }; try { await FirebaseService.setData(`workouts/${w.id}`, w); runInAction(() => { this.workouts.push(w); }); return w; } catch { return null; } };
  updateWorkout = async (id: string, data: Partial<WorkoutFormData>): Promise<boolean> => { if (!authStore.canManageWorkouts()) return false; const i = this.workouts.findIndex(w => w.id === id); if (i === -1) return false; const u = { ...this.workouts[i], ...data, updatedAt: new Date().toISOString() }; try { await FirebaseService.setData(`workouts/${id}`, u); runInAction(() => { this.workouts[i] = u; }); return true; } catch { return false; } };
  deleteWorkout = async (id: string): Promise<boolean> => { if (!authStore.canManageWorkouts()) return false; const i = this.workouts.findIndex(w => w.id === id); if (i === -1) return false; try { await FirebaseService.updateData(`workouts/${id}`, { isActive: false }); runInAction(() => { this.workouts[i].isActive = false; }); return true; } catch { return false; } };

  createExercise = async (data: ExerciseFormData): Promise<Exercise | null> => { if (!authStore.canManageExercises()) return null; const now = new Date().toISOString(); const e: Exercise = { id: uuidv4(), ...data, description: data.description || '', videoUrl: data.videoUrl || '', isActive: true, createdAt: now, updatedAt: now }; try { await FirebaseService.setData(`exercises/${e.id}`, e); runInAction(() => { this.exercises.push(e); }); return e; } catch { return null; } };
  updateExercise = async (id: string, data: Partial<ExerciseFormData>): Promise<boolean> => { if (!authStore.canManageExercises()) return false; const i = this.exercises.findIndex(e => e.id === id); if (i === -1) return false; const u = { ...this.exercises[i], ...data, updatedAt: new Date().toISOString() }; try { await FirebaseService.setData(`exercises/${id}`, u); runInAction(() => { this.exercises[i] = u; }); return true; } catch { return false; } };
  deleteExercise = async (id: string): Promise<boolean> => { if (!authStore.canManageExercises()) return false; const i = this.exercises.findIndex(e => e.id === id); if (i === -1) return false; try { await FirebaseService.updateData(`exercises/${id}`, { isActive: false }); runInAction(() => { this.exercises[i].isActive = false; }); return true; } catch { return false; } };

  createMeal = async (data: MealFormData): Promise<Meal | null> => { if (!authStore.canManageMeals()) return null; const now = new Date().toISOString(); const m: Meal = { id: uuidv4(), ...data, isActive: true, createdAt: now, updatedAt: now }; try { await FirebaseService.setData(`meals/${m.id}`, m); runInAction(() => { this.meals.push(m); }); return m; } catch { return null; } };
  deleteMeal = async (id: string): Promise<boolean> => { if (!authStore.canManageMeals()) return false; const i = this.meals.findIndex(m => m.id === id); if (i === -1) return false; try { await FirebaseService.updateData(`meals/${id}`, { isActive: false }); runInAction(() => { this.meals[i].isActive = false; }); return true; } catch { return false; } };

  setFilter = (key: keyof FilterParams, value: string | undefined): void => { this.filters = { ...this.filters, [key]: value }; };
  clearFilters = (): void => { this.filters = {}; };
  clearError = (): void => { this.error = null; };
}

export const dataStore = new DataStore();
