<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Day-before reminder at 12:00 PM Mexico City time
Schedule::command('appointments:remind --scope=tomorrow')
    ->dailyAt('12:00')
    ->timezone('America/Mexico_City');

// Same-day reminder at 8:00 AM Mexico City time
Schedule::command('appointments:remind --scope=today')
    ->dailyAt('08:00')
    ->timezone('America/Mexico_City');
