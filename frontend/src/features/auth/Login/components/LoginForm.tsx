import { useState } from 'react';
import { User, Lock, ArrowRight, Eye, EyeOff, KeyRound, Mail, RefreshCw, Flower2 } from 'lucide-react';
import { useAuth } from '@/app/AuthContext';
import { useToast } from '@/app/ToastContext';
import { authApi } from '@/lib/api';
import ForgotPasswordModal from './ForgotPasswordModal';

type Step = 'credentials' | 'otp';

export function LoginForm() {
  const { setSession } = useAuth();
  const toast = useToast();

  const [step,        setStep]        = useState<Step>('credentials');
  const [username,    setUsername]    = useState('');
  const [password,    setPassword]    = useState('');
  const [showPwd,     setShowPwd]     = useState(false);
  const [remember,    setRemember]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [forgotOpen,  setForgotOpen]  = useState(false);

  // OTP step state
  const [userId,      setUserId]      = useState<number | null>(null);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otp,         setOtp]         = useState('');
  const [resending,   setResending]   = useState(false);

  // ─── Step 1: validate credentials ────────────────────────────────────────
  const submitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authApi.login(username, password);
      if ('token' in data) {
        setSession(data.user, data.token, remember);
        return;
      }
      setUserId(data.user_id);
      setMaskedEmail(data.masked_email);
      setStep('otp');
      toast.push({ tone: 'sage', title: 'Código enviado', body: `Revisa ${data.masked_email}` });
    } catch {
      toast.push({ tone: 'danger', title: 'Credenciales incorrectas', body: 'Verifica tu usuario y contraseña' });
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 2: verify OTP ───────────────────────────────────────────────────
  const submitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);
    try {
      const { data } = await authApi.verifyLoginOtp(userId, otp);
      setSession(data.user, data.token, remember);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { errors?: { otp?: string[] } } } };
      const msg = e?.response?.data?.errors?.otp?.[0] ?? 'Código incorrecto o expirado';
      toast.push({ tone: 'danger', title: 'Verificación fallida', body: msg });
    } finally {
      setLoading(false);
    }
  };

  // ─── Resend OTP ───────────────────────────────────────────────────────────
  const resendOtp = async () => {
    if (!userId || resending) return;
    setResending(true);
    try {
      await authApi.login(username, password);
      toast.push({ tone: 'sage', title: 'Código reenviado', body: `Revisa ${maskedEmail}` });
      setOtp('');
    } catch {
      toast.push({ tone: 'danger', title: 'Error al reenviar', body: 'Intenta de nuevo' });
    } finally {
      setResending(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {step === 'credentials' ? (
        <form onSubmit={submitCredentials} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h2 className="serif" style={{ fontSize: 22, fontWeight: 500, marginBottom: 4 }}>
              Hola otra vez <Flower2 size={20} style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: 4, animation: 'leaf-sway 2s ease-in-out infinite' }} color="var(--sage-deep)" />
            </h2>
            <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>Ingresa para ver tu agenda del día.</p>
          </div>

          <div className="field">
            <label>Usuario</label>
            <div className="input-pill">
              <span className="icon-prefix"><User size={18} /></span>
              <input className="input" value={username} onChange={e => setUsername(e.target.value)}
                placeholder="tu usuario" required autoComplete="username" />
            </div>
          </div>

          <div className="field">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <label style={{ marginBottom: 0 }}>Contraseña</label>
              <button type="button" onClick={() => setForgotOpen(true)}
                style={{ fontSize: 12, color: 'var(--ink-soft)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <div className="input-pill">
              <span className="icon-prefix"><Lock size={18} /></span>
              <input type={showPwd ? 'text' : 'password'} className="input"
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required autoComplete="current-password" style={{ paddingRight: 40 }} />
              <button type="button" onClick={() => setShowPwd(v => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-soft)', display: 'flex', alignItems: 'center', padding: 2 }}>
                {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13.5, color: 'var(--ink-soft)', userSelect: 'none' }}>
            <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: 'var(--sage-deep)', cursor: 'pointer' }} />
            Recordarme en este dispositivo
          </label>

          <button type="submit" className="btn btn-primary" disabled={loading}
            style={{ justifyContent: 'center', padding: '12px 18px', borderRadius: 12, fontSize: 14, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Verificando…' : 'Continuar'} <ArrowRight size={18} />
          </button>

          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
            Tus datos viajan seguros y se guardan cifrados <Lock size={12} style={{ verticalAlign: 'middle' }} />
          </div>
        </form>
      ) : (
        <form onSubmit={submitOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h2 className="serif" style={{ fontSize: 22, fontWeight: 500, marginBottom: 4 }}>
              Verificación <span style={{ display: 'inline-block' }}>🔐</span>
            </h2>
            <p style={{ color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.5 }}>
              Enviamos un código de 6 dígitos a <strong>{maskedEmail}</strong>. Expira en 5 minutos.
            </p>
          </div>

          <div className="field">
            <label>Código de verificación</label>
            <div className="input-pill">
              <span className="icon-prefix"><KeyRound size={18} /></span>
              <input className="input" value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000" required pattern="\d{6}" autoFocus
                style={{ letterSpacing: 8, fontFamily: 'monospace', fontSize: 22, textAlign: 'center' }} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--card-tint)', borderRadius: 12 }}>
            <Mail size={14} color="var(--ink-soft)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 12.5, color: 'var(--ink-soft)', flex: 1 }}>¿No llegó? Revisa spam o</span>
            <button type="button" onClick={resendOtp} disabled={resending}
              style={{ fontSize: 12.5, color: 'var(--sage-deep)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, padding: 0 }}>
              <RefreshCw size={13} style={{ animation: resending ? 'spin 1s linear infinite' : 'none' }} />
              {resending ? 'Enviando…' : 'reenviar'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => { setStep('credentials'); setOtp(''); }}>
              Atrás
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || otp.length !== 6}
              style={{ flex: 2, justifyContent: 'center', opacity: otp.length === 6 ? 1 : 0.5 }}>
              {loading ? 'Verificando…' : 'Entrar al consultorio'} <ArrowRight size={18} />
            </button>
          </div>
        </form>
      )}

      <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} />
    </>
  );
}
