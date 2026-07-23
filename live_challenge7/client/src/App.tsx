import { useEffect } from 'react';

import { AuthScreen } from './components/auth/AuthScreen';
import { AppLoader } from './components/common/AppLoader';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { WorkspaceShell } from './components/layout/WorkspaceShell';
import { checkSession } from './store/authSlice';
import { useAppDispatch, useAppSelector } from './store/hooks';
import './styles/app.css';

function App() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.auth.status);
  const role = useAppSelector((state) => state.auth.user?.role);
  const theme = useAppSelector((state) => state.theme.mode);

  useEffect(() => {
    void dispatch(checkSession());
  }, [dispatch]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  if (status === 'checking') {
    return <AppLoader />;
  }

  if (status === 'authenticated' || status === 'guest') {
    if (status === 'authenticated' && role === 'admin') {
      return <AdminDashboard />;
    }
    return <WorkspaceShell />;
  }

  return <AuthScreen />;
}

export default App;
