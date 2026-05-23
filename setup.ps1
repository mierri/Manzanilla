# ================================================================
# Setup completo de Consultorio Manzanilla
# Ejecutar desde d:\CitasMedicas con: .\setup.ps1
# ================================================================

Write-Host "`n🌼 Consultorio Manzanilla — Setup`n" -ForegroundColor Cyan

# ---- BACKEND ----
Write-Host "▶ Backend (Laravel)..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\backend"

# Instalar dependencias PHP si faltan
if (-not (Test-Path "vendor")) {
    Write-Host "  Instalando dependencias PHP..." -ForegroundColor Gray
    composer install --quiet
}

# Generar APP_KEY si es necesario
$env_content = Get-Content ".env" -Raw
if ($env_content -notmatch "APP_KEY=base64:") {
    Write-Host "  Generando APP_KEY..." -ForegroundColor Gray
    php artisan key:generate
}

# Crear base de datos
Write-Host "  Creando base de datos MySQL..." -ForegroundColor Gray
$dbResult = php artisan db:create 2>&1
Write-Host "  $dbResult" -ForegroundColor Gray

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n  ERROR: Verifica que MySQL esté corriendo y que DB_PASSWORD sea correcto en backend\.env" -ForegroundColor Red
    Write-Host "  Presiona Enter para continuar de todos modos o Ctrl+C para cancelar..."
    Read-Host | Out-Null
}

# Migraciones
Write-Host "  Ejecutando migraciones..." -ForegroundColor Gray
php artisan migrate --force 2>&1 | Out-Null

# Seeder
Write-Host "  Cargando datos de prueba..." -ForegroundColor Gray
php artisan db:seed --force 2>&1 | Out-Null

Write-Host "  Backend listo." -ForegroundColor Green

# ---- FRONTEND ----
Write-Host "`n▶ Frontend (React)..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\frontend"

if (-not (Test-Path "node_modules")) {
    Write-Host "  Instalando dependencias Node..." -ForegroundColor Gray
    npm install --silent 2>&1 | Out-Null
}

Write-Host "  Frontend listo." -ForegroundColor Green

# ---- INSTRUCCIONES ----
Write-Host "`n✅ Setup completado!" -ForegroundColor Green
Write-Host "`nPara iniciar la app, abre DOS terminales:`n"
Write-Host "  Terminal 1 (backend):" -ForegroundColor Cyan
Write-Host "    cd d:\CitasMedicas\backend"
Write-Host "    php artisan serve`n"
Write-Host "  Terminal 2 (frontend):" -ForegroundColor Cyan
Write-Host "    cd d:\CitasMedicas\frontend"
Write-Host "    npm run dev`n"
Write-Host "  Luego abre: http://localhost:5173" -ForegroundColor Cyan
Write-Host "`n  Médico:   doctora   / manzanilla"
Write-Host "  Paciente: marianao  / paciente123`n"
