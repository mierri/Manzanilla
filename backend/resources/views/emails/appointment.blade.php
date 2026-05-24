<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F7F3ED;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F3ED;padding:40px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#FFFCF6;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(43,37,32,.10);">

        @php
          $icons = [
            'created'     => '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="18" rx="3" stroke="#E65100" stroke-width="2"/><path d="M3 9h18" stroke="#E65100" stroke-width="2"/><path d="M8 2v4M16 2v4" stroke="#E65100" stroke-width="2" stroke-linecap="round"/><path d="M12 13v3M10.5 15h3" stroke="#E65100" stroke-width="2" stroke-linecap="round"/></svg>',
            'confirmed'   => '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="#2E7D32" stroke-width="2"/><path d="M8 12l3 3 5-6" stroke="#2E7D32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            'rescheduled' => '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="18" rx="3" stroke="#1565C0" stroke-width="2"/><path d="M3 9h18" stroke="#1565C0" stroke-width="2"/><path d="M8 2v4M16 2v4" stroke="#1565C0" stroke-width="2" stroke-linecap="round"/><path d="M8.5 15.5a4 4 0 015.66-5.66M15.5 15.5H13M15.5 15.5V13" stroke="#1565C0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            'cancelled'   => '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="#B71C1C" stroke-width="2"/><path d="M9 9l6 6M15 9l-6 6" stroke="#B71C1C" stroke-width="2" stroke-linecap="round"/></svg>',
            'reminder'    => '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 10a6 6 0 0112 0v3.5l1.5 1.5H4.5L6 13.5V10z" stroke="#6A1B9A" stroke-width="2" stroke-linejoin="round"/><path d="M10 18a2 2 0 004 0" stroke="#6A1B9A" stroke-width="2" stroke-linecap="round"/></svg>',
            'default'     => '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="#5A4A3C" stroke-width="2" stroke-linecap="round"/><path d="M9 5a2 2 0 012-2h2a2 2 0 012 2v0a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="#5A4A3C" stroke-width="2"/><path d="M9 12h6M9 16h4" stroke="#5A4A3C" stroke-width="2" stroke-linecap="round"/></svg>',
          ];
          $config = match($event) {
            'created'     => ['icon' => $icons['created'],     'gradient' => 'linear-gradient(135deg,#FFF3E0,#FFE0B2)', 'accent' => '#E65100', 'accentBg' => '#FFF3E0', 'accentBorder' => '#FFCC80', 'badge' => 'Nueva cita'],
            'confirmed'   => ['icon' => $icons['confirmed'],   'gradient' => 'linear-gradient(135deg,#E8F5E9,#C8E6C9)', 'accent' => '#2E7D32', 'accentBg' => '#E8F5E9', 'accentBorder' => '#A5D6A7', 'badge' => 'Confirmada'],
            'rescheduled' => ['icon' => $icons['rescheduled'], 'gradient' => 'linear-gradient(135deg,#E3F2FD,#BBDEFB)', 'accent' => '#1565C0', 'accentBg' => '#E3F2FD', 'accentBorder' => '#90CAF9', 'badge' => 'Reprogramada'],
            'cancelled'   => ['icon' => $icons['cancelled'],   'gradient' => 'linear-gradient(135deg,#FCE4EC,#F8BBD0)', 'accent' => '#B71C1C', 'accentBg' => '#FCE4EC', 'accentBorder' => '#EF9A9A', 'badge' => 'Cancelada'],
            'reminder'    => ['icon' => $icons['reminder'],    'gradient' => 'linear-gradient(135deg,#F3E5F5,#E1BEE7)', 'accent' => '#6A1B9A', 'accentBg' => '#F3E5F5', 'accentBorder' => '#CE93D8', 'badge' => 'Recordatorio'],
            default       => ['icon' => $icons['default'],     'gradient' => 'linear-gradient(135deg,#F7F3ED,#EDE8E0)', 'accent' => '#5A4A3C', 'accentBg' => '#F7F3ED', 'accentBorder' => '#D4C8B8', 'badge' => 'Cita'],
          };

          $messages = [
            'created'     => 'Se agendó una nueva cita para ti. Te esperamos puntual.',
            'confirmed'   => 'Tu médico confirmó la cita. Ya está todo listo para recibirte.',
            'rescheduled' => 'Tu cita fue reprogramada a una nueva fecha y hora.',
            'cancelled'   => 'Lamentablemente tu cita fue cancelada. Puedes agendar una nueva cuando gustes.',
            'reminder'    => '¡No olvides que mañana tienes cita! Te esperamos.',
          ];
        @endphp

        <!-- Header -->
        <tr><td style="background:{{ $config['gradient'] }};padding:32px 40px;text-align:center;">
          <div style="margin-bottom:12px;line-height:0;">{!! $config['icon'] !!}</div>
          <div style="font-family:Georgia,serif;font-size:22px;font-weight:500;color:#2B2520;">
            @if($event === 'created') 🗓️ Nueva cita agendada
            @elseif($event === 'confirmed') ✅ Cita confirmada
            @elseif($event === 'rescheduled') 📅 Cita reprogramada
            @elseif($event === 'cancelled') ❌ Cita cancelada
            @elseif($event === 'reminder') ⏰ Recordatorio de cita
            @endif
          </div>
          <div style="font-size:11px;color:{{ $config['accent'] }};letter-spacing:.15em;text-transform:uppercase;margin-top:4px;">consultorio manzanilla</div>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:36px 40px;">
          <p style="font-size:15px;color:#5A4A3C;margin:0 0 8px;">Hola, <strong>{{ $recipientName }}</strong></p>
          <p style="font-size:14px;color:#7C6A5B;line-height:1.6;margin:0 0 28px;">{{ $messages[$event] ?? '' }}</p>

          <!-- Appointment card -->
          <div style="background:{{ $config['accentBg'] }};border:2px solid {{ $config['accentBorder'] }};border-radius:16px;padding:24px;margin-bottom:28px;">
            <div style="font-size:11px;color:{{ $config['accent'] }};letter-spacing:.12em;text-transform:uppercase;margin-bottom:14px;font-weight:600;">
              Detalles de la cita
            </div>

            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:6px 0;border-bottom:1px solid {{ $config['accentBorder'] }};">
                  <span style="font-size:12px;color:#9A8878;text-transform:uppercase;letter-spacing:.08em;">Fecha y hora</span><br>
                  <span style="font-size:16px;color:#2B2520;font-family:Georgia,serif;font-weight:500;">
                    {{ $appointment->appointment_date->format('l d \d\e F \d\e Y \a \l\a\s H:i') }}
                  </span>
                </td>
              </tr>
              @if($appointment->patient)
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid {{ $config['accentBorder'] }};">
                  <span style="font-size:12px;color:#9A8878;text-transform:uppercase;letter-spacing:.08em;">Paciente</span><br>
                  <span style="font-size:15px;color:#2B2520;">{{ $appointment->patient->name }}</span>
                </td>
              </tr>
              @endif
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid {{ $config['accentBorder'] }};">
                  <span style="font-size:12px;color:#9A8878;text-transform:uppercase;letter-spacing:.08em;">Duración</span><br>
                  <span style="font-size:15px;color:#2B2520;">{{ $appointment->duration ?? 30 }} minutos</span>
                </td>
              </tr>
              @if($appointment->reason)
              <tr>
                <td style="padding:10px 0;">
                  <span style="font-size:12px;color:#9A8878;text-transform:uppercase;letter-spacing:.08em;">Motivo</span><br>
                  <span style="font-size:15px;color:#2B2520;">{{ $appointment->reason }}</span>
                </td>
              </tr>
              @endif
            </table>
          </div>

          @if($event !== 'cancelled')
          <p style="font-size:13px;color:#9A8878;line-height:1.6;margin:0;">
            Si necesitas cancelar o reprogramar tu cita, contáctanos con anticipación.
          </p>
          @else
          <p style="font-size:13px;color:#9A8878;line-height:1.6;margin:0;">
            Puedes agendar una nueva cita en cualquier momento desde el portal.
          </p>
          @endif
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#F7F3ED;padding:20px 40px;text-align:center;">
          <p style="font-size:12px;color:#B0A090;margin:0;">© {{ date('Y') }} Consultorio Manzanilla · MID</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
