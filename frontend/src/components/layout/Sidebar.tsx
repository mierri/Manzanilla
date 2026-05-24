import { Home, Users, Calendar, FileText, BarChart2, User, Heart, Stethoscope, LogOut, X, Sparkles, Menu, ShieldCheck, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/AuthContext';
import type { Role } from '@/types';

interface NavItem { id: string; label: string; path: string; Icon: React.ElementType; }

const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  medico: [
    { id: 'dashboard', label: 'Inicio',    path: '/dashboard', Icon: Home      },
    { id: 'pacientes', label: 'Pacientes', path: '/pacientes', Icon: Users     },
    { id: 'citas',     label: 'Agenda',    path: '/citas',     Icon: Calendar  },
    { id: 'historia',  label: 'Historias', path: '/historia',  Icon: FileText  },
    { id: 'reportes',  label: 'Reportes',  path: '/reportes',  Icon: BarChart2 },
  ],
  paciente: [
    { id: 'dashboard', label: 'Mi inicio',   path: '/dashboard', Icon: Home     },
    { id: 'citas',     label: 'Mis citas',   path: '/citas',     Icon: Calendar },
    { id: 'historia',  label: 'Mi historia', path: '/historia',  Icon: FileText },
    { id: 'perfil',    label: 'Mi perfil',   path: '/perfil',    Icon: User     },
  ],
  admin: [
    { id: 'dashboard', label: 'Panel',      path: '/dashboard', Icon: Home        },
    { id: 'medicos',   label: 'Médicos',    path: '/medicos',   Icon: Stethoscope },
    { id: 'pacientes', label: 'Pacientes',  path: '/pacientes', Icon: Users       },
    { id: 'agenda',    label: 'Agenda',     path: '/agenda',    Icon: Calendar    },
    { id: 'perfil',    label: 'Mi perfil',  path: '/perfil',    Icon: Settings    },
  ],
};

