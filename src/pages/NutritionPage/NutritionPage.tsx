import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { dataStore, authStore, uiStore } from '@/store';
import { Card, Button, Table, Modal, Input, Select, Badge } from '@/components/UI';
import type { TableColumn } from '@/components/UI';
import type { Meal, MealFormData, MealType } from '@/types';
import { getMealTypeLabel } from '@/types';
import styles from './NutritionPage.module.scss';

const mealTypeOptions = [
  { value: 'breakfast', label: 'Завтрак' }, { value: 'lunch', label: 'Обед' },
  { value: 'dinner', label: 'Ужин' }, { value: 'snack', label: 'Перекус' },
];

export const NutritionPage = observer(() => {
  const { meals, todayMeals, todayCalories, mealsLoading, createMeal, updateMeal, deleteMeal, setFilter, filters } = dataStore;
  const { isTrainer } = authStore;
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MealFormData>({
    name: '', type: 'breakfast', calories: 0, protein: 0, carbs: 0, fat: 0, date: new Date().toISOString().split('T')[0]
  });

  const resetForm = () => {
    setForm({ name: '', type: 'breakfast', calories: 0, protein: 0, carbs: 0, fat: 0, date: new Date().toISOString().split('T')[0] });
    setEditingId(null);
  };

  const openCreateModal = () => { resetForm(); setModalMode('create'); setModalOpen(true); };
  const openEditModal = (m: Meal) => {
    setModalMode('edit'); setEditingId(m.id);
    setForm({
      name: m.name, type: m.type, calories: m.calories, protein: m.protein, carbs: m.carbs, fat: m.fat,
      date: m.date.split('T')[0],
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) { uiStore.showError('Введите название приёма пищи'); return; }
    try {
      let ok = true;
      if (modalMode === 'create') ok = (await createMeal(form)) != null;
      else ok = editingId ? await updateMeal(editingId, form) : false;
      if (!ok) { uiStore.showError('Не удалось сохранить запись'); return; }
      uiStore.showSuccess(modalMode === 'create' ? 'Приём пищи добавлен' : 'Запись обновлена');
      setModalOpen(false); resetForm();
    }
    catch { uiStore.showError('Ошибка сохранения'); }
  };

  const handleDelete = (id: string) => {
    uiStore.showConfirm('Удаление записи', 'Удалить этот приём пищи?', async () => { await deleteMeal(id); uiStore.showSuccess('Запись удалена'); });
  };

  const getMealTypeBadgeVariant = (t: MealType): 'primary' | 'success' | 'warning' | 'info' => {
    return { breakfast: 'info', lunch: 'success', dinner: 'primary', snack: 'warning' }[t] as 'primary' | 'success' | 'warning' | 'info';
  };

  const activeMeals = meals.filter(m => m.isActive);
  const filteredMeals = filters.mealType ? activeMeals.filter(m => m.type === filters.mealType) : activeMeals;
  const sortedMeals = [...filteredMeals].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const columns: TableColumn<Meal>[] = [
    { key: 'date', title: 'Дата', width: '110px', render: (v: unknown) => new Date(v as string).toLocaleDateString('ru-RU') },
    { key: 'type', title: 'Тип', width: '110px', render: (v: unknown) => <Badge variant={getMealTypeBadgeVariant(v as MealType)}>{getMealTypeLabel(v as MealType)}</Badge> },
    { key: 'name', title: 'Название' },
    { key: 'calories', title: 'Ккал', width: '70px' },
    { key: 'protein', title: 'Б', width: '50px' },
    { key: 'carbs', title: 'У', width: '50px' },
    { key: 'fat', title: 'Ж', width: '50px' },
    ...(isTrainer ? [{
      key: 'actions' as keyof Meal, title: '', width: '120px',
      render: (_: unknown, row: Meal) => (
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
        <div><h1 className={styles.title}>Питание</h1><p className={styles.subtitle}>Учёт приёмов пищи и калорий</p></div>
        {isTrainer && <Button variant="primary" onClick={openCreateModal}>Добавить приём пищи</Button>}
      </div>

      <section className={styles.todayStats}>
        <Card className={styles.statCard}>
          <div className={styles.statValue}>{todayCalories}</div>
          <div className={styles.statLabel}>Калорий сегодня</div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statValue}>{todayMeals.length}</div>
          <div className={styles.statLabel}>Приёмов пищи сегодня</div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statValue}>{todayMeals.reduce((s, m) => s + m.protein, 0)}г</div>
          <div className={styles.statLabel}>Белков сегодня</div>
        </Card>
      </section>

      <Card className={styles.filters}>
        <Select options={[{ value: '', label: 'Все типы' }, ...mealTypeOptions]} value={filters.mealType || ''} onChange={e => setFilter('mealType', e.target.value || undefined)} />
      </Card>

      <Card padding="none">
        <Table columns={columns} data={sortedMeals} keyField="id" loading={mealsLoading} emptyText="Нет записей о питании" />
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalMode === 'create' ? 'Добавить приём пищи' : 'Редактировать приём пищи'}
        footer={<div className={styles.modalFooter}><Button variant="ghost" onClick={() => setModalOpen(false)}>Отмена</Button><Button variant="primary" onClick={handleSave}>Сохранить</Button></div>}>
        <div className={styles.form}>
          <Input label="Название *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Например: Овсянка с фруктами" />
          <Select label="Тип приёма пищи" options={mealTypeOptions} value={form.type} onChange={e => setForm({ ...form, type: e.target.value as MealType })} />
          <Input label="Дата" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          <div className={styles.row}>
            <Input label="Калории" type="number" min={0} value={form.calories} onChange={e => setForm({ ...form, calories: parseInt(e.target.value) || 0 })} />
            <Input label="Белки (г)" type="number" min={0} value={form.protein} onChange={e => setForm({ ...form, protein: parseInt(e.target.value) || 0 })} />
          </div>
          <div className={styles.row}>
            <Input label="Углеводы (г)" type="number" min={0} value={form.carbs} onChange={e => setForm({ ...form, carbs: parseInt(e.target.value) || 0 })} />
            <Input label="Жиры (г)" type="number" min={0} value={form.fat} onChange={e => setForm({ ...form, fat: parseInt(e.target.value) || 0 })} />
          </div>
        </div>
      </Modal>
    </div>
  );
});
