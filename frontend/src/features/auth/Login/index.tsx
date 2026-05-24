import { useState } from 'react';
import { Heart, Calendar, FileText, Bell } from 'lucide-react';
import { LoginForm } from './components/LoginForm';
import { RegisterFormComp } from './components/RegisterFormComp';

const ManzanillaMark = ({ size = 44 }: { size?: number }) => (
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

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', minHeight: '100vh' }}>
      {/* Brand panel */}
      <div style={{ position: 'relative', padding: '42px 56px', overflow: 'hidden', background: 'linear-gradient(180deg, #FBF0DD 0%, #F8E6CE 100%)' }}>
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ManzanillaMark size={44} />
            <div>
              <div className="serif" style={{ fontSize: 24, lineHeight: 1, fontWeight: 500 }}>Manzanilla</div>
              <div style={{ fontSize: 11, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '.15em', marginTop: 4 }}>consultorio médico</div>
            </div>
          </div>
          <div style={{ marginTop: 'auto' }}>
            <div className="chip chip-butter" style={{ marginBottom: 18 }}>
              <Heart size={14} color="#6E5418" /> cuidado que se siente bonito
            </div>
            <h1 className="serif" style={{ fontSize: 40, fontWeight: 500, lineHeight: 1.05, letterSpacing: '-0.025em', color: 'var(--ink)', marginBottom: 16 }}>
              Tu salud,<br /><em style={{ color: 'var(--peach-deep)' }}>en buenas manos.</em>
            </h1>
            <p style={{ fontSize: 14.5, color: 'var(--ink-soft)', lineHeight: 1.55, maxWidth: 480, marginBottom: 28 }}>
              Agenda tus consultas, lleva tu historia clínica y mantente al día con tu bienestar — sin filas, sin papeles.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 36 }}>
              {[
                { Icon: Calendar, label: 'Reserva en minutos', tone: 'peach' },
                { Icon: FileText, label: 'Tu historia siempre contigo', tone: 'sage' },
                { Icon: Bell, label: 'Recordatorios sin estrés', tone: 'lavender' },
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px 8px 8px', background: 'rgba(255,252,246,0.7)', borderRadius: 999, fontSize: 13, fontWeight: 500, boxShadow: 'var(--shadow-xs)' }}>
                  <div style={{ width: 26, height: 26, borderRadius: 999, background: `var(--${f.tone})`, display: 'grid', placeItems: 'center' }}>
                    <f.Icon size={14} />
                  </div>
                  {f.label}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, fontSize: 12, color: 'var(--ink-soft)' }}>
            <span>© 2026 Consultorio Manzanilla</span><span>· MID</span>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div style={{ display: 'grid', placeItems: 'center', padding: '32px 42px', background: 'var(--bg)' }}>
        <div className="fade-up" style={{ width: '100%', maxWidth: 440, background: 'var(--card)', borderRadius: 18, padding: '26px 26px 22px', boxShadow: 'var(--shadow-lg)' }}>
          {/* Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--bg)', borderRadius: 999, padding: 4, marginBottom: 22 }}>
            {(['login', 'register'] as const).map(m => (
              <button key={m}
                style={{ padding: '9px 14px', borderRadius: 999, fontSize: 13, fontWeight: 500, color: mode === m ? 'var(--bg-warm-white)' : 'var(--ink-soft)', background: mode === m ? 'var(--ink)' : 'transparent', boxShadow: mode === m ? '0 4px 12px -4px rgba(43,37,32,0.35)' : 'none', transition: 'all .25s var(--ease)' }}
                onClick={() => setMode(m)}>
                {m === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              </button>
            ))}
          </div>
          {mode === 'login' ? <LoginForm /> : <RegisterFormComp onDone={() => setMode('login')} />}
        </div>
      </div>
    </div>
  );
}
