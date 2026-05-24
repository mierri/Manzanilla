import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Bell, X as CloseIcon } from 'lucide-react';
import { Sidebar, MobileTopbar } from './Sidebar';
import { useAuth } from '@/app/AuthContext';
import { useLoginReminder } from '@/hooks/useLoginReminder';
import type { Role } from '@/types';

// Etiquetas de pantalla por ruta y rol (para la topbar mobile)
const LABELS_MEDICO: Record<string, string> = {
  '/dashboard': 'Inicio',
  '/pacientes': 'Pacientes',
  '/citas':     'Agenda',
  '/historia':  'Historias',
  '/reportes':  'Reportes',
};
const LABELS_PACIENTE: Record<string, string> = {
  '/dashboard': 'Mi inicio',
  '/citas':     'Mis citas',
  '/historia':  'Mi historia',
  '/perfil':    'Mi perfil',
};
const LABELS_ADMIN: Record<string, string> = {
  '/dashboard': 'Panel',
  '/medicos':   'Médicos',
  '/pacientes': 'Pacientes',
  '/agenda':    'Agenda global',
  '/perfil':    'Mi perfil',
};

function getLabelMap(role: Role) {
  if (role === 'paciente') return LABELS_PACIENTE;
  if (role === 'admin')    return LABELS_ADMIN;
  return LABELS_MEDICO;
}

export function AppShell() {
  const { user } = useAuth();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { showDismissToast, handleDismissToday, handleDismissToast } = useLoginReminder(user);

  // Cierra el drawer al navegar
  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

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

  const labelMap    = user ? getLabelMap(user.role as Role) : {};
  const basePath    = '/' + location.pathname.split('/')[1];
  const screenLabel = labelMap[basePath] ?? 'Manzanilla';

  return (
    <div className="app-shell">
      <Sidebar isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <div
        className={`sidebar-backdrop${drawerOpen ? ' is-open' : ''}`}
        onClick={() => setDrawerOpen(false)}
      />
      <main className="main-pane">
        <MobileTopbar onOpen={() => setDrawerOpen(true)} screenLabel={screenLabel} />
        <Outlet />
      </main>

      {showDismissToast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: 'var(--card)', border: '1px solid var(--hairline)', borderRadius: 16, padding: '14px 18px', boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', gap: 14, maxWidth: 420, width: 'calc(100vw - 32px)' }}>
          <Bell size={18} color="var(--ink-soft)" style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: 13.5, color: 'var(--ink)' }}>¿No quieres más recordatorios hoy?</span>
          <button className="btn btn-secondary" style={{ fontSize: 12, padding: '6px 12px', whiteSpace: 'nowrap' }} onClick={handleDismissToday}>No recordar hoy</button>
          <button className="btn-ghost" style={{ fontSize: 12, padding: '6px 8px', color: 'var(--muted)', display: 'flex', alignItems: 'center' }} onClick={handleDismissToast}><CloseIcon size={14} /></button>
        </div>
      )}
    </div>
  );
}
