// Shared styles, fonts and utilities for HTML-based PDF reports

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,300..700&family=Newsreader:ital,opsz,wght@0,6..72,300..700;1,6..72,300..700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>`;

const CSS = `
:root{
  --bg:#FBF5EC;--bg-alt:#F6EEDF;--bg-warm:#FFFCF6;
  --card:#FFFFFF;--ct:#FFF9EE;
  --peach:#F8D9C2;--peach-d:#F2BFA0;
  --butter:#F5E5BD;
  --sage:#D9E5CF;--sage-d:#BCCFAE;
  --lavender:#E5DBF0;--blush:#F4C9C4;
  --ink:#2B2520;--inks:#5C5048;--muted:#A1958A;--hair:#EFE5D2;
  --ok:#4A7C56;--warn:#C97A3D;--danger:#B5524C;
  --shadow-sm:0 1px 4px rgba(70,50,30,.06),0 4px 12px -4px rgba(70,50,30,.10);
  --shadow-md:0 4px 12px rgba(70,50,30,.07),0 14px 28px -8px rgba(70,50,30,.12);
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{font-size:13px}
body{
  font-family:"DM Sans",system-ui,sans-serif;
  line-height:1.65;color:var(--ink);background:var(--bg);
  -webkit-font-smoothing:antialiased;
  -webkit-print-color-adjust:exact;print-color-adjust:exact;
  orphans:3;widows:3;
}
h1,h2,h3,h4{font-family:"Newsreader",Georgia,serif;font-weight:500;letter-spacing:-.015em}
.mono{font-family:"DM Mono",monospace}

/* ── Wrap ── */
.wrap{max-width:720px;margin:0 auto;padding:0 40px 80px}

/* ── Doc header band ── */
.doc-header{
  background:var(--butter);padding:44px 52px;margin-bottom:0;
  position:relative;overflow:hidden;
  page-break-inside:avoid;break-inside:avoid;
}
.doc-header::before{
  content:"";position:absolute;border-radius:50%;
  width:360px;height:360px;background:var(--lavender);opacity:.38;
  top:-80px;right:-60px;pointer-events:none;
}
.doc-header::after{
  content:"";position:absolute;border-radius:50%;
  width:220px;height:220px;background:var(--peach);opacity:.42;
  bottom:-40px;right:160px;pointer-events:none;
}
.doc-header-inner{position:relative;z-index:1;display:flex;align-items:flex-start;justify-content:space-between;gap:20px}
.doc-header-label{font-size:9.5px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--warn);margin-bottom:10px}
.doc-header h1{font-size:2.5rem;color:var(--ink);line-height:1.05}
.doc-header-sub{font-size:13px;color:var(--inks);margin-top:6px}
.doc-header-meta{text-align:right;white-space:nowrap}
.doc-header-meta strong{display:block;font-family:"Newsreader",serif;font-size:14.5px;color:var(--ink);margin-bottom:3px}
.doc-header-meta span{font-size:11.5px;color:var(--muted)}

/* ── Chips ── */
.chips{display:flex;flex-wrap:wrap;gap:7px;margin-top:16px}
.chip{font-size:11px;font-weight:500;background:var(--peach);color:var(--inks);border-radius:999px;padding:3px 11px}

/* ── Section label ── */
.section-label{
  font-size:9.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;
  color:var(--muted);margin:34px 0 16px;padding-bottom:9px;
  border-bottom:1.5px solid var(--hair);
}

/* ── Stat cards ── */
.stat-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:10px}
.stat-card{border-radius:12px;padding:20px 18px 16px;page-break-inside:avoid;break-inside:avoid}
.stat-card .val{font-family:"Newsreader",serif;font-size:2.8rem;font-weight:500;line-height:1;margin-bottom:8px}
.stat-card .lbl{font-size:9px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:var(--inks)}

