import { useState } from 'react';
import { User, Lock, ArrowRight, ArrowLeft, Eye, EyeOff, CheckCircle, XCircle, Sparkles, KeyRound, Mail, RefreshCw } from 'lucide-react';
import { useAuth } from '@/app/AuthContext';
import { useToast } from '@/app/ToastContext';
import { authApi } from '@/lib/api';

interface RegisterForm {
  name: string; email: string; phone: string; age: string;
  sex: 'F' | 'M' | 'X'; address: string; username: string; password: string;
}

const PASSWORD_RULES = [
  { id: 'len',     label: 'Mínimo 8 caracteres',         test: (p: string) => p.length >= 8 },
  { id: 'upper',   label: 'Una letra mayúscula',          test: (p: string) => /[A-Z]/.test(p) },
  { id: 'number',  label: 'Un número',                    test: (p: string) => /[0-9]/.test(p) },
  { id: 'special', label: 'Un carácter especial (!@#$%)', test: (p: string) => /[!@#$%^&*()\-_=+[\]{};:'",.<>/?\\|]/.test(p) },
];

interface Props { onDone: () => void; }

export function RegisterFormComp({ onDone: _onDone }: Props) {
  const toast = useToast();
  const { setSession } = useAuth();

  const [step,        setStep]        = useState(1);
  const [form,        setForm]        = useState<RegisterForm>({
    name: '', email: '', phone: '', age: '', sex: 'F', address: '', username: '', password: '',
  });
  const [submitting,  setSubmitting]  = useState(false);

  // Step 3 state
  const [userId,      setUserId]      = useState<number | null>(null);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [code,        setCode]        = useState('');
  const [resending,   setResending]   = useState(false);

  const upd = (k: keyof RegisterForm, v: string) => setForm(f => ({ ...f, [k]: v }));

  // ─── Step 2 → Step 3: register account ───────────────────────────────────
  const submitRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await authApi.register({
        ...form,
        age: Number(form.age),
        role: 'paciente',
      } as never);
      setUserId(data.user_id);
      setMaskedEmail(data.masked_email);
      setStep(3);
      toast.push({ tone: 'sage', title: '¡Cuenta creada!', body: `Revisa ${data.masked_email} para verificar tu correo` });
    } catch (e: unknown) {
      const err = e as { code?: string; response?: { status?: number; data?: { message?: string; errors?: Record<string, string[]> } } };
      if (!err.response) {
        toast.push({ tone: 'danger', title: 'Sin conexión al servidor', body: 'Asegúrate de que el backend esté corriendo' });
      } else if (err.response.status === 422) {
        const firstError = Object.values(err.response.data?.errors ?? {})[0]?.[0] ?? err.response.data?.message;
        toast.push({ tone: 'danger', title: 'Error de validación', body: firstError ?? 'Revisa los datos ingresados' });
      } else {
        toast.push({ tone: 'danger', title: 'Error al registrar', body: err.response.data?.message ?? 'Intenta de nuevo' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Step 3: verify email code → receive token ────────────────────────────
  const submitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSubmitting(true);
    try {
      const { data } = await authApi.verifyEmailCode(userId, code);
      setSession(data.user, data.token);
      toast.push({ tone: 'sage', title: 'Correo verificado', body: '¡Bienvenido/a al consultorio!' });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { errors?: { code?: string[] } } } };
      const msg = e?.response?.data?.errors?.code?.[0] ?? 'Código incorrecto o expirado';
      toast.push({ tone: 'danger', title: 'Verificación fallida', body: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const resendCode = async () => {
    if (!userId || resending) return;
    setResending(true);
    try {
      await authApi.resendEmailVerification(userId);
      toast.push({ tone: 'sage', title: 'Código reenviado', body: `Revisa ${maskedEmail}` });
      setCode('');
    } catch {
      toast.push({ tone: 'danger', title: 'Error al reenviar', body: 'Intenta de nuevo' });
    } finally {
      setResending(false);
    }
  };

  // ─── Step indicator ───────────────────────────────────────────────────────
  const StepBar = () => (
    <div style={{ display: 'flex', gap: 8 }}>
      {[1, 2, 3].map(n => (
        <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px 6px 6px', borderRadius: 999, background: step >= n ? 'var(--butter)' : 'var(--card-tint)', fontSize: 12, fontWeight: 500, color: step >= n ? 'var(--ink)' : 'var(--muted)' }}>
          <span style={{ width: 22, height: 22, borderRadius: '50%', background: step > n ? 'var(--ok)' : step === n ? 'var(--ink)' : 'var(--hairline)', color: step >= n ? '#FFF9EE' : 'var(--muted)', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 600 }}>
            {step > n ? '✓' : n}
          </span>
          {n === 1 ? 'Datos' : n === 2 ? 'Acceso' : 'Verificar'}
        </div>
      ))}
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <form onSubmit={step === 3 ? submitVerification : step === 2 ? submitRegister : e => { e.preventDefault(); setStep(2); }}
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      <div>
        <h2 className="serif" style={{ fontSize: 21, fontWeight: 500, marginBottom: 4 }}>Crea tu cuenta de paciente</h2>
        <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>Solo te toma 1 minuto.</p>
      </div>

      <StepBar />

      {/* ── Step 1: personal data ── */}
      {step === 1 && <>
        <div className="field"><label>Nombre completo</label><input className="input" value={form.name} onChange={e => upd('name', e.target.value)} placeholder="Ej. Mariana Olvera" required /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="field"><label>Edad</label><input className="input" type="number" value={form.age} onChange={e => upd('age', e.target.value)} placeholder="32" required /></div>
          <div className="field">
            <label>Sexo</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['F', 'M', 'X'] as const).map(s => (
                <button key={s} type="button" style={{ flex: 1, padding: '10px 0', borderRadius: 12, background: form.sex === s ? 'var(--ink)' : 'var(--bg-warm-white)', color: form.sex === s ? '#FFF9EE' : 'var(--ink-soft)', fontWeight: 600, fontSize: 14, transition: 'all .2s var(--ease)' }} onClick={() => upd('sex', s)}>{s}</button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="field"><label>Correo</label><input className="input" type="email" value={form.email} onChange={e => upd('email', e.target.value)} placeholder="tu@correo.mx" required /></div>
          <div className="field"><label>Teléfono</label><input className="input" value={form.phone} onChange={e => upd('phone', e.target.value)} placeholder="+52 ..." /></div>
        </div>
        <div className="field"><label>Dirección</label><input className="input" value={form.address} onChange={e => upd('address', e.target.value)} placeholder="Calle, número, ciudad" /></div>
        <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', padding: '12px 18px', borderRadius: 12 }}>
          Continuar <ArrowRight size={18} />
        </button>
      </>}

      {/* ── Step 2: username + password ── */}
      {step === 2 && <Step2Form
        username={form.username}
        password={form.password}
        onUsername={(v: string) => upd('username', v)}
        onPassword={(v: string) => upd('password', v)}
        onBack={() => setStep(1)}
        submitting={submitting}
      />}

      {/* ── Step 3: email verification ── */}
      {step === 3 && (
        <>
          <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.55 }}>
            Enviamos un código de 6 dígitos a <strong>{maskedEmail}</strong>.<br />
            Introdúcelo para activar tu cuenta.
          </p>

          <div className="field">
            <label>Código de verificación</label>
            <div className="input-pill">
              <span className="icon-prefix"><KeyRound size={18} /></span>
              <input className="input" value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000" required pattern="\d{6}" autoFocus
                style={{ letterSpacing: 8, fontFamily: 'monospace', fontSize: 22, textAlign: 'center' }} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--card-tint)', borderRadius: 12 }}>
            <Mail size={14} color="var(--ink-soft)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 12.5, color: 'var(--ink-soft)', flex: 1 }}>¿No llegó? Revisa spam o</span>
            <button type="button" onClick={resendCode} disabled={resending}
              style={{ fontSize: 12.5, color: 'var(--sage-deep)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, padding: 0 }}>
              <RefreshCw size={13} style={{ animation: resending ? 'spin 1s linear infinite' : 'none' }} />
              {resending ? 'Enviando…' : 'reenviar'}
            </button>
          </div>

          <button type="submit" className="btn btn-primary"
            disabled={submitting || code.length !== 6}
            style={{ justifyContent: 'center', padding: '12px 18px', borderRadius: 12, opacity: code.length === 6 ? 1 : 0.5 }}>
            {submitting ? 'Verificando…' : 'Verificar y entrar'} <Sparkles size={16} />
          </button>
        </>
      )}
    </form>
  );
}

function Step2Form({ username, password, onUsername, onPassword, onBack, submitting }: {
  username: string; password: string;
  onUsername: (v: string) => void; onPassword: (v: string) => void;
  onBack: () => void; submitting: boolean;
}) {
  const [showPass, setShowPass] = useState(false);
  const rules = PASSWORD_RULES.map(r => ({ ...r, ok: r.test(password) }));
  const allOk = rules.every(r => r.ok);

  return (
    <>
      <div className="field">
        <label>Nombre de usuario</label>
        <div className="input-pill">
          <span className="icon-prefix"><User size={18} /></span>
          <input className="input" value={username} onChange={e => onUsername(e.target.value)} placeholder="elige un usuario" required />
        </div>
      </div>

      <div className="field">
        <label>Contraseña</label>
        <div className="input-pill" style={{ position: 'relative' }}>
          <span className="icon-prefix"><Lock size={18} /></span>
          <input type={showPass ? 'text' : 'password'} className="input"
            value={password} onChange={e => onPassword(e.target.value)}
            placeholder="mínimo 8 caracteres" required style={{ paddingRight: 44 }} />
          <button type="button" onClick={() => setShowPass(s => !s)}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
            tabIndex={-1}>
            {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </div>

      {password.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px' }}>
          {rules.map(r => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: r.ok ? 'var(--ok)' : 'var(--muted)', transition: 'color .2s' }}>
              {r.ok ? <CheckCircle size={13} /> : <XCircle size={13} />}
              {r.label}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: 12, background: 'var(--card-tint)', borderRadius: 14 }}>
        <Lock size={16} color="var(--ok)" style={{ marginTop: 2, flexShrink: 0 }} />
        <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', lineHeight: 1.5 }}>Tu información clínica se guarda con candado. Solo tú y tu médico la pueden ver.</div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button type="button" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={onBack}>
          <ArrowLeft size={16} /> Atrás
        </button>
        <button type="submit" className="btn btn-primary" style={{ flex: 2, justifyContent: 'center', opacity: allOk ? 1 : 0.5 }} disabled={submitting || !allOk}>
          {submitting ? 'Creando…' : 'Crear mi cuenta'} <ArrowRight size={16} />
        </button>
      </div>
    </>
  );
}
