import { useState, useEffect } from 'react';
import { Bell, X as CloseIcon } from 'lucide-react';
import { useLoginReminder } from '@/hooks/useLoginReminder';
import { AuthProvider, useAuth } from '@/app/AuthContext';
import { ToastProvider } from '@/app/ToastContext';
import { AppShell } from '@/components/layout/AppShell';
import LoginPage        from '@/features/auth/Login';
import DoctorDashboard  from '@/features/doctor/Dashboard';
import Pacientes        from '@/features/doctor/Pacientes';
import Citas            from '@/features/doctor/Citas';
import Historia         from '@/features/doctor/Historia';
import Reportes         from '@/features/doctor/Reportes';
import PatientDashboard from '@/features/patient/Dashboard';
import PatientCitas     from '@/features/patient/Citas';
import PatientHistoria  from '@/features/patient/Historia';
import PatientPerfil    from '@/features/patient/Perfil';
import AdminDashboard   from '@/features/admin/Dashboard';
import AdminMedicos     from '@/features/admin/Medicos';
import AdminPacientes   from '@/features/admin/Pacientes';
import AdminAgenda      from '@/features/admin/Agenda';
import AdminPerfil      from '@/features/admin/Perfil';

type Screen = string;
interface Route { screen: Screen; params: Record<string, unknown>; }

const ROUTE_KEY = 'manzanilla_route';

function readRoute(): Route {
  try {
    const saved = sessionStorage.getItem(ROUTE_KEY);
    return saved ? JSON.parse(saved) : { screen: 'dashboard', params: {} };
  } catch {
    return { screen: 'dashboard', params: {} };
  }
}

function saveRoute(r: Route) {
  try { sessionStorage.setItem(ROUTE_KEY, JSON.stringify(r)); } catch { /* silent */ }
}

const SCREEN_LABELS_MEDICO: Record<string, string> = {
  dashboard: 'Inicio', pacientes: 'Pacientes', citas: 'Agenda',
  historia: 'Historias', reportes: 'Reportes',
};
const SCREEN_LABELS_PACIENTE: Record<string, string> = {
  dashboard: 'Mi inicio', citas: 'Mis citas',
  historia: 'Mi historia', perfil: 'Mi perfil',
};
const SCREEN_LABELS_ADMIN: Record<string, string> = {
  dashboard: 'Panel', medicos: 'Médicos',
  pacientes: 'Pacientes', agenda: 'Agenda global', perfil: 'Mi perfil',
};

function AppContent() {
  const { user } = useAuth();
  const [route, setRoute] = useState<Route>(readRoute);
  const { showDismissToast, handleDismissToday, handleDismissToast } = useLoginReminder(user);

  useEffect(() => {
    if (!user) saveRoute({ screen: 'dashboard', params: {} });
  }, [user]);

  const goTo = (screen: Screen, params: Record<string, unknown> = {}) => {
    const r = { screen, params };
    setRoute(r);
    saveRoute(r);
  };

  if (!user) return <LoginPage />;

  const isPaciente = user.role === 'paciente';
  const isAdmin    = user.role === 'admin';
  const labels     = isPaciente ? SCREEN_LABELS_PACIENTE : isAdmin ? SCREEN_LABELS_ADMIN : SCREEN_LABELS_MEDICO;
  const screenLabel = labels[route.screen] ?? 'Manzanilla';

  const validScreens = isPaciente
    ? ['dashboard', 'citas', 'historia', 'perfil']
    : isAdmin
    ? ['dashboard', 'medicos', 'pacientes', 'agenda', 'perfil']
    : ['dashboard', 'pacientes', 'citas', 'historia', 'reportes'];

  const safeScreen = validScreens.includes(route.screen) ? route.screen : 'dashboard';

  return (
    <AppShell current={safeScreen} onNavigate={goTo} screenLabel={screenLabel}>
      {showDismissToast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, background: 'var(--card)', border: '1px solid var(--hairline)', borderRadius: 16, padding: '14px 18px', boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', gap: 14, maxWidth: 420, width: 'calc(100vw - 32px)' }}>
          <Bell size={18} color="var(--ink-soft)" style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: 13.5, color: 'var(--ink)' }}>¿No quieres más recordatorios hoy?</span>
          <button className="btn btn-secondary" style={{ fontSize: 12, padding: '6px 12px', whiteSpace: 'nowrap' }} onClick={handleDismissToday}>No recordar hoy</button>
          <button className="btn-ghost" style={{ fontSize: 12, padding: '6px 8px', color: 'var(--muted)', display: 'flex', alignItems: 'center' }} onClick={handleDismissToast}><CloseIcon size={14} /></button>
        </div>
      )}
      {isPaciente ? (
        <>
          {safeScreen === 'dashboard' && <PatientDashboard onNavigate={goTo} />}
          {safeScreen === 'citas'     && <PatientCitas />}
          {safeScreen === 'historia'  && <PatientHistoria />}
          {safeScreen === 'perfil'    && <PatientPerfil />}
        </>
      ) : isAdmin ? (
        <>
          {safeScreen === 'dashboard' && <AdminDashboard onNavigate={goTo} />}
          {safeScreen === 'medicos'   && <AdminMedicos />}
          {safeScreen === 'pacientes' && <AdminPacientes />}
          {safeScreen === 'agenda'    && <AdminAgenda />}
          {safeScreen === 'perfil'    && <AdminPerfil />}
        </>
      ) : (
        <>
          {safeScreen === 'dashboard' && <DoctorDashboard onNavigate={goTo} />}
          {safeScreen === 'pacientes' && <Pacientes onNavigate={goTo} />}
          {safeScreen === 'citas'     && <Citas onNavigate={goTo} />}
          {safeScreen === 'historia'  && <Historia onNavigate={goTo} patientId={route.params.patientId as number | undefined} appointmentId={route.params.appointmentId as number | undefined} />}
          {safeScreen === 'reportes'  && <Reportes onNavigate={goTo} />}
        </>
      )}
    </AppShell>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
