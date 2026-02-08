import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { dataStore, authStore, uiStore } from '@/store';
import { Card, Button, Table, Modal, Input, Select, Badge } from '@/components/UI';
import type { TableColumn } from '@/components/UI';
import type { Workout, WorkoutFormData, WorkoutType } from '@/types';
import { getWorkoutTypeLabel } from '@/types';
import styles from './WorkoutsPage.module.scss';

const workoutTypeOptions = [
  { value: 'strength', label: 'Силовая' },
  { value: 'cardio', label: 'Кардио' },
  { value: 'flexibility', label: 'Гибкость' },
  { value: 'hiit', label: 'HIIT' },
  { value: 'other', label: 'Другое' },
];

export const WorkoutsPage = observer(() => {
  const { filteredWorkouts, workoutsLoading, createWorkout, updateWorkout, deleteWorkout, setFilter, filters } = dataStore;
  const { isTrainer } = authStore;
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<WorkoutFormData>({
    name: '', type: 'strength', duration: 30, calories: 0, exercises: [], date: new Date().toISOString().split('T')[0], notes: ''
  });

  const resetForm = () => {
    setForm({ name: '', type: 'strength', duration: 30, calories: 0, exercises: [], date: new Date().toISOString().split('T')[0], notes: '' });
    setEditingId(null);
  };

  const openCreateModal = () => { resetForm(); setModalMode('create'); setModalOpen(true); };
  
  const openEditModal = (w: Workout) => {
    setModalMode('edit'); setEditingId(w.id);
    setForm({ name: w.name, type: w.type, duration: w.duration, calories: w.calories, exercises: w.exercises, date: w.date.split('T')[0], notes: w.notes || '' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.duration) { uiStore.showError('Заполните обязательные поля'); return; }
    try {
      if (modalMode === 'create') { await createWorkout(form); }
      else if (editingId) { await updateWorkout(editingId, form); }
      uiStore.showSuccess(modalMode === 'create' ? 'Тренировка добавлена' : 'Тренировка обновлена');
      setModalOpen(false); resetForm();
    } catch { uiStore.showError('Ошибка сохранения'); }
  };

  const handleDelete = (id: string) => {
    uiStore.showConfirm('Удаление тренировки', 'Удалить эту тренировку?', async () => {
      await deleteWorkout(id); uiStore.showSuccess('Тренировка удалена');
    });
  };

  const getTypeBadgeVariant = (type: WorkoutType): 'primary' | 'success' | 'warning' | 'info' => {
    const map: Record<WorkoutType, 'primary' | 'success' | 'warning' | 'info'> = {
      strength: 'primary', cardio: 'success', flexibility: 'info', hiit: 'warning', other: 'primary'
    };
    return map[type];
  };

  const columns: TableColumn<Workout>[] = [
    { key: 'date', title: 'Дата', width: '110px', render: (v: unknown) => new Date(v as string).toLocaleDateString('ru-RU') },
    { key: 'name', title: 'Название' },
    { key: 'type', title: 'Тип', width: '120px', render: (v: unknown) => <Badge variant={getTypeBadgeVariant(v as WorkoutType)}>{getWorkoutTypeLabel(v as WorkoutType)}</Badge> },
    { key: 'duration', title: 'Мин.', width: '70px' },
    { key: 'calories', title: 'Ккал', width: '70px' },
    ...(isTrainer ? [{
      key: 'actions' as keyof Workout, title: '', width: '100px',
      render: (_: unknown, row: Workout) => (
        <div className={styles.actions}>
          <Button size="sm" variant="ghost" onClick={() => openEditModal(row)} aria-label="Редактировать">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleDelete(row.id)} aria-label="Удалить">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
          </Button>
        </div>
      ),
    }] : []),
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Тренировки</h1>
          <p className={styles.subtitle}>История и планирование тренировок</p>
        </div>
        {isTrainer && <Button variant="primary" onClick={openCreateModal}>Добавить тренировку</Button>}
      </div>

      <Card className={styles.filters}>
        <Input placeholder="Поиск по названию..." value={filters.search || ''} onChange={e => setFilter('search', e.target.value || undefined)} />
        <Select options={[{ value: '', label: 'Все типы' }, ...workoutTypeOptions]} value={filters.type || ''} onChange={e => setFilter('type', e.target.value || undefined)} />
      </Card>

      <Card padding="none">
        <Table columns={columns} data={filteredWorkouts} keyField="id" loading={workoutsLoading} emptyText="Нет тренировок" />
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalMode === 'create' ? 'Новая тренировка' : 'Редактировать тренировку'}
        footer={<div className={styles.modalFooter}><Button variant="ghost" onClick={() => setModalOpen(false)}>Отмена</Button><Button variant="primary" onClick={handleSave}>Сохранить</Button></div>}>
        <div className={styles.form}>
          <Input label="Название *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <Select label="Тип тренировки *" options={workoutTypeOptions} value={form.type} onChange={e => setForm({ ...form, type: e.target.value as WorkoutType })} />
          <div className={styles.row}>
            <Input label="Длительность (мин) *" type="number" min={1} value={form.duration} onChange={e => setForm({ ...form, duration: parseInt(e.target.value) || 0 })} />
            <Input label="Калории" type="number" min={0} value={form.calories} onChange={e => setForm({ ...form, calories: parseInt(e.target.value) || 0 })} />
          </div>
          <Input label="Дата *" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          <Input label="Заметки" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
});
