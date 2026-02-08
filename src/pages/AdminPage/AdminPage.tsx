import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { dataStore, uiStore } from '@/store';
import { Card, Button, Table, Modal, Input, Select } from '@/components/UI';
import type { TableColumn } from '@/components/UI';
import type { Workout, Exercise, Meal, WorkoutFormData, ExerciseFormData, MealFormData, WorkoutType, MuscleGroup, MealType } from '@/types';
import { getWorkoutTypeLabel, getMuscleGroupLabel, getMealTypeLabel } from '@/types';
import styles from './AdminPage.module.scss';

type AdminTab = 'workouts' | 'exercises' | 'meals';

const workoutTypeOptions = [{ value: 'strength', label: 'Силовая' }, { value: 'cardio', label: 'Кардио' }, { value: 'flexibility', label: 'Гибкость' }, { value: 'hiit', label: 'HIIT' }, { value: 'other', label: 'Другое' }];
const muscleGroupOptions = [{ value: 'chest', label: 'Грудь' }, { value: 'back', label: 'Спина' }, { value: 'legs', label: 'Ноги' }, { value: 'arms', label: 'Руки' }, { value: 'shoulders', label: 'Плечи' }, { value: 'core', label: 'Кор' }, { value: 'full_body', label: 'Всё тело' }];
const mealTypeOptions = [{ value: 'breakfast', label: 'Завтрак' }, { value: 'lunch', label: 'Обед' }, { value: 'dinner', label: 'Ужин' }, { value: 'snack', label: 'Перекус' }];

