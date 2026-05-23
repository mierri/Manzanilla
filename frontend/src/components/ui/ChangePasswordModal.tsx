import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { Modal } from './Modal';
import { useToast } from '@/app/ToastContext';
import api from '@/lib/api';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ open, onClose }: Props) {
  const toast = useToast();
  const [current,  setCurrent]  = useState('');
  const [newPwd,   setNewPwd]   = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [show,     setShow]     = useState(false);
  const [loading,  setLoading]  = useState(false);

  const reset = () => { setCurrent(''); setNewPwd(''); setConfirm(''); };
  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPwd !== confirm) {
      toast.push({ tone: 'danger', title: 'Las contraseñas no coinciden' });
      return;
    }
    setLoading(true);
    try {
      await api.put('/auth/change-password', {
        current_password: current,
        new_password: newPwd,
        new_password_confirmation: confirm,
      });
      toast.push({ tone: 'sage', title: 'Contraseña actualizada', body: '¡Todo listo!' });
      handleClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { errors?: { current_password?: string[] } } } };
      const msg = e?.response?.data?.errors?.current_password?.[0] ?? 'No se pudo actualizar la contraseña';
      toast.push({ tone: 'danger', title: 'Error', body: msg });
    } finally { setLoading(false); }
  };

  const inputType = show ? 'text' : 'password';

  return (
    <Modal open={open} onClose={handleClose} title="Cambiar contraseña" maxWidth={400}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="field">
          <label>Contraseña actual</label>
          <div className="input-pill">
            <span className="icon-prefix"><Lock size={18} /></span>
            <input type={inputType} className="input" value={current}
              onChange={e => setCurrent(e.target.value)} placeholder="Tu contraseña actual" required autoFocus />
          </div>
        </div>
        <div className="field">
          <label>Nueva contraseña</label>
          <div className="input-pill">
            <span className="icon-prefix"><Lock size={18} /></span>
            <input type={inputType} className="input" value={newPwd}
              onChange={e => setNewPwd(e.target.value)} placeholder="Mín. 8 caracteres" required minLength={8} />
          </div>
        </div>
        <div className="field">
          <label>Confirmar nueva contraseña</label>
          <div className="input-pill" style={{ position: 'relative' }}>
            <span className="icon-prefix"><Lock size={18} /></span>
            <input type={inputType} className="input" value={confirm}
              onChange={e => setConfirm(e.target.value)} placeholder="Repite la contraseña" required
              style={{ paddingRight: 40 }} />
            <button type="button" onClick={() => setShow(v => !v)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-soft)', display: 'flex', padding: 2 }}>
              {show ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
          <button type="button" className="btn btn-ghost" onClick={handleClose}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Guardando…' : 'Cambiar contraseña'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
