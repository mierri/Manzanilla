import { type ReactNode } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
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
import type { Role } from '@/types';

// Redirige a /login si no hay sesión
function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

// Redirige a /dashboard si ya hay sesión (para la página de login)
function GuestRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

// Redirige a /dashboard si el rol del usuario no está en la lista permitida
function RoleGuard({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role as Role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

// Renderiza un componente distinto según el rol. Si el rol no tiene componente, redirige a /dashboard.
function ByRole({ medico, paciente, admin }: { medico?: ReactNode; paciente?: ReactNode; admin?: ReactNode }) {
  const { user } = useAuth();
  const node = user?.role === 'medico' ? medico : user?.role === 'paciente' ? paciente : admin;
  return node ? <>{node}</> : <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Pública */}
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />

      {/* Protegidas — envueltas en AppShell (layout con Outlet) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={
            <ByRole
              medico={<DoctorDashboard />}
              paciente={<PatientDashboard />}
              admin={<AdminDashboard />}
            />
          } />

          <Route path="/pacientes" element={
            <RoleGuard roles={['medico', 'admin']}>
              <ByRole medico={<Pacientes />} admin={<AdminPacientes />} />
            </RoleGuard>
          } />

          <Route path="/citas" element={
            <RoleGuard roles={['medico', 'paciente']}>
              <ByRole medico={<Citas />} paciente={<PatientCitas />} />
            </RoleGuard>
          } />

          {/* Historia con patientId opcional en la URL */}
          <Route path="/historia" element={
            <RoleGuard roles={['medico', 'paciente']}>
              <ByRole medico={<Historia />} paciente={<PatientHistoria />} />
            </RoleGuard>
          } />
          <Route path="/historia/:patientId" element={
            <RoleGuard roles={['medico']}>
              <Historia />
            </RoleGuard>
          } />

          <Route path="/reportes" element={
            <RoleGuard roles={['medico']}><Reportes /></RoleGuard>
          } />

          <Route path="/medicos" element={
            <RoleGuard roles={['admin']}><AdminMedicos /></RoleGuard>
          } />

          <Route path="/agenda" element={
            <RoleGuard roles={['admin']}><AdminAgenda /></RoleGuard>
          } />

          <Route path="/perfil" element={
            <RoleGuard roles={['paciente', 'admin']}>
              <ByRole paciente={<PatientPerfil />} admin={<AdminPerfil />} />
            </RoleGuard>
          } />

          {/* Fallbacks */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>

      {/* Raíz → dashboard (redirige según auth en ProtectedRoute/GuestRoute) */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  );
}
