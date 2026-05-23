import { useState, useEffect } from 'react';
import { appointmentsApi, myDoctorsApi, type DoctorSummary } from '@/lib/api';
import { useToast } from '@/app/ToastContext';
import { fmtDate, fmtTime } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Stethoscope } from 'lucide-react';

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
function isPastSlot(date: string, hour: number, min: number) {
  const todayStr = new Date().toLocaleDateString('sv');
  if (date !== todayStr) return false;
  const now = new Date();
  return hour * 60 + min <= now.getHours() * 60 + now.getMinutes();
}

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export function BookAppointmentDialog({ open, onClose, onCreated }: Props) {
  const toast = useToast();
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate]         = useState(today);
  const [hour, setHour]         = useState('9');
  const [min, setMin]           = useState('00');
  const [reason, setReason]     = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [doctors, setDoctors]   = useState<DoctorSummary[]>([]);
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    if (open) {
      myDoctorsApi.list()
        .then(r => {
          setDoctors(r.data);
          if (r.data.length === 1) setDoctorId(String(r.data[0].id));
        })
        .catch(() => setDoctors([]));
    }
  }, [open]);

  const handleBook = async () => {
    if (!doctorId) {
      toast.push({ tone: 'danger', title: 'Selecciona un médico', body: 'Elige con quién quieres tu cita' });
      return;
    }
    setSaving(true);
    try {
      const localDt = `${date}T${String(hour).padStart(2, '0')}:${min}:00`;
      const created = await appointmentsApi.create({
        appointment_date: localDt,
        duration: 30,
        status: 'pending',
        reason,
        doctor_id: Number(doctorId),
      });
      const apptDate = created.data.appointment_date;
      toast.push({
        tone: 'sage',
        title: 'Cita reservada',
        body: `${fmtDate(apptDate)} a las ${fmtTime(apptDate)}`,
      });
      setDate(today); setHour('9'); setMin('00'); setReason(''); setDoctorId('');
      onClose();
      onCreated?.();
    } catch (e: unknown) {
      const err = e as { response?: { status?: number; data?: { message?: string } } };
      if (err.response?.status === 409) {
        toast.push({ tone: 'danger', title: 'Horario ocupado', body: 'Ese horario ya no está disponible. Elige otro.' });
      } else if (!err.response) {
        toast.push({ tone: 'danger', title: 'Sin conexión', body: 'Verifica que el backend esté corriendo.' });
      } else {
        toast.push({ tone: 'danger', title: 'Error al reservar', body: err.response.data?.message ?? 'Intenta de nuevo' });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Reservar cita" maxWidth={460}>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 4 }}>
        Elige el médico, día y hora. El sistema confirmará disponibilidad en tiempo real.
      </p>

      {/* Doctor selector */}
      <div className="flex flex-col gap-1.5">
        <Label>Médico</Label>
        {doctors.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--card-tint)', borderRadius: 12, fontSize: 13, color: 'var(--ink-soft)' }}>
            <Stethoscope size={16} />
            No tienes médicos asignados. Contacta al consultorio.
          </div>
        ) : (
          <select
            className="select h-9 w-full rounded-lg border px-3 text-sm"
            style={{ borderColor: 'var(--color-input)', background: 'var(--bg-warm-white)' }}
            value={doctorId}
            onChange={e => setDoctorId(e.target.value)}
          >
            {doctors.length > 1 && <option value="">— Selecciona un médico —</option>}
            {doctors.map(d => (
              <option key={d.id} value={d.id}>
                {d.name}{d.speciality ? ` · ${d.speciality}` : ''}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Fecha</Label>
        <Input
          type="date"
          value={date}
          min={today}
          onChange={e => setDate(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>Hora</Label>
          <select
            className="select h-9 w-full rounded-lg border px-3 text-sm"
            style={{ borderColor: 'var(--color-input)', background: 'var(--bg-warm-white)' }}
            value={hour}
            onChange={e => setHour(e.target.value)}
          >
            {HOURS.map(h => (
              <option key={h} value={h} disabled={isPastSlot(date, h, Number(min))}>
                {String(h).padStart(2, '0')}:00
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Minutos</Label>
          <select
            className="select h-9 w-full rounded-lg border px-3 text-sm"
            style={{ borderColor: 'var(--color-input)', background: 'var(--bg-warm-white)' }}
            value={min}
            onChange={e => setMin(e.target.value)}
          >
            <option value="00" disabled={isPastSlot(date, Number(hour), 0)}>:00</option>
            <option value="30" disabled={isPastSlot(date, Number(hour), 30)}>:30</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Motivo (opcional)</Label>
        <Input
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Revisión general, consulta…"
        />
      </div>

      <div className="flex gap-2 justify-end pt-1">
        <button className="btn btn-secondary" onClick={onClose} disabled={saving}>
          Cancelar
        </button>
        <button className="btn btn-primary" onClick={handleBook} disabled={saving || !date || !doctorId}>
          {saving ? 'Reservando…' : 'Reservar'}
        </button>
      </div>
    </Modal>
  );
}
