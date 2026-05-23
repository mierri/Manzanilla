<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('users')->insert([
            'name'              => 'Administrador',
            'username'          => 'admin',
            'email'             => 'admin@manzanilla.mx',
            'email_verified_at' => now(),
            'password'          => Hash::make('admin1234'),
            'role'              => 'admin',
            'created_at'        => now(),
            'updated_at'        => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('users')->where('username', 'admin')->delete();
    }
};