// Manzanilla logo mark
const ManzanillaMark = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <g transform="translate(32,32)">
      {[0,45,90,135,180,225,270,315].map((a, i) => (
        <ellipse key={i} cx="0" cy="-18" rx="7" ry="14"
          fill="#FFFCF6" stroke="#2B2520" strokeWidth="1.5"
          transform={`rotate(${a})`} />
      ))}
      <circle r="9" fill="#EFD68E" stroke="#2B2520" strokeWidth="1.5" />
    </g>
  </svg>
);

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: Props) {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  if (!user) return null;

  const isPaciente = user.role === 'paciente';
  const isAdmin    = user.role === 'admin';
  const NAV_ITEMS  = NAV_BY_ROLE[user.role as Role] ?? NAV_BY_ROLE.medico;
  const accent     = isPaciente ? 'sage' : isAdmin ? 'lavender' : 'butter';

  // Activo cuando la ruta actual empieza con el path del item
  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <aside style={s.shell} className={isOpen ? 'is-open' : ''}>
      {/* Brand */}
      <div style={s.brandRow}>
        <div style={{ ...s.brandMark, background: `var(--${accent})` }}>
          <ManzanillaMark size={32} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={s.brandName} className="serif">Manzanilla</div>
          <div style={s.brandTag}>{isPaciente ? 'portal paciente' : isAdmin ? 'administración' : 'consultorio'}</div>
        </div>
        <button className="sidebar-close" onClick={onClose} aria-label="Cerrar menú">
          <X size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav style={s.nav}>
        {NAV_ITEMS.map(({ id, label, path, Icon }) => {
          const active = isActive(path);
          return (
            <button
              key={id}
              style={{
                ...s.navItem,
                ...(active ? { ...s.navItemActive, ...(isPaciente ? s.navItemActivePaciente : isAdmin ? s.navItemActiveAdmin : {}) } : {}),
              }}
              onClick={() => handleNav(path)}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(43,37,32,0.04)'; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            >
              <Icon size={18} />
              <span>{label}</span>
              {active && <span style={{ ...s.activeDot, background: isPaciente ? 'var(--sage-deep)' : 'var(--butter-deep)' }} />}
            </button>
          );
        })}
      </nav>

      {/* Tip / next appt / admin card */}
      {isPaciente ? (
        <div style={{ ...s.tipCard, background: 'var(--sage)', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Heart size={14} color="#3C5A3F" />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#3C5A3F', letterSpacing: '.05em', textTransform: 'uppercase' }}>Tu próxima cita</span>
          </div>
          <div className="serif" style={{ fontSize: 14.5, lineHeight: 1.35, color: 'var(--ink)' }}>
            <em style={{ color: '#3C5A3F' }}>Sin citas pendientes</em>
          </div>
        </div>
      ) : isAdmin ? (
        <div style={{ ...s.tipCard, background: 'var(--lavender)', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <ShieldCheck size={14} color="#4B3B68" />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#4B3B68', letterSpacing: '.05em', textTransform: 'uppercase' }}>Administrador</span>
          </div>
          <div className="serif" style={{ fontSize: 14.5, lineHeight: 1.35, color: 'var(--ink)' }}>
            Acceso completo al sistema del consultorio.
          </div>
        </div>
      ) : (
        <div style={{ ...s.tipCard, marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Sparkles size={14} color="#6E5418" />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#6E5418', letterSpacing: '.05em', textTransform: 'uppercase' }}>Tip del día</span>
          </div>
          <div className="serif" style={{ fontSize: 14.5, lineHeight: 1.35, color: 'var(--ink)' }}>
            Tómate un momento de calma entre consultas.
          </div>
        </div>
      )}

      {/* User row */}
      <div style={s.userRow}>
        <div style={{ ...s.avatar, background: isPaciente ? 'var(--sage-deep)' : isAdmin ? 'var(--lavender-deep)' : 'var(--ink)' }}>
          {isPaciente ? <User size={18} color="#fff" /> : isAdmin ? <ShieldCheck size={18} color="#4B3B68" /> : <Stethoscope size={18} color="#fff" />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-soft)' }}>{isPaciente ? 'Paciente' : isAdmin ? 'Administrador' : 'Médico/a'}</div>
        </div>
        <button className="btn-icon" onClick={logout} title="Cerrar sesión">
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}

export function MobileTopbar({ onOpen, screenLabel }: { onOpen: () => void; screenLabel: string }) {
  return (
    <div className="mobile-topbar">
      <button className="mt-hamburger" onClick={onOpen} aria-label="Abrir menú">
        <Menu size={20} />
      </button>
      <div className="mt-brand">
        <span className="mt-mark">
          <svg width={18} height={18} viewBox="0 0 64 64" fill="none">
            <g transform="translate(32,32)">
              {[0,45,90,135,180,225,270,315].map((a, i) => (
                <ellipse key={i} cx="0" cy="-18" rx="7" ry="14" fill="#FFFCF6" stroke="#2B2520" strokeWidth="2" transform={`rotate(${a})`} />
              ))}
              <circle r="9" fill="#EFD68E" stroke="#2B2520" strokeWidth="2" />
            </g>
          </svg>
        </span>
        <span>{screenLabel}</span>
      </div>
    </div>
  );
}

const s = {
  shell: { padding: '26px 18px 22px', background: 'rgba(255,252,246,0.55)', backdropFilter: 'blur(8px)', borderRight: '1px solid rgba(43,37,32,0.05)', display: 'flex', flexDirection: 'column' as const, gap: 18, position: 'sticky' as const, top: 0, height: '100vh' },
  brandRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '0 8px 4px' },
  brandMark: { width: 42, height: 42, borderRadius: 12, display: 'grid', placeItems: 'center', boxShadow: 'var(--shadow-sm)' },
  brandName: { fontSize: 18, fontWeight: 500, lineHeight: 1, color: 'var(--ink)' },
  brandTag: { fontSize: 11, color: 'var(--ink-soft)', textTransform: 'uppercase' as const, letterSpacing: '.1em', marginTop: 4 },
  nav: { display: 'flex', flexDirection: 'column' as const, gap: 2, marginTop: 12 },
  navItem: { position: 'relative' as const, display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, fontSize: 13.5, fontWeight: 500, color: 'var(--ink-soft)', background: 'transparent', transition: 'background .2s var(--ease), color .2s var(--ease)', width: '100%', textAlign: 'left' as const },
  navItemActive: { background: 'var(--ink)', color: 'var(--bg-warm-white)', boxShadow: '0 6px 16px -6px rgba(43,37,32,0.35)' },
  navItemActivePaciente: { background: '#3C5A3F', color: 'var(--bg-warm-white)', boxShadow: '0 6px 16px -6px rgba(60,90,63,0.45)' },
  navItemActiveAdmin:    { background: '#4B3B68', color: 'var(--bg-warm-white)', boxShadow: '0 6px 16px -6px rgba(75,59,104,0.45)' },
  activeDot: { marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%' },
  tipCard: { background: 'var(--butter)', borderRadius: 14, padding: '12px 14px 14px', boxShadow: 'var(--shadow-sm)' },
  userRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 6px 0', borderTop: '1px solid var(--hairline)', paddingTop: 14 },
  avatar: { width: 36, height: 36, borderRadius: 10, display: 'grid', placeItems: 'center' },
};