export const AdminPage = observer(() => {
  const { workouts, exercises, meals, workoutsLoading, exercisesLoading, mealsLoading, createWorkout, updateWorkout, deleteWorkout, createExercise, updateExercise, deleteExercise, createMeal, deleteMeal } = dataStore;
  const [activeTab, setActiveTab] = useState<AdminTab>('workouts');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [workoutForm, setWorkoutForm] = useState<WorkoutFormData>({ name: '', type: 'strength', duration: 30, calories: 0, exercises: [], date: new Date().toISOString().split('T')[0], notes: '' });
  const [exerciseForm, setExerciseForm] = useState<ExerciseFormData>({ name: '', muscleGroup: 'chest', description: '', videoUrl: '' });
  const [mealForm, setMealForm] = useState<MealFormData>({ name: '', type: 'breakfast', calories: 0, protein: 0, carbs: 0, fat: 0, date: new Date().toISOString().split('T')[0] });

  const resetForms = () => {
    setWorkoutForm({ name: '', type: 'strength', duration: 30, calories: 0, exercises: [], date: new Date().toISOString().split('T')[0], notes: '' });
    setExerciseForm({ name: '', muscleGroup: 'chest', description: '', videoUrl: '' });
    setMealForm({ name: '', type: 'breakfast', calories: 0, protein: 0, carbs: 0, fat: 0, date: new Date().toISOString().split('T')[0] });
    setEditingId(null);
  };

  const openCreateModal = () => { resetForms(); setModalMode('create'); setModalOpen(true); };
  const openEditModal = (item: Workout | Exercise | Meal) => {
    setModalMode('edit'); setEditingId(item.id);
    if (activeTab === 'workouts') { const w = item as Workout; setWorkoutForm({ name: w.name, type: w.type, duration: w.duration, calories: w.calories, exercises: w.exercises, date: w.date.split('T')[0], notes: w.notes || '' }); }
    else if (activeTab === 'exercises') { const e = item as Exercise; setExerciseForm({ name: e.name, muscleGroup: e.muscleGroup, description: e.description || '', videoUrl: e.videoUrl || '' }); }
    else { const m = item as Meal; setMealForm({ name: m.name, type: m.type, calories: m.calories, protein: m.protein, carbs: m.carbs, fat: m.fat, date: m.date.split('T')[0] }); }
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (activeTab === 'workouts') {
        if (!workoutForm.name) { uiStore.showError('Введите название'); return; }
        if (modalMode === 'create') await createWorkout(workoutForm); else if (editingId) await updateWorkout(editingId, workoutForm);
      } else if (activeTab === 'exercises') {
        if (!exerciseForm.name) { uiStore.showError('Введите название'); return; }
        if (modalMode === 'create') await createExercise(exerciseForm); else if (editingId) await updateExercise(editingId, exerciseForm);
      } else {
        if (!mealForm.name) { uiStore.showError('Введите название'); return; }
        if (modalMode === 'create') await createMeal(mealForm);
      }
      uiStore.showSuccess(modalMode === 'create' ? 'Запись добавлена' : 'Запись обновлена');
      setModalOpen(false); resetForms();
    } catch { uiStore.showError('Ошибка сохранения'); }
  };

  const handleDelete = (id: string) => {
    uiStore.showConfirm('Удаление', 'Удалить эту запись?', async () => {
      if (activeTab === 'workouts') await deleteWorkout(id);
      else if (activeTab === 'exercises') await deleteExercise(id);
      else await deleteMeal(id);
      uiStore.showSuccess('Запись удалена');
    });
  };

  const actionButtons = (row: Workout | Exercise | Meal) => (
    <div className={styles.actions}>
      <Button size="sm" variant="ghost" onClick={() => openEditModal(row)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg></Button>
      <Button size="sm" variant="ghost" onClick={() => handleDelete(row.id)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg></Button>
    </div>
  );

  const workoutColumns: TableColumn<Workout>[] = [
    { key: 'date', title: 'Дата', width: '100px', render: (v: unknown) => new Date(v as string).toLocaleDateString('ru-RU') },
    { key: 'name', title: 'Название' },
    { key: 'type', title: 'Тип', render: (v: unknown) => getWorkoutTypeLabel(v as WorkoutType) },
    { key: 'duration', title: 'Мин.', width: '70px' },
    { key: 'actions', title: '', width: '100px', render: (_: unknown, r: Workout) => actionButtons(r) },
  ];

  const exerciseColumns: TableColumn<Exercise>[] = [
    { key: 'name', title: 'Название' },
    { key: 'muscleGroup', title: 'Группа мышц', render: (v: unknown) => getMuscleGroupLabel(v as MuscleGroup) },
    { key: 'description', title: 'Описание', render: (v: unknown) => (v as string)?.substring(0, 40) || '—' },
    { key: 'actions', title: '', width: '100px', render: (_: unknown, r: Exercise) => actionButtons(r) },
  ];

  const mealColumns: TableColumn<Meal>[] = [
    { key: 'date', title: 'Дата', width: '100px', render: (v: unknown) => new Date(v as string).toLocaleDateString('ru-RU') },
    { key: 'name', title: 'Название' },
    { key: 'type', title: 'Тип', render: (v: unknown) => getMealTypeLabel(v as MealType) },
    { key: 'calories', title: 'Ккал', width: '70px' },
    { key: 'actions', title: '', width: '100px', render: (_: unknown, r: Meal) => actionButtons(r) },
  ];

  const getModalTitle = () => {
    const action = modalMode === 'create' ? 'Добавить' : 'Редактировать';
    const entity = activeTab === 'workouts' ? 'тренировку' : activeTab === 'exercises' ? 'упражнение' : 'приём пищи';
    return `${action} ${entity}`;
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}><h1 className={styles.title}>Администрирование</h1><p className={styles.subtitle}>Управление данными системы</p></div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === 'workouts' ? styles.active : ''}`} onClick={() => setActiveTab('workouts')}>Тренировки</button>
        <button className={`${styles.tab} ${activeTab === 'exercises' ? styles.active : ''}`} onClick={() => setActiveTab('exercises')}>Упражнения</button>
        <button className={`${styles.tab} ${activeTab === 'meals' ? styles.active : ''}`} onClick={() => setActiveTab('meals')}>Питание</button>
      </div>

      <Card className={styles.toolbar}>
        <Button variant="primary" onClick={openCreateModal}>Добавить {activeTab === 'workouts' ? 'тренировку' : activeTab === 'exercises' ? 'упражнение' : 'приём пищи'}</Button>
      </Card>

      <Card padding="none">
        {activeTab === 'workouts' && <Table columns={workoutColumns} data={workouts.filter(w => w.isActive)} keyField="id" loading={workoutsLoading} emptyText="Нет тренировок" />}
        {activeTab === 'exercises' && <Table columns={exerciseColumns} data={exercises.filter(e => e.isActive)} keyField="id" loading={exercisesLoading} emptyText="Нет упражнений" />}
        {activeTab === 'meals' && <Table columns={mealColumns} data={meals.filter(m => m.isActive)} keyField="id" loading={mealsLoading} emptyText="Нет записей" />}
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={getModalTitle()}
        footer={<div className={styles.modalFooter}><Button variant="ghost" onClick={() => setModalOpen(false)}>Отмена</Button><Button variant="primary" onClick={handleSave}>Сохранить</Button></div>}>
        <div className={styles.form}>
          {activeTab === 'workouts' && (<>
            <Input label="Название *" value={workoutForm.name} onChange={e => setWorkoutForm({ ...workoutForm, name: e.target.value })} />
            <Select label="Тип" options={workoutTypeOptions} value={workoutForm.type} onChange={e => setWorkoutForm({ ...workoutForm, type: e.target.value as WorkoutType })} />
            <Input label="Длительность (мин)" type="number" value={workoutForm.duration} onChange={e => setWorkoutForm({ ...workoutForm, duration: parseInt(e.target.value) || 0 })} />
            <Input label="Калории" type="number" value={workoutForm.calories} onChange={e => setWorkoutForm({ ...workoutForm, calories: parseInt(e.target.value) || 0 })} />
            <Input label="Дата" type="date" value={workoutForm.date} onChange={e => setWorkoutForm({ ...workoutForm, date: e.target.value })} />
            <Input label="Заметки" value={workoutForm.notes || ''} onChange={e => setWorkoutForm({ ...workoutForm, notes: e.target.value })} />
          </>)}
          {activeTab === 'exercises' && (<>
            <Input label="Название *" value={exerciseForm.name} onChange={e => setExerciseForm({ ...exerciseForm, name: e.target.value })} />
            <Select label="Группа мышц" options={muscleGroupOptions} value={exerciseForm.muscleGroup} onChange={e => setExerciseForm({ ...exerciseForm, muscleGroup: e.target.value as MuscleGroup })} />
            <Input label="Описание" value={exerciseForm.description || ''} onChange={e => setExerciseForm({ ...exerciseForm, description: e.target.value })} />
            <Input label="Ссылка на видео" value={exerciseForm.videoUrl || ''} onChange={e => setExerciseForm({ ...exerciseForm, videoUrl: e.target.value })} />
          </>)}
          {activeTab === 'meals' && (<>
            <Input label="Название *" value={mealForm.name} onChange={e => setMealForm({ ...mealForm, name: e.target.value })} />
            <Select label="Тип" options={mealTypeOptions} value={mealForm.type} onChange={e => setMealForm({ ...mealForm, type: e.target.value as MealType })} />
            <Input label="Дата" type="date" value={mealForm.date} onChange={e => setMealForm({ ...mealForm, date: e.target.value })} />
            <Input label="Калории" type="number" value={mealForm.calories} onChange={e => setMealForm({ ...mealForm, calories: parseInt(e.target.value) || 0 })} />
            <div className={styles.row}>
              <Input label="Белки (г)" type="number" value={mealForm.protein} onChange={e => setMealForm({ ...mealForm, protein: parseInt(e.target.value) || 0 })} />
              <Input label="Углеводы (г)" type="number" value={mealForm.carbs} onChange={e => setMealForm({ ...mealForm, carbs: parseInt(e.target.value) || 0 })} />
              <Input label="Жиры (г)" type="number" value={mealForm.fat} onChange={e => setMealForm({ ...mealForm, fat: parseInt(e.target.value) || 0 })} />
            </div>
          </>)}
        </div>
      </Modal>
    </div>
  );
});
