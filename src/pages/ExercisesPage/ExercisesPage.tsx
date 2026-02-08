import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { dataStore, authStore, uiStore } from '@/store';
import { Card, Button, Table, Modal, Input, Select, Badge } from '@/components/UI';
import type { TableColumn } from '@/components/UI';
import type { Exercise, ExerciseFormData, MuscleGroup } from '@/types';
import { getMuscleGroupLabel } from '@/types';
import styles from './ExercisesPage.module.scss';

const muscleGroupOptions = [
  { value: 'chest', label: 'Грудь' }, { value: 'back', label: 'Спина' }, { value: 'legs', label: 'Ноги' },
  { value: 'arms', label: 'Руки' }, { value: 'shoulders', label: 'Плечи' }, { value: 'core', label: 'Кор' }, { value: 'full_body', label: 'Всё тело' },
];

export const ExercisesPage = observer(() => {
  const { activeExercises, exercisesLoading, createExercise, updateExercise, deleteExercise, setFilter, filters } = dataStore;
  const { isTrainer } = authStore;
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ExerciseFormData>({ name: '', muscleGroup: 'chest', description: '', videoUrl: '' });

  const resetForm = () => { setForm({ name: '', muscleGroup: 'chest', description: '', videoUrl: '' }); setEditingId(null); };
  const openCreateModal = () => { resetForm(); setModalMode('create'); setModalOpen(true); };
  const openEditModal = (e: Exercise) => {
    setModalMode('edit'); setEditingId(e.id);
    setForm({ name: e.name, muscleGroup: e.muscleGroup, description: e.description || '', videoUrl: e.videoUrl || '' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) { uiStore.showError('Введите название упражнения'); return; }
    try {
      if (modalMode === 'create') { await createExercise(form); }
      else if (editingId) { await updateExercise(editingId, form); }
      uiStore.showSuccess(modalMode === 'create' ? 'Упражнение добавлено' : 'Упражнение обновлено');
      setModalOpen(false); resetForm();
    } catch { uiStore.showError('Ошибка сохранения'); }
  };

  const handleDelete = (id: string) => {
    uiStore.showConfirm('Удаление упражнения', 'Удалить это упражнение?', async () => {
      await deleteExercise(id); uiStore.showSuccess('Упражнение удалено');
    });
  };

  const getMuscleGroupBadgeVariant = (m: MuscleGroup): 'primary' | 'success' | 'warning' | 'info' => {
    const map: Record<MuscleGroup, 'primary' | 'success' | 'warning' | 'info'> = {
      chest: 'primary', back: 'info', legs: 'success', arms: 'warning', shoulders: 'primary', core: 'info', full_body: 'success'
    };
    return map[m];
  };

  const filteredExercises = filters.muscleGroup 
    ? activeExercises.filter(e => e.muscleGroup === filters.muscleGroup) 
    : activeExercises;

  const columns: TableColumn<Exercise>[] = [
    { key: 'name', title: 'Название' },
    { key: 'muscleGroup', title: 'Группа мышц', width: '150px', render: (v: unknown) => <Badge variant={getMuscleGroupBadgeVariant(v as MuscleGroup)}>{getMuscleGroupLabel(v as MuscleGroup)}</Badge> },
    { key: 'description', title: 'Описание', render: (v: unknown) => (v as string)?.substring(0, 60) + ((v as string)?.length > 60 ? '...' : '') || '—' },
    ...(isTrainer ? [{
      key: 'actions' as keyof Exercise, title: '', width: '100px',
      render: (_: unknown, row: Exercise) => (
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
        <div><h1 className={styles.title}>Упражнения</h1><p className={styles.subtitle}>Каталог упражнений по группам мышц</p></div>
        {isTrainer && <Button variant="primary" onClick={openCreateModal}>Добавить упражнение</Button>}
      </div>

      <Card className={styles.filters}>
        <Select options={[{ value: '', label: 'Все группы мышц' }, ...muscleGroupOptions]} value={filters.muscleGroup || ''} onChange={e => setFilter('muscleGroup', e.target.value || undefined)} />
      </Card>

      <Card padding="none">
        <Table columns={columns} data={filteredExercises} keyField="id" loading={exercisesLoading} emptyText="Нет упражнений" />
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalMode === 'create' ? 'Новое упражнение' : 'Редактировать упражнение'}
        footer={<div className={styles.modalFooter}><Button variant="ghost" onClick={() => setModalOpen(false)}>Отмена</Button><Button variant="primary" onClick={handleSave}>Сохранить</Button></div>}>
        <div className={styles.form}>
          <Input label="Название *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <Select label="Группа мышц *" options={muscleGroupOptions} value={form.muscleGroup} onChange={e => setForm({ ...form, muscleGroup: e.target.value as MuscleGroup })} />
          <Input label="Описание" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} />
          <Input label="Ссылка на видео" value={form.videoUrl || ''} onChange={e => setForm({ ...form, videoUrl: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
});
