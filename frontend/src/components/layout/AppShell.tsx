import { useState, useEffect, type ReactNode } from 'react';
import { Sidebar, MobileTopbar } from './Sidebar';
import { useAuth } from '@/app/AuthContext';

interface Props {
  current: string;
  onNavigate: (id: string) => void;
  children: ReactNode;
  screenLabel?: string;
  nextAppt?: string;
}

export function AppShell({ current, onNavigate, children, screenLabel = 'Manzanilla', nextAppt }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => { setDrawerOpen(false); }, [current]);

  useEffect(() => {
    if (drawerOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [drawerOpen]);

  useEffect(() => {
    if (user) document.body.className = `role-${user.role}`;
    return () => { document.body.className = ''; };
  }, [user]);

  return (
    <div className="app-shell">
      <Sidebar
        current={current}
        onNavigate={onNavigate}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        nextAppt={nextAppt}
      />
      <div
        className={`sidebar-backdrop${drawerOpen ? ' is-open' : ''}`}
        onClick={() => setDrawerOpen(false)}
      />
      <main className="main-pane">
        <MobileTopbar onOpen={() => setDrawerOpen(true)} screenLabel={screenLabel} />
        {children}
      </main>
    </div>
  );
}
