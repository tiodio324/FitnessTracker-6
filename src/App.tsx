import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { navigationStore, dataStore } from '@/store';
import { MainLayout, LoginModal, ConfirmModal, Toast } from '@/components';
import { HomePage, WorkoutsPage, ExercisesPage, NutritionPage, AdminPage } from '@/pages';

const PageRouter = observer(() => {
  const { currentPage } = navigationStore;
  switch (currentPage) {
    case 'home': return <HomePage />;
    case 'workouts': return <WorkoutsPage />;
    case 'exercises': return <ExercisesPage />;
    case 'nutrition': return <NutritionPage />;
    case 'admin': case 'admin-workouts': case 'admin-exercises': case 'admin-meals': return <AdminPage />;
    default: return <HomePage />;
  }
});

const App = observer(() => { useEffect(() => { dataStore.loadAllData(); }, []); return (<><MainLayout><PageRouter /></MainLayout><LoginModal /><ConfirmModal /><Toast /></>); });
export default App;
