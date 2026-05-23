import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Parsea una fecha del backend tratándola como hora LOCAL (sin conversión UTC).
 * El backend devuelve "2026-05-21T09:00:00.000000Z" pero la hora "09:00" es
 * la hora real de la cita — nunca debe convertirse a la zona horaria del browser.
 */
export function parseApptDate(dateStr: string): Date {
  // Quita el Z y los microsegundos para evitar conversión UTC→local
  const clean = dateStr.replace('Z', '').split('.')[0]; // "2026-05-21T09:00:00"
  return new Date(clean);
}

export function fmtDate(dateStr: string): string {
  const d = parseApptDate(dateStr);
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function fmtTime(dateStr: string): string {
  const d = parseApptDate(dateStr);
  return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

export function fmtDateTime(dateStr: string): string {
  return `${fmtDate(dateStr)} · ${fmtTime(dateStr)}`;
}

export function timeAgo(dateStr: string): string {
  // timeAgo usa tiempo real (createdAt sí tiene timezone correcta)
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'ayer';
  return `hace ${days} días`;
}

export function initials(name: string): string {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

const AVATAR_COLORS = ['peach', 'sage', 'butter', 'lavender', 'blush'];
export function avatarColor(id: number): string {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}
