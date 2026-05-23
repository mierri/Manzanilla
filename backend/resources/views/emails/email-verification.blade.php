<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F7F3ED;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F3ED;padding:40px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#FFFCF6;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(43,37,32,.10);">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#E8F5E9,#C8E6C9);padding:32px 40px;text-align:center;">
          <div style="margin-bottom:12px;line-height:0;"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7" stroke="#2E7D32" stroke-width="2" stroke-linecap="round"/><path d="M4 13l8 6 8-6" stroke="#2E7D32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
          <div style="font-family:Georgia,serif;font-size:22px;font-weight:500;color:#2B2520;">🌼 ¡Bienvenido/a, {{ $userName }}!</div>
          <div style="font-size:11px;color:#4A7A4E;letter-spacing:.15em;text-transform:uppercase;margin-top:4px;">consultorio manzanilla</div>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:36px 40px;">
          <p style="font-size:15px;color:#5A4A3C;margin:0 0 8px;">¡Ya casi estás dentro! 🎉</p>
          <p style="font-size:14px;color:#7C6A5B;line-height:1.6;margin:0 0 28px;">Ingresa el siguiente código en la aplicación para confirmar tu dirección de correo y activar tu cuenta. <strong>Expira en 24 horas.</strong></p>

          <!-- Code box -->
          <div style="background:#E8F5E9;border:2px solid #A5D6A7;border-radius:16px;padding:24px;text-align:center;margin-bottom:28px;">
            <div style="font-size:11px;color:#4A7A4E;letter-spacing:.12em;text-transform:uppercase;margin-bottom:10px;">Código de verificación</div>
            <div style="font-family:'Courier New',monospace;font-size:40px;font-weight:700;color:#2B2520;letter-spacing:10px;">{{ $code }}</div>
          </div>

          <p style="font-size:13px;color:#9A8878;line-height:1.6;margin:0;">Si no creaste una cuenta en Consultorio Manzanilla, puedes ignorar este mensaje.</p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#F7F3ED;padding:20px 40px;text-align:center;">
          <p style="font-size:12px;color:#B0A090;margin:0;">© {{ date('Y') }} Consultorio Manzanilla · GDL</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
