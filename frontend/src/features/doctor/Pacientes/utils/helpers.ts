import type { Patient } from '@/types';

export function daysSince(dateStr?: string): string {
  if (!dateStr) return 'Sin visita';
  const days = Math.round((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Ayer';
  return `Hace ${days} días`;
}

export function patientChip(p: Patient): { tone: string; label: string } {
  if (!p.last_visit) return { tone: 'butter', label: 'Sin visita' };
  const days = Math.round((Date.now() - new Date(p.last_visit).getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 7)  return { tone: 'sage',   label: 'Reciente' };
  if (days <= 60) return { tone: 'butter', label: 'Regular' };
  return { tone: 'peach', label: 'Hace tiempo' };
}
