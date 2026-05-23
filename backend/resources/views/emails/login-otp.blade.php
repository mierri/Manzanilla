<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F7F3ED;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F3ED;padding:40px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#FFFCF6;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(43,37,32,.10);">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#EDE7F6,#D1C4E9);padding:32px 40px;text-align:center;">
          <div style="font-size:32px;margin-bottom:8px;">🔐</div>
          <div style="font-family:Georgia,serif;font-size:22px;font-weight:500;color:#2B2520;">Código de acceso</div>
          <div style="font-size:11px;color:#5E35B1;letter-spacing:.15em;text-transform:uppercase;margin-top:4px;">consultorio manzanilla</div>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:36px 40px;">
          <p style="font-size:15px;color:#5A4A3C;margin:0 0 8px;">Hola, <strong>{{ $userName }}</strong></p>
          <p style="font-size:14px;color:#7C6A5B;line-height:1.6;margin:0 0 28px;">Alguien está intentando iniciar sesión en tu cuenta. Usa este código de verificación de un solo uso. <strong>Expira en 5 minutos.</strong></p>

          <!-- Code box -->
          <div style="background:#EDE7F6;border:2px solid #CE93D8;border-radius:16px;padding:24px;text-align:center;margin-bottom:28px;">
            <div style="font-size:11px;color:#5E35B1;letter-spacing:.12em;text-transform:uppercase;margin-bottom:10px;">Tu código de verificación</div>
            <div style="font-family:'Courier New',monospace;font-size:40px;font-weight:700;color:#2B2520;letter-spacing:10px;">{{ $code }}</div>
          </div>

          <p style="font-size:13px;color:#9A8878;line-height:1.6;margin:0;">Si no fuiste tú, alguien más tiene tu contraseña. Cambia tu contraseña inmediatamente.</p>
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