/* ── Status bars ── */
.status-row{display:grid;grid-template-columns:110px 1fr 64px;gap:12px;align-items:center;margin-bottom:10px}
.status-track{height:10px;border-radius:999px;background:var(--bg-alt);overflow:hidden}
.status-fill{height:100%;border-radius:999px;min-width:4px}
.status-lbl{font-size:12px;color:var(--inks)}
.status-pct{font-family:"DM Mono",monospace;font-size:11.5px;font-weight:500;color:var(--ink)}

/* ── Top patients ── */
.top-patients{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:4px}
.tp-card{background:var(--ct);border-radius:12px;padding:16px 14px;position:relative;overflow:hidden;page-break-inside:avoid;break-inside:avoid}
.tp-card .rank{position:absolute;top:6px;right:10px;font-family:"Newsreader",serif;font-size:2.1rem;font-weight:700;color:var(--hair);line-height:1}
.tp-card .name{font-size:12px;font-weight:600;color:var(--ink);margin-bottom:4px;padding-right:30px}
.tp-card .count{font-size:10.5px;color:var(--muted)}

/* ── Patient table ── */
.patient-table{width:100%;border-collapse:collapse;font-size:11.5px;background:var(--card);border-radius:12px;overflow:hidden;box-shadow:var(--shadow-sm)}
.patient-table th{background:var(--ink);color:var(--bg-warm);padding:9px 12px;text-align:left;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em}
.patient-table td{padding:10px 12px;border-bottom:1px solid var(--hair);vertical-align:middle}
.patient-table tr:nth-child(even) td{background:var(--ct)}
.patient-table tr:last-child td{border-bottom:none}
.patient-table .n-name{font-size:12.5px;font-weight:600;color:var(--ink);display:block}
.patient-table .n-user{font-size:10px;color:var(--muted)}

/* ── Data fields ── */
.data-fields{display:grid;grid-template-columns:1fr 1fr;gap:18px 28px;margin-bottom:20px}
.df .label{font-size:9px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:var(--muted);margin-bottom:3px}
.df .value{font-size:13.5px;color:var(--ink)}

/* ── Vitals ── */
.vitals{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:14px;page-break-inside:avoid;break-inside:avoid}
.vital{background:var(--card);border:1.5px solid var(--hair);border-radius:10px;padding:10px 8px 12px;text-align:center}
.vital .vl{font-size:8.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:6px}
.vital .vv{font-family:"Newsreader",serif;font-size:1.4rem;font-weight:500;color:var(--ink)}

/* ── Calendar ── */
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:7px}
.cal-col{background:var(--ct);border-radius:10px;padding:10px 8px;min-height:180px;page-break-inside:avoid;break-inside:avoid}
.cal-col.today{background:var(--butter)}
.cal-day-name{font-size:8px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--muted);margin-bottom:3px}
.cal-col.today .cal-day-name{color:var(--warn)}
.cal-day-num{font-family:"Newsreader",serif;font-size:1.9rem;font-weight:500;color:var(--ink);line-height:1;margin-bottom:8px;padding-bottom:8px;border-bottom:1.5px solid var(--hair)}
.cal-col.today .cal-day-num{color:var(--warn)}
.cal-appt{background:var(--card);border-radius:6px;padding:6px 7px;margin-bottom:5px;box-shadow:var(--shadow-sm)}
.cal-appt .ca-time{font-size:9.5px;font-weight:700;color:var(--warn)}
.cal-appt .ca-pat{font-size:10px;color:var(--ink);margin-top:2px;line-height:1.3}
.cal-empty{font-size:10px;color:var(--muted);font-style:italic;text-align:center;padding:14px 0}

/* ── Record block ── */
.record{margin-bottom:28px;padding-bottom:28px;border-bottom:1.5px solid var(--hair);page-break-inside:avoid;break-inside:avoid}
.record:last-child{border-bottom:none;padding-bottom:0}
.record-head{background:var(--ct);border-left:4px solid var(--warn);border-radius:0 10px 10px 0;padding:12px 16px;margin-bottom:14px;display:flex;align-items:baseline;gap:14px;flex-wrap:wrap}
.record-head h3{font-size:1.2rem;font-weight:500;color:var(--ink)}
.record-head .rdate{font-size:11.5px;color:var(--muted);margin-left:auto}
.record-diag{font-family:"Newsreader",serif;font-size:14px;line-height:1.75;color:var(--ink);margin-bottom:10px}
.record-field{font-size:11.5px;margin-top:7px;color:var(--inks);line-height:1.6}
.record-field strong{font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);margin-right:7px}

