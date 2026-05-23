import { useState, useEffect } from 'react';
import { appointmentsApi, patientsApi } from '@/lib/api';
import { useToast } from '@/app/ToastContext';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Appointment, Patient } from '@/types';

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
const today = () => new Date().toLocaleDateString('sv');
function isPastSlot(date: string, hour: number, min: number) {
  if (date !== today()) return false;
  const now = new Date();
  return hour * 60 + min <= now.getHours() * 60 + now.getMinutes();
}

const selectStyle: React.CSSProperties = {
  height: 36,
  borderRadius: 8,
  border: '1px solid var(--hairline)',
  background: 'var(--bg-warm-white)',
  padding: '0 8px',
  fontSize: 14,
  color: 'var(--ink)',
  width: '100%',
};

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: (appt: Appointment) => void;
  initial?: { date?: string; hour?: number; min?: number };
}

export function NewAppointmentModal({ open, onClose, onCreated, initial }: Props) {
  const toast = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientId, setPatientId] = useState('');
  const [date, setDate] = useState(initial?.date ?? new Date().toLocaleDateString('sv'));
  const [hour, setHour] = useState(String(initial?.hour ?? 9));
  const [min, setMin] = useState('00');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) patientsApi.list().then(r => setPatients(r.data));
  }, [open]);

  useEffect(() => {
    if (initial?.date) setDate(initial.date);
    if (initial?.hour != null) setHour(String(initial.hour));
    if (initial?.min != null) setMin(String(initial.min).padStart(2, '0'));
  }, [initial]);

  const handleSave = async () => {
    if (!patientId) return;
    setSaving(true);
    try {
      const localDt = `${date}T${String(hour).padStart(2, '0')}:${min}:00`;
      const { data: created } = await appointmentsApi.create({
        patient_id: Number(patientId),
        appointment_date: localDt,
        duration: 30,
        status: 'confirmed',
        reason,
      });
      toast.push({ tone: 'sage', title: 'Cita creada' });
      setPatientId('');
      setReason('');
      onClose();
      onCreated?.(created);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      if (err.response?.data?.message?.includes('occupied')) {
        toast.push({ tone: 'danger', title: 'Horario ocupado', body: 'Ese horario ya fue reservado. Elige otro.' });
      } else {
        toast.push({ tone: 'danger', title: 'Error al crear la cita' });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Nueva cita">
      <div className="grid grid-cols-2 gap-3 resp-modal-form-2">
        <div className="flex flex-col gap-1.5 col-span-2">
          <Label>Paciente</Label>
          <select
            style={selectStyle}
            value={patientId}
            onChange={e => setPatientId(e.target.value)}
          >
            <option value="">Seleccionar…</option>
            {patients.map(p => (
              <option key={p.id} value={String(p.id)}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Fecha</Label>
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Hora</Label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 72px', gap: 8 }}>
            <select style={selectStyle} value={hour} onChange={e => setHour(e.target.value)}>
              {HOURS.map(h => (
                <option key={h} value={h} disabled={isPastSlot(date, h, Number(min))}>
                  {String(h).padStart(2, '0')}:00
                </option>
              ))}
            </select>
            <select style={selectStyle} value={min} onChange={e => setMin(e.target.value)}>
              <option value="00" disabled={isPastSlot(date, Number(hour), 0)}>:00</option>
              <option value="30" disabled={isPastSlot(date, Number(hour), 30)}>:30</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 col-span-2">
          <Label>Motivo</Label>
          <Input value={reason} onChange={e => setReason(e.target.value)} placeholder="Revisión general, seguimiento…" />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancelar</button>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving || !patientId}>
          {saving ? 'Guardando…' : 'Crear cita'}
        </button>
      </div>
    </Modal>
  );
}
