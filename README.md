# Consultorio Manzanilla — Sistema Distribuido de Citas Médicas

## Estructura
```
CitasMedicas/
├── frontend/   React + Vite + Tailwind + shadcn design system
├── backend/    Laravel 11 + Sanctum + MySQL
└── ui/         Prototipo HTML original (referencia)
```

## Requisitos
- Node.js 18+
- PHP 8.2+, Composer 2+
- MySQL 8.0+ (corriendo en localhost:3306)

---

## Instalación rápida

### 1. Configurar contraseña de MySQL (si la tienes)
Edita `backend/.env` y pon tu contraseña:
```
DB_PASSWORD=tu_contraseña
```
Si tu MySQL no tiene contraseña, déjalo vacío (ya está así por defecto).

### 2. Ejecutar el script de setup (crea la DB, migra y siembra datos)
```powershell
# Desde d:\CitasMedicas
.\setup.ps1
```

El script:
- Crea la base de datos `manzanilla` automáticamente
- Ejecuta todas las migraciones
- Carga los datos de prueba (médico + 8 pacientes + citas + historia clínica)

### 3. Iniciar los servidores

**Terminal 1 — Backend:**
```bash
cd backend
php artisan serve
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Abre **http://localhost:5173**

**Credenciales de prueba:**
| Rol | Usuario | Contraseña |
|-----|---------|-----------|
| Médico | `doctora` | `manzanilla` |
| Paciente | `marianao` | `paciente123` |
| Paciente | `apacheco` | `paciente123` |

---

## Setup manual (alternativo)

Si prefieres hacer cada paso a mano:
```bash
# Backend
cd backend
composer install
php artisan db:create          # ← crea la DB automáticamente
php artisan migrate --seed
php artisan serve
```

---

## Arquitectura y Características

### Seguridad
- **Autenticación**: Laravel Sanctum (tokens Bearer)
- **Datos clínicos cifrados**: Los campos `vitals`, `diagnosis`, `prescriptions` y `notes` se almacenan cifrados con AES-256 (Laravel `Crypt`) y se descifran solo en tiempo de lectura mediante accessors/mutators en el modelo `ClinicalRecord`

### Concurrencia — Exclusión Mutua Distribuida
El endpoint `POST /api/appointments` usa **bloqueo pesimista a nivel de base de datos** (SELECT FOR UPDATE dentro de una transacción) para prevenir la condición de carrera cuando dos usuarios intentan reservar el mismo horario simultáneamente:

```php
DB::transaction(function () {
    $conflict = Appointment::where(...)
        ->lockForUpdate()   // Bloquea las filas hasta que termine la transacción
        ->first();
    if ($conflict) abort(409, 'Time slot occupied');
    return Appointment::create(...);
});
```

Si dos peticiones concurrentes llegan al mismo slot, la segunda espera que la primera termine, y si ya está ocupado devuelve HTTP 409.

### API REST
Todas las rutas bajo `/api/` con autenticación Sanctum Bearer token.

| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/auth/login` | POST | Iniciar sesión |
| `/api/auth/register` | POST | Registro de paciente |
| `/api/auth/logout` | POST | Cerrar sesión |
| `/api/auth/me` | GET | Usuario actual |
| `/api/patients` | GET/POST | Listar/crear pacientes |
| `/api/patients/{id}` | GET/PUT/DELETE | Gestión de paciente |
| `/api/appointments` | GET/POST | Listar/crear citas |
| `/api/appointments/{id}` | GET/PUT/DELETE | Gestión de cita |
| `/api/patients/{id}/records` | GET/POST | Historia clínica |
| `/api/notifications` | GET | Notificaciones |
| `/api/reports/patients` | GET | Reporte lista pacientes |
| `/api/reports/calendar` | GET | Reporte calendario |
| `/api/reports/history/{id}` | GET | Reporte historia clínica |
