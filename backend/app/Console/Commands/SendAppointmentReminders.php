<?php

namespace App\Console\Commands;

use App\Mail\AppointmentMail;
use App\Models\Appointment;
use App\Models\PushSubscription;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendAppointmentReminders extends Command
{
    protected $signature   = 'appointments:remind {--scope=tomorrow : today or tomorrow}';
    protected $description = 'Send email reminders for appointments (today or tomorrow)';

    public function handle(): void
    {
        $scope    = $this->option('scope');
        $date     = $scope === 'today' ? Carbon::today('America/Mexico_City') : Carbon::tomorrow('America/Mexico_City');
        $dateStr  = $date->toDateString();
        $label    = $scope === 'today' ? 'hoy' : 'mañana';

        $appointments = Appointment::with(['patient'])
            ->whereDate('appointment_date', $dateStr)
            ->whereIn('status', ['confirmed', 'pending'])
            ->whereNotNull('patient_id')
            ->get();

        $this->info("Scope: {$scope} | Date: {$dateStr} | Appointments: {$appointments->count()}");

        foreach ($appointments as $appt) {
            $patient = $appt->patient;
            if (!$patient) continue;

            // Email
            if ($patient->notif_email !== false) {
                try {
                    Mail::to($patient->email)->send(
                        new AppointmentMail($appt, 'reminder', $patient->name)
                    );
                    $this->line("  ✉  Email → {$patient->email}");
                } catch (\Throwable $e) {
                    Log::error("Reminder email failed for appt #{$appt->id}: " . $e->getMessage());
                    $this->error("  ✗  Email failed: " . $e->getMessage());
                }
            }
        }

        $this->info('Done.');
    }
}
