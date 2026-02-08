import { observer } from 'mobx-react-lite';
import { dataStore, authStore, navigationStore } from '@/store';
import { Card, Button, Badge } from '@/components/UI';
import styles from './HomePage.module.scss';

const StatCard = ({ title, value, icon, color }: { title: string; value: number | string; icon: React.ReactNode; color: 'primary' | 'success' | 'warning' | 'info'; }) => (
  <Card className={`${styles.statCard} ${styles[color]}`}>
    <div className={styles.statIcon}>{icon}</div>
    <div className={styles.statContent}><span className={styles.statValue}>{value}</span><span className={styles.statTitle}>{title}</span></div>
  </Card>
);

export const HomePage = observer(() => {
  const { weekWorkouts, activeExercises, todayCalories, todayMeals, workoutsLoading } = dataStore;
  const { isTrainer, isAdmin } = authStore;
  const { navigate } = navigationStore;

  const weekCaloriesBurned = weekWorkouts.reduce((s, w) => s + w.calories, 0);
  const weekDuration = weekWorkouts.reduce((s, w) => s + w.duration, 0);

  return (
    <div className={styles.page}>
      <section className={styles.welcome}>
        <div className={styles.welcomeContent}>
          <h1 className={styles.welcomeTitle}>Фитнес-трекер</h1>
          <p className={styles.welcomeText}>
            Управляйте своими тренировками и питанием.
            {!isTrainer && ' Войдите для редактирования данных.'}
          </p>
          {!authStore.isAuthenticated && (
            <Button variant="primary" size="lg" onClick={() => authStore.openLoginModal()}>Войти в систему</Button>
          )}
        </div>
        <div className={styles.welcomeDecor}>
          <svg viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="2" opacity="0.2" />
            <path d="M60 100 L80 100 L80 70 L120 70 L120 100 L140 100 L140 110 L120 110 L120 130 L80 130 L80 110 L60 110 Z" stroke="currentColor" strokeWidth="2" opacity="0.4" fill="none" />
          </svg>
        </div>
      </section>

      <section className={styles.stats}>
        <StatCard title="Тренировок за неделю" value={workoutsLoading ? '...' : weekWorkouts.length} color="primary"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6.5 6.5L17.5 17.5M6.5 17.5L17.5 6.5M12 2v4M12 18v4M2 12h4M18 12h4" /></svg>} />
        <StatCard title="Минут тренировок" value={weekDuration} color="info"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>} />
        <StatCard title="Сожжено ккал (неделя)" value={weekCaloriesBurned} color="warning"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2c.6 6-4 8-4 14a4 4 0 008 0c0-6-4-8-4-14z" /></svg>} />
        <StatCard title="Калорий сегодня" value={todayCalories} color="success"
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3" /></svg>} />
      </section>

      <section className={styles.quickActions}>
        <h2 className={styles.sectionTitle}>Быстрые действия</h2>
        <div className={styles.actionCards}>
          <Card className={styles.actionCard} hoverable onClick={() => navigate('workouts')}>
            <div className={styles.actionIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6.5 6.5L17.5 17.5M6.5 17.5L17.5 6.5M12 2v4M12 18v4M2 12h4M18 12h4" /></svg>
            </div>
            <h3>Тренировки</h3>
            <p>История и планирование</p>
            {weekWorkouts.length > 0 && <Badge variant="success">{weekWorkouts.length} на этой неделе</Badge>}
          </Card>

          <Card className={styles.actionCard} hoverable onClick={() => navigate('exercises')}>
            <div className={styles.actionIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
            </div>
            <h3>Упражнения</h3>
            <p>Каталог упражнений</p>
            <Badge variant="info">{activeExercises.length} упражнений</Badge>
          </Card>

          <Card className={styles.actionCard} hoverable onClick={() => navigate('nutrition')}>
            <div className={styles.actionIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3" /></svg>
            </div>
            <h3>Питание</h3>
            <p>Учёт калорий и БЖУ</p>
            {todayMeals.length > 0 && <Badge variant="warning">{todayMeals.length} приёмов сегодня</Badge>}
          </Card>

          {isAdmin && (
            <Card className={styles.actionCard} hoverable onClick={() => navigate('admin')}>
              <div className={styles.actionIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
              </div>
              <h3>Администрирование</h3>
              <p>Управление данными</p>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
});
