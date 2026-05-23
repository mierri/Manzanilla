<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // El usuario administrador se crea automáticamente mediante la migración
        // 2026_05_22_200060_seed_admin_user.php (php artisan migrate).
        // No se requieren datos semilla adicionales para producción.
    }
}