/* ── Security notice ── */
.security{background:var(--sage);border-radius:12px;padding:18px 22px;display:flex;gap:16px;align-items:center;margin-top:36px;page-break-inside:avoid;break-inside:avoid}
.security .icon{font-size:22px;flex-shrink:0}
.security strong{display:block;font-size:13px;color:var(--ok);margin-bottom:3px}
.security p{font-size:11.5px;color:var(--inks);margin:0}

/* ── Doc footer ── */
.doc-footer{text-align:center;padding:32px 0 0;border-top:1.5px solid var(--hair);color:var(--muted);font-size:11px;line-height:1.9;margin-top:48px}

/* ── Print ── */
@media print{
  body{background:white}
  .no-print{display:none!important}
}
`;

// ── Date helpers ──────────────────────────────────────────────

export const MONTHS = ['enero','febrero','marzo','abril','mayo','junio',
  'julio','agosto','septiembre','octubre','noviembre','diciembre'];

export const DAYS = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
export const DAYS_S = ['dom','lun','mar','mié','jue','vie','sáb'];

export function parseD(s: string): Date {
  return new Date(s.includes('T') ? s : s.replace(' ', 'T'));
}

export function fmtDate(s: string): string {
  return s ? parseD(s).toLocaleDateString('es-MX', { year:'numeric', month:'2-digit', day:'2-digit' }) : '—';
}

export function fmtTime(s: string): string {
  return parseD(s).toLocaleTimeString('es-MX', { hour:'2-digit', minute:'2-digit' });
}

export function todayLong(): string {
  return new Date().toLocaleDateString('es-MX', { year:'numeric', month:'long', day:'numeric' });
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

// ── SVG bar chart ─────────────────────────────────────────────

export function barChartSVG(buckets: number[], labels: string[]): string {
  const W = 580, H = 130, PAD_B = 28;
  const chartH = H - PAD_B;
  const max = Math.max(...buckets, 1);
  const barW = 52;
  const gap = (W - buckets.length * barW) / (buckets.length + 1);

  const bars = buckets.map((v, i) => {
    const bh = Math.max((v / max) * (chartH - 18), v > 0 ? 7 : 2);
    const bx = gap + i * (barW + gap);
    const by = chartH - bh;
    const isLast = i === buckets.length - 1;
    const fill = isLast ? '#2B2520' : '#F8D9C2';
    const numFill = isLast ? '#FFFCF6' : '#5C5048';
    return [
      `<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${barW}" height="${bh.toFixed(1)}" rx="7" fill="${fill}"/>`,
      v > 0 ? `<text x="${(bx+barW/2).toFixed(1)}" y="${(by-5).toFixed(1)}" text-anchor="middle" font-family="DM Mono,monospace" font-size="12.5" font-weight="500" fill="${numFill}">${v}</text>` : '',
      `<text x="${(bx+barW/2).toFixed(1)}" y="${(H-5).toFixed(1)}" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="10.5" fill="#A1958A">${labels[i]}</text>`,
    ].join('');
  }).join('');

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:${H}px;display:block;overflow:visible;margin:4px 0 8px">${bars}</svg>`;
}

// ── Document wrapper ──────────────────────────────────────────

export function wrapDoc(opts: {
  title: string;
  pageCSS?: string;
  body: string;
}): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<title>${opts.title}</title>
${FONTS}
<style>
${CSS}
${opts.pageCSS ?? ''}
</style>
</head>
<body>
${opts.body}
<script>
  document.fonts.ready.then(function(){ setTimeout(function(){ window.print(); }, 300); });
</script>
</body>
</html>`;
}

// ── Open in new tab ───────────────────────────────────────────

export function openHTML(html: string): void {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) setTimeout(() => URL.revokeObjectURL(url), 120_000);
}
