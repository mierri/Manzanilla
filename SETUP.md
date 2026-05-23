# Consultorio Manzanilla — Guía de instalación y arranque

Sistema de citas médicas distribuido: React + Laravel + MySQL + Redis.

---

## Requisitos previos

| Herramienta | Versión mínima | Notas |
|-------------|---------------|-------|
| PHP | 8.2+ | Con extensiones: `pdo_mysql`, `mbstring`, `openssl`, `redis` o `predis` |
| Composer | 2.x | |
| Node.js | 20+ | |
| MySQL | 8.0+ | Base de datos principal |
| Redis | 7.x | Requerido para exclusión mutua distribuida y caché |

---

## 1. Clonar / descomprimir el proyecto

```
CitasMedicas/
├── backend/    ← Laravel 11
└── frontend/   ← React + Vite
```

---

## 2. Backend (Laravel)

### 2.1 Instalar dependencias

```bash
cd backend
composer install
```

### 2.2 Crear el archivo de entorno

```bash
cp .env.example .env
php artisan key:generate
```

### 2.3 Configurar `.env`

Edita `backend/.env` con los valores reales:

```env
APP_NAME="Consultorio Manzanilla"
APP_ENV=production
APP_DEBUG=false
APP_URL=http://localhost:8000

# ── Base de datos ─────────────────────────────────────────────
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=manzanilla          # Crea la BD con este nombre en MySQL
DB_USERNAME=root
DB_PASSWORD=tu_password_mysql

# ── Redis (exclusión mutua + caché) ───────────────────────────
CACHE_STORE=redis
QUEUE_CONNECTION=database
REDIS_CLIENT=predis             # o phpredis si tienes la extensión PHP
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null             # o tu password si Redis tiene auth
REDIS_PORT=6379

# ── Correo electrónico ────────────────────────────────────────
# Opción A: Gmail con contraseña de aplicación (recomendado)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_ENCRYPTION=tls
MAIL_USERNAME=tu_correo@gmail.com
MAIL_PASSWORD=xxxx_xxxx_xxxx_xxxx   # Contraseña de aplicación de Google
MAIL_FROM_ADDRESS="noreply@consultoriomanzanilla.mx"
MAIL_FROM_NAME="Consultorio Manzanilla"

# Opción B: Mailtrap (para pruebas sin envío real)
# MAIL_MAILER=smtp
# MAIL_HOST=sandbox.smtp.mailtrap.io
# MAIL_PORT=2525
# MAIL_USERNAME=tu_usuario_mailtrap
# MAIL_PASSWORD=tu_password_mailtrap

# ── Push notifications (Web Push / VAPID) ─────────────────────
VAPID_PUBLIC_KEY=BCN3j3CLnoOVTqHsiW69y7V_lWo5MiwZ8aYjG6cEXMaOOO_xlt9Q91bu6BfDt6KzxQpr9TAQbDlPvzWnoq6MoFE
VAPID_PRIVATE_KEY=OXCkgcK1V_Q2_tkmASkKr9Va6NCae45VitddRnKGC0w
VAPID_CONTACT=admin@manzanilla.mx

# ── Frontend (CORS) ───────────────────────────────────────────
FRONTEND_URL=http://localhost:5173
```

> **Contraseña de aplicación de Gmail:** ve a tu cuenta Google → Seguridad → Verificación en dos pasos → Contraseñas de aplicación. Genera una para "Correo / Otro". Copia las 16 letras (sin espacios) como `MAIL_PASSWORD`.

### 2.4 Crear la base de datos y ejecutar migraciones

```bash
php artisan db:create
php artisan migrate
```

`db:create` crea la base de datos automáticamente si no existe — no necesitas abrir MySQL manualmente.

Esto crea todas las tablas **y** el usuario administrador automáticamente:

| Campo | Valor |
|-------|-------|
| Usuario | `admin` |
| Contraseña | `admin1234` |
| Correo | `admin@manzanilla.mx` |
| Rol | Administrador |

