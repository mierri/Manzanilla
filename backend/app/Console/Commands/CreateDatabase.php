<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use PDO;
use PDOException;

class CreateDatabase extends Command
{
    protected $signature = 'db:create';
    protected $description = 'Crea la base de datos si no existe';

    public function handle(): int
    {
        $database = config('database.connections.mysql.database');
        $host     = config('database.connections.mysql.host');
        $port     = config('database.connections.mysql.port');
        $username = config('database.connections.mysql.username');
        $password = config('database.connections.mysql.password');

        try {
            $pdo = new PDO(
                "mysql:host={$host};port={$port}",
                $username,
                $password,
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
            );

            $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$database}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

            $this->info("Base de datos '{$database}' lista.");
            return self::SUCCESS;
        } catch (PDOException $e) {
            $this->error('No se pudo conectar a MySQL: ' . $e->getMessage());
            $this->line('Verifica que MySQL esté corriendo y que DB_USERNAME / DB_PASSWORD sean correctos en .env');
            return self::FAILURE;
        }
    }
}
