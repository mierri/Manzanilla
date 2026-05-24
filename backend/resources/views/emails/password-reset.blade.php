<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F7F3ED;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F3ED;padding:40px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#FFFCF6;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(43,37,32,.10);">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#FBF0DD,#F5DCBC);padding:32px 40px;text-align:center;">
          <div style="margin-bottom:12px;line-height:0;"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="11" width="14" height="10" rx="2" stroke="#7C6A5B" stroke-width="2"/><path d="M8 11V7a4 4 0 018 0v4" stroke="#7C6A5B" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="16" r="1.5" fill="#7C6A5B"/></svg></div>
          <div style="font-family:Georgia,serif;font-size:22px;font-weight:500;color:#2B2520;">🌼 Consultorio Manzanilla</div>
          <div style="font-size:11px;color:#7C6A5B;letter-spacing:.15em;text-transform:uppercase;margin-top:4px;">sistema de citas médicas</div>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:36px 40px;">
          <p style="font-size:15px;color:#5A4A3C;margin:0 0 8px;">Hola, <strong>{{ $userName }}</strong></p>
          <p style="font-size:14px;color:#7C6A5B;line-height:1.6;margin:0 0 28px;">Recibimos una solicitud para restablecer la contraseña de tu cuenta. Usa el siguiente código de 6 dígitos. <strong>Expira en 15 minutos.</strong></p>

          <!-- Code box -->
          <div style="background:#FBF0DD;border:2px solid #EFD68E;border-radius:16px;padding:24px;text-align:center;margin-bottom:28px;">
            <div style="font-size:11px;color:#7C6A5B;letter-spacing:.12em;text-transform:uppercase;margin-bottom:10px;">Tu código de recuperación</div>
            <div style="font-family:'Courier New',monospace;font-size:40px;font-weight:700;color:#2B2520;letter-spacing:10px;">{{ $code }}</div>
          </div>

          <p style="font-size:13px;color:#9A8878;line-height:1.6;margin:0;">Si no solicitaste restablecer tu contraseña, puedes ignorar este mensaje. Tu contraseña no cambiará.</p>
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
