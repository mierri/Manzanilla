import { useState } from 'react';
import { Mail, Lock, ArrowRight, KeyRound, CheckCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/app/ToastContext';
import api from '@/lib/api';

type Step = 'email' | 'code' | 'done';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ open, onClose }: Props) {
  const toast = useToast();
  const [step, setStep]               = useState<Step>('email');
  const [email, setEmail]             = useState('');
  const [code, setCode]               = useState('');
  const [newPwd, setNewPwd]           = useState('');
  const [confirmPwd, setConfirmPwd]   = useState('');
  const [showPwd, setShowPwd]         = useState(false);
  const [loading, setLoading]         = useState(false);

  const reset = () => {
    setStep('email'); setEmail(''); setCode('');
    setNewPwd(''); setConfirmPwd('');
  };

  const handleClose = () => { reset(); onClose(); };

  const sendCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setStep('code');
      toast.push({ tone: 'sage', title: 'Código enviado', body: 'Revisa tu correo electrónico' });
    } catch {
      toast.push({ tone: 'danger', title: 'Correo no encontrado', body: 'Verifica la dirección ingresada' });
    } finally { setLoading(false); }
  };

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) {
      toast.push({ tone: 'danger', title: 'Las contraseñas no coinciden' });
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email,
        code,
        new_password: newPwd,
        new_password_confirmation: confirmPwd,
      });
      setStep('done');
      toast.push({ tone: 'sage', title: 'Contraseña restablecida', body: 'Ya puedes iniciar sesión' });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { errors?: { code?: string[] } } } };
      const msg = e?.response?.data?.errors?.code?.[0] ?? 'Código incorrecto o expirado';
      toast.push({ tone: 'danger', title: 'Error', body: msg });
    } finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Recuperar contraseña" maxWidth={420}>
      {step === 'email' && (
        <form onSubmit={sendCode} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
            Ingresa tu correo registrado y te enviaremos un código de 6 dígitos para restablecer tu contraseña.
          </p>
          <div className="field">
            <label>Correo electrónico</label>
            <div className="input-pill">
              <span className="icon-prefix"><Mail size={18} /></span>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="tucorreo@ejemplo.com" required autoFocus />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={handleClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Enviando…' : 'Enviar código'} <ArrowRight size={16} />
            </button>
          </div>
        </form>
      )}

      {step === 'code' && (
        <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
            Ingresa el código de 6 dígitos enviado a <strong>{email}</strong> y elige tu nueva contraseña.
          </p>
          <div className="field">
            <label>Código de verificación</label>
            <div className="input-pill">
              <span className="icon-prefix"><KeyRound size={18} /></span>
              <input className="input" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000" required pattern="\d{6}" style={{ letterSpacing: 6, fontFamily: 'monospace', fontSize: 18 }} />
            </div>
          </div>
          <div className="field">
            <label>Nueva contraseña</label>
            <div className="input-pill" style={{ position: 'relative' }}>
              <span className="icon-prefix"><Lock size={18} /></span>
              <input type={showPwd ? 'text' : 'password'} className="input" value={newPwd}
                onChange={e => setNewPwd(e.target.value)} placeholder="Mín. 8 caracteres" required minLength={8} />
            </div>
          </div>
          <div className="field">
            <label>Confirmar contraseña</label>
            <div className="input-pill">
              <span className="icon-prefix"><Lock size={18} /></span>
              <input type={showPwd ? 'text' : 'password'} className="input" value={confirmPwd}
                onChange={e => setConfirmPwd(e.target.value)} placeholder="Repite la contraseña" required />
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink-soft)', cursor: 'pointer' }}>
            <input type="checkbox" checked={showPwd} onChange={e => setShowPwd(e.target.checked)}
              style={{ accentColor: 'var(--sage-deep)' }} />
            Mostrar contraseñas
          </label>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setStep('email')}>Atrás</button>
            <button type="submit" className="btn btn-primary" disabled={loading || code.length !== 6}>
              {loading ? 'Guardando…' : 'Restablecer contraseña'}
            </button>
          </div>
        </form>
      )}

      {step === 'done' && (
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <CheckCircle size={52} color="var(--ok)" style={{ marginBottom: 12 }} />
          <h3 className="serif" style={{ fontSize: 20, fontWeight: 500, marginBottom: 8 }}>¡Contraseña restablecida!</h3>
          <p style={{ color: 'var(--ink-soft)', fontSize: 14, marginBottom: 20 }}>Ya puedes iniciar sesión con tu nueva contraseña.</p>
          <button className="btn btn-primary" onClick={handleClose}>Ir al inicio de sesión</button>
        </div>
      )}
    </Modal>
  );
}
