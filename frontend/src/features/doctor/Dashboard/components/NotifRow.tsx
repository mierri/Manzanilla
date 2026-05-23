import { Bell, X } from 'lucide-react';
import { timeAgo } from '@/lib/utils';
import type { Notification } from '@/types';

interface Props {
  note: Notification;
  onDelete?: (id: number) => void;
}

export function NotifRow({ note: n, onDelete }: Props) {
  const tone = n.read_at ? 'butter' : 'peach';
  return (
    <div
      style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 8px', borderRadius: 14, transition: 'background .2s var(--ease)', position: 'relative' }}
      onMouseEnter={e => {
        (e.currentTarget.style.background = 'var(--card-tint)');
        const btn = e.currentTarget.querySelector<HTMLButtonElement>('.notif-del');
        if (btn) btn.style.opacity = '1';
      }}
      onMouseLeave={e => {
        (e.currentTarget.style.background = 'transparent');
        const btn = e.currentTarget.querySelector<HTMLButtonElement>('.notif-del');
        if (btn) btn.style.opacity = '0';
      }}>
      <div style={{ width: 36, height: 36, borderRadius: 12, background: `var(--${tone})`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <Bell size={16} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: n.read_at ? 400 : 600, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 8 }}>
          {n.title}
          {!n.read_at && (
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--peach-deep)', flexShrink: 0, animation: 'dot-pulse 2s ease-in-out infinite' }} />
          )}
        </div>
        {n.body && <div style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginTop: 2 }}>{n.body}</div>}
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{timeAgo(n.created_at)}</div>
      </div>
      {onDelete && (
        <button
          className="notif-del"
          onClick={e => { e.stopPropagation(); onDelete(n.id); }}
          style={{ opacity: 0, transition: 'opacity .15s', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-soft)', padding: 4, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center' }}
          title="Eliminar notificación">
          <X size={14} />
        </button>
      )}
    </div>
  );
}