> Cambia la contraseña del admin desde el panel o directamente en la BD después del primer acceso.

### 2.6 Iniciar el servidor

```bash
php artisan serve
# Escucha en http://localhost:8000
```

---

## 3. Frontend (React + Vite)

### 3.1 Instalar dependencias

```bash
cd frontend
npm install
```

### 3.2 Archivo de entorno

El archivo `frontend/.env` ya contiene la clave VAPID pública:

```env
VITE_VAPID_PUBLIC_KEY=BCN3j3CLnoOVTqHsiW69y7V_lWo5MiwZ8aYjG6cEXMaOOO_xlt9Q91bu6BfDt6KzxQpr9TAQbDlPvzWnoq6MoFE
```

Si cambias las claves VAPID en el backend, actualiza esta variable con la nueva clave pública.

### 3.3 Iniciar el servidor de desarrollo

```bash
npm run dev
# Escucha en http://localhost:5173
```

---

## 4. Redis — exclusión mutua distribuida

Redis es **obligatorio** para que el sistema rechace reservas simultáneas en el mismo horario (condición de carrera).

### Instalar Redis

**Windows:**
1. Descarga el instalador desde https://github.com/tporadowski/redis/releases
2. Instala y ejecuta el servicio (se registra automáticamente en Windows Services)
3. Verifica con `redis-cli ping` → debe responder `PONG`

**macOS:**
```bash
brew install redis
brew services start redis
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt install redis-server
sudo systemctl enable --now redis-server
```

### Instalar el cliente PHP (elige uno)

**Opción A — predis** (sin extensión PHP, recomendado para facilidad):
```bash
cd backend
composer require predis/predis
```
Y en `.env`: `REDIS_CLIENT=predis`

**Opción B — phpredis** (extensión C, más rápido):
```bash
# En Linux:
sudo apt install php-redis
# En Windows: activa la DLL php_redis.dll en php.ini
```
Y en `.env`: `REDIS_CLIENT=phpredis`

---

## 5. Notificaciones Push (Web Push / VAPID)

Las push notifications funcionan con el service worker en `frontend/public/sw.js`.

- Las claves VAPID ya están generadas y configuradas en `.env` (backend y frontend).
- **Si necesitas regenerar las claves** (opcional):

```bash
cd backend
php artisan webpush:vapid
```

Copia la clave pública al `frontend/.env` (`VITE_VAPID_PUBLIC_KEY`) y la privada al `backend/.env` (`VAPID_PRIVATE_KEY`).

> Las push notifications solo funcionan en **HTTPS** en producción. En desarrollo local (localhost) funcionan sin HTTPS.

---

## 6. Correo electrónico — verificación rápida

Desde el backend, puedes probar el envío sin abrir el frontend:

```bash
php artisan tinker
>>> \Illuminate\Support\Facades\Mail::raw('Prueba OK', fn($m) => $m->to('tu@correo.com')->subject('Test'));
```

Si no hay excepción, el correo funciona.

---

## 7. Resumen de arranque

Una vez configurado todo, en cada sesión de trabajo abre **tres terminales**:

```bash
# Terminal 1 — Redis
redis-server                    # (si no corre como servicio)

# Terminal 2 — Backend Laravel
cd backend
php artisan serve

# Terminal 3 — Frontend React
cd frontend
npm run dev
```

Abre el navegador en **http://localhost:5173**.

---

## 8. Credenciales iniciales

| Rol | Usuario | Contraseña |
|-----|---------|------------|
| Administrador | `admin` | `admin1234` |

El admin puede crear médicos y pacientes desde el panel. Los médicos y pacientes reciben un correo de verificación al registrarse (si el correo está configurado).

---

## 9. Notas de seguridad para producción

- Cambia `APP_DEBUG=false` y `APP_ENV=production`.
- Cambia la contraseña del administrador inmediatamente.
- Usa HTTPS (nginx/Apache con Let's Encrypt).
- Restringe `FRONTEND_URL` al dominio real.
- Configura Redis con autenticación (`requirepass` en `redis.conf`).
