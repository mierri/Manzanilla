# Consultorio Manzanilla — Sistema Distribuido de Citas Médicas

Sistema web distribuido para la gestión de citas médicas, historiales clínicos y notificaciones. Desarrollado con React + Laravel + MySQL + Redis.

## Estructura

```
CitasMedicas/
├── frontend/   React 18 + Vite + TypeScript + Tailwind
├── backend/    Laravel 11 + Sanctum + MySQL + Redis
└── SETUP.md    Guía de instalación detallada
```

---

## Instalación rápida

Consulta **[SETUP.md](./SETUP.md)** para la guía completa con todas las opciones de configuración (correo, push notifications, Redis, etc.).

### Pasos básicos

```bash
# 1. Backend
cd backend
composer install
cp .env.example .env
php artisan key:generate
# Edita .env con tus credenciales de MySQL, Redis y correo
php artisan db:create        # Crea la BD automáticamente
php artisan migrate          # Tablas + usuario admin
php artisan serve            # http://localhost:8000

# 2. Frontend
cd frontend
npm install
npm run dev                  # http://localhost:5173
```

### Credenciales iniciales

| Rol | Usuario | Contraseña |
|-----|---------|------------|
| Administrador | `admin` | `admin1234` |

El admin crea médicos y pacientes desde el panel. No hay datos de prueba precargados.

---

## Arquitectura

### Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS |
| Backend | Laravel 12, PHP 8.2+ |
| Autenticación | Laravel Sanctum (tokens Bearer) |
| Base de datos | MySQL 8.0+ |
| Caché / Mutex | Redis 7+ |
| Correo | SMTP (Gmail / Mailtrap) |
| Push | Web Push API + VAPID + Service Worker |

### Roles

- **Admin** — gestiona médicos y pacientes, ve agenda global
- **Médico** — agenda citas, lleva historiales clínicos, ve su calendario
- **Paciente** — reserva citas, consulta su historial, recibe notificaciones

---

## Diagramas

> Los bloques `plantuml` se renderizan con el plugin de PlantUML para VS Code,  
> IntelliJ, o en [plantuml.com/plantuml](https://www.plantuml.com/plantuml).

### Diagrama de Componentes (Arquitectura)

```plantuml
@startuml Arquitectura del Sistema
skinparam componentStyle rectangle
skinparam linetype ortho
skinparam defaultFontName Helvetica

package "Cliente (Browser)" {
  [React 19 + Vite\nTypeScript · Tailwind] as frontend
  [Service Worker\n(Web Push)] as sw
}

package "Servidor" {
  [Laravel 12\n(PHP 8.2+)] as backend
  database "MySQL 8.0" as db
  storage "Redis 7\n(Cache · Mutex · Queue)" as redis
}

cloud "Servicios externos" {
  [SMTP\n(Gmail / Mailtrap)] as smtp
  [Web Push VAPID] as push
}

frontend --> backend  : HTTPS · REST API\nBearer token
backend  --> db       : Eloquent ORM
backend  --> redis    : Cache · Mutex\ndistribuido
backend  --> smtp     : Notificaciones\npor correo
backend  --> push     : Eventos push\n(VAPID)
push     --> sw       : Notificaciones\nen tiempo real

@enduml
```

---

### Diagrama Entidad-Relación

```plantuml
@startuml Modelo Entidad-Relación
hide circle
skinparam linetype ortho
skinparam defaultFontName Helvetica

entity "users" as u {
  *id : bigint <<PK>>
  --
  *name : varchar
  *username : varchar <<unique>>
  *email : varchar <<unique>>
  *password : varchar
  *role : enum(admin,medico,paciente)
  phone : varchar
  sex : enum(M,F,X)
  notif_email : boolean
  notif_push : boolean
  email_verified_at : timestamp
}

entity "doctor_profiles" as dp {
  *id : bigint <<PK>>
  --
  *user_id : bigint <<FK>>
  speciality : varchar
  license_number : varchar
  bio : text
}

entity "patient_profiles" as pp {
  *id : bigint <<PK>>
  --
  *user_id : bigint <<FK>>
  age : tinyint
  address : varchar
  blood_type : enum(A+,A-,B+,...)
  allergies : text
  emergency_contact_name : varchar
  emergency_contact_phone : varchar
}

entity "doctor_patient" as dpt {
  *doctor_id : bigint <<FK>>
  *patient_id : bigint <<FK>>
  --
  created_at : timestamp
}

entity "appointments" as ap {
  *id : bigint <<PK>>
  --
  *doctor_id : bigint <<FK>>
  patient_id : bigint <<FK>>
  created_by : bigint <<FK>>
  *appointment_date : datetime
  duration : smallint(30)
  *status : enum(pending,confirmed,\ncancelled,completed,locked)
  reason : varchar
}

entity "clinical_records" as cr {
  *id : bigint <<PK>>
  --
  *patient_id : bigint <<FK>>
  appointment_id : bigint <<FK>>
  *vitals_encrypted : text
  diagnosis_encrypted : text
  prescriptions_encrypted : text
  analysis_results_encrypted : text
}

entity "manzanilla_notifications" as mn {
  *id : bigint <<PK>>
  --
  *user_id : bigint <<FK>>
  *type : varchar
  *title : varchar
  body : varchar
  read_at : timestamp
}

u  ||..||  dp  : "1:1 (médico)"
u  ||..||  pp  : "1:1 (paciente)"
u  ||..o{  dpt : "es doctor de →"
u  ||..o{  dpt : "← es paciente de"
u  ||..o{  ap  : "doctor_id"
u  |o..o{  ap  : "patient_id"
u  ||..o{  cr  : "patient_id"
ap |o..o{  cr  : "appointment_id"
u  ||..o{  mn  : "user_id"

@enduml
```

---

### Diagrama de Secuencia — Autenticación con OTP

```plantuml
@startuml Flujo de Autenticación (2FA OTP)
skinparam defaultFontName Helvetica

actor       "Usuario"      as U
participant "React App"    as F
participant "Laravel API"  as B
participant "Redis"        as R
participant "SMTP"         as M

U  -> F : Ingresa usuario + contraseña
F  -> B : POST /api/auth/login
B  -> B : bcrypt::check(password)
alt Admin
  B --> F : {user, token}
else Médico / Paciente
  B -> R : Cache::put("otp:login:{id}", hash, 300s)
  B -> M : Envía código OTP de 6 dígitos
  B --> F : {needs_otp: true, user_id, masked_email}
  F --> U : Pantalla "Ingresa tu código"
  U  -> F : Ingresa código OTP
  F  -> B : POST /api/auth/verify-otp
  B  -> R : Hash::check(otp, cached_hash)
  B  -> R : Cache::forget("otp:login:{id}")
  B  -> B : createToken('api-token')
  B --> F : {user, token}
end
F  -> F : localStorage.setItem('token', ...)
F --> U : Redirige al dashboard

@enduml
```

---

### Diagrama de Secuencia — Reserva de Cita (Mutex Redis)

```plantuml
@startuml Reserva de Cita con Mutex Distribuido
skinparam defaultFontName Helvetica

actor "Usuario A" as A
actor "Usuario B" as B
participant "Laravel API" as API
participant "Redis\n(Mutex)" as R
database "MySQL" as DB

A -> API : POST /api/appointments\n{doctor_id, slot: "2026-05-23 10:00"}
B -> API : POST /api/appointments\n{doctor_id, slot: "2026-05-23 10:00"}

group Usuario A — adquiere lock
  API -> R : Cache::lock("appointment_slot:5:2026-05-23T10:00", 10s)
  R --> API : lock adquirido ✓
  API -> DB : SELECT overlapping appointments
  DB --> API : sin conflictos
  API -> DB : INSERT appointment
  DB --> API : OK
  API -> R : lock->release()
  API --> A : 201 Created
end

group Usuario B — lock denegado
  API -> R : Cache::lock(...) → false
  R --> API : lock en uso ✗
  API --> B : 409 Conflict\n"Horario siendo reservado.\nIntenta de nuevo."
end

@enduml
```

---

## Características principales

### Seguridad y autenticación
- Login con Sanctum Bearer tokens
- Contraseñas hasheadas con bcrypt
- Verificación de correo al registrarse (código de 6 dígitos, 24 h)
- Recuperación de contraseña por código OTP (15 min)
- Rutas protegidas por rol (`isAdmin`, `isDoctor`, `isPatient`)

### Historial clínico cifrado (AES-256)
Los campos sensibles (`vitals`, `diagnosis`, `prescriptions`, `analysis_results`) se almacenan cifrados en la BD usando `Crypt::encryptString` de Laravel (AES-256-CBC). Los accessors/mutators del modelo `ClinicalRecord` cifran al escribir y descifran al leer — los datos en texto plano nunca tocan la BD.

### Exclusión mutua distribuida (Redis)
El endpoint `POST /api/appointments` adquiere un **Redis lock** por slot de médico antes de verificar conflictos:

```php
$lock = Cache::lock("appointment_slot:{$doctorId}:{$slotKey}", 10);
if (!$lock->get()) abort(409, 'Horario siendo reservado. Intenta de nuevo.');

try {
    // Verifica solapamiento y crea la cita dentro del lock
} finally {
    $lock->release();
}
```

Si dos usuarios reservan el mismo horario al mismo tiempo, el segundo recibe HTTP 409 en lugar de crear una cita duplicada.

### Notificaciones
- **Correo** (SMTP): alta de cita, confirmación, reprogramación, cancelación, recordatorio
- **Web Push** (VAPID): mismos eventos en tiempo real vía Service Worker
- **Recordatorio automático**: push al iniciar sesión si hay cita hoy o mañana

### Calendario con duración de 30 min
Cada cita ocupa exactamente 30 minutos. El calendario del médico muestra slots de 30 min (8:00–18:30). Las citas completadas liberan su slot para futuros registros; los horarios pasados no se pueden reservar.

---

## API REST

Todas las rutas bajo `/api/` requieren `Authorization: Bearer {token}` (excepto auth).

| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/auth/login` | POST | Iniciar sesión |
| `/api/auth/register` | POST | Registro de paciente |
| `/api/auth/logout` | POST | Cerrar sesión |
| `/api/auth/me` | GET | Usuario autenticado |
| `/api/auth/forgot-password` | POST | Solicitar código OTP |
| `/api/auth/reset-password` | POST | Restablecer contraseña |
| `/api/patients` | GET / POST | Listar / crear pacientes |
| `/api/patients/{id}` | GET / PUT / DELETE | Gestión de paciente |
| `/api/appointments` | GET / POST | Listar / crear citas |
| `/api/appointments/{id}` | PUT / DELETE | Modificar / cancelar cita |
| `/api/appointments/{id}/remind` | POST | Enviar recordatorio manual |
| `/api/clinical-records` | GET / POST | Historial clínico |
| `/api/notifications` | GET | Notificaciones del usuario |
| `/api/push/subscribe` | POST | Suscribir a Web Push |
| `/api/reports/patients` | GET | Reporte lista de pacientes |
| `/api/reports/calendar` | GET | Reporte calendario de citas |
| `/api/reports/history/{id}` | GET | Reporte historial clínico |
| `/api/admin/doctors` | GET / POST | Gestión de médicos (admin) |
| `/api/admin/patients` | GET | Lista de pacientes (admin) |
