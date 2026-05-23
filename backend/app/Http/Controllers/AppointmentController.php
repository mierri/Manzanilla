<?php

namespace App\Http\Controllers;

use App\Mail\AppointmentMail;
use App\Models\Appointment;
use App\Models\ManzanillaNotification;
use App\Models\PushSubscription;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class AppointmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Appointment::with('patient:id,name,email,username');

        if ($user->isDoctor()) {
            $query->where('doctor_id', $user->id);
        } else {
            $query->where('patient_id', $user->id);
        }

        if ($request->filled('date')) {
            $query->whereDate('appointment_date', $request->date);
        }

        if ($request->filled('patient_id') && $user->isDoctor()) {
            $query->where('patient_id', $request->patient_id);
        }

        $appointments = $query->orderBy('appointment_date')->get();
        return response()->json($appointments);
    }

    public function show(int $id, Request $request): JsonResponse
    {
        $appt = Appointment::with('patient:id,name,email')->findOrFail($id);
        $this->authorize('view', $appt);
        return response()->json($appt);
    }

    /**
     * Create appointment with distributed mutex via Redis Cache::lock().
     * Prevents race conditions when two users try to book the same slot simultaneously.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'patient_id'       => 'nullable|exists:users,id',
            'doctor_id'        => 'nullable|exists:users,id',
            'appointment_date' => 'required|date|after_or_equal:today',
            'duration'         => 'nullable|integer|min:15|max:120',
            'reason'           => 'nullable|string|max:255',
            'status'           => 'nullable|in:pending,confirmed',
        ]);

        $doctorId = $user->isDoctor() ? $user->id : ($data['doctor_id'] ?? $this->getDoctorId());

        if (!$user->isDoctor()) {
            $data['patient_id'] = $user->id;
        }

        $duration          = $data['duration'] ?? 30;
        $appointmentCarbon = Carbon::parse($data['appointment_date']);
        $appointmentDate   = $appointmentCarbon->format('Y-m-d H:i:s');
        $endDate           = $appointmentCarbon->copy()->addMinutes($duration)->format('Y-m-d H:i:s');

        // DISTRIBUTED MUTEX: Redis lock per doctor slot (10s TTL protects against crashes)
        $lockKey = "appointment_slot:{$doctorId}:" . $appointmentCarbon->format('YmdHi');
        $lock    = Cache::lock($lockKey, 10);

        if (!$lock->get()) {
            abort(409, 'El horario está siendo reservado en este momento. Intenta de nuevo.');
        }

        try {
            $conflict = Appointment::where('doctor_id', $doctorId)
                ->whereIn('status', ['confirmed', 'pending', 'locked'])
                ->where(function ($q) use ($appointmentDate, $endDate) {
                    $q->where('appointment_date', '<', $endDate)
                      ->whereRaw('DATE_ADD(appointment_date, INTERVAL duration MINUTE) > ?', [$appointmentDate]);
                })
                ->first();

            if ($conflict) {
                abort(409, 'El horario seleccionado ya está ocupado.');
            }

            $appointment = Appointment::create([
                'patient_id'       => $data['patient_id'] ?? null,
                'doctor_id'        => $doctorId,
                'appointment_date' => $appointmentDate,
                'duration'         => $duration,
                'status'           => $data['status'] ?? ($user->isDoctor() ? 'confirmed' : 'pending'),
                'reason'           => $data['reason'] ?? null,
                'created_by'       => $user->id,
            ]);
        } finally {
            $lock->release();
        }

        if ($user->isDoctor() && $appointment->patient_id) {
            $patient = User::find($appointment->patient_id);
            ManzanillaNotification::create([
                'user_id' => $appointment->patient_id,
                'type'    => 'appointment_created',
                'title'   => 'Nueva cita agendada',
                'body'    => 'Tu médico agendó una cita para ti el ' . $appointment->appointment_date->format('d/m/Y \a \l\a\s H:i'),
            ]);
            if ($patient) {
                $this->notifyUser($patient, $appointment, 'created');
            }
        } elseif ($user->isPatient()) {
            $doctor = User::find($doctorId);
            ManzanillaNotification::create([
                'user_id' => $doctorId,
                'type'    => 'appointment_requested',
                'title'   => 'Nueva solicitud de cita',
                'body'    => $user->name . ' solicitó una cita para el ' . $appointment->appointment_date->format('d/m/Y \a \l\a\s H:i'),
            ]);
            if ($doctor) {
                $this->notifyUser($doctor, $appointment, 'created');
            }
        }

        return response()->json($appointment->load('patient:id,name,email'), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $appt           = Appointment::findOrFail($id);
        $previousStatus = $appt->status;

        $data = $request->validate([
            'appointment_date' => 'sometimes|date',
            'status'           => 'sometimes|in:pending,confirmed,cancelled,completed',
            'reason'           => 'nullable|string|max:255',
        ]);

        if (isset($data['appointment_date'])) {
            $newCarbon = Carbon::parse($data['appointment_date']);
            $newDate   = $newCarbon->format('Y-m-d H:i:s');
            $duration  = $appt->duration ?? 30;
            $endDate   = $newCarbon->copy()->addMinutes($duration)->format('Y-m-d H:i:s');

            $lockKey = "appointment_slot:{$appt->doctor_id}:" . $newCarbon->format('YmdHi');
            $lock    = Cache::lock($lockKey, 10);

            if (!$lock->get()) {
                abort(409, 'El horario está siendo reservado en este momento. Intenta de nuevo.');
            }

            try {
                $conflict = Appointment::where('doctor_id', $appt->doctor_id)
                    ->where('id', '!=', $appt->id)
                    ->whereIn('status', ['confirmed', 'pending', 'locked'])
                    ->where(function ($q) use ($newDate, $endDate) {
                        $q->where('appointment_date', '<', $endDate)
                          ->whereRaw('DATE_ADD(appointment_date, INTERVAL duration MINUTE) > ?', [$newDate]);
                    })
                    ->first();

                if ($conflict) {
                    abort(409, 'El horario seleccionado ya está ocupado.');
                }

                $appt->update($data);
            } finally {
                $lock->release();
            }
        } else {
            $appt->update($data);
        }

        if (isset($data['status']) && $data['status'] === 'confirmed' && $previousStatus !== 'confirmed' && $appt->patient_id) {
            $patient = User::find($appt->patient_id);
            ManzanillaNotification::create([
                'user_id' => $appt->patient_id,
                'type'    => 'appointment_confirmed',
                'title'   => 'Cita confirmada',
                'body'    => 'Tu médico confirmó tu cita para el ' . $appt->appointment_date->format('d/m/Y \a \l\a\s H:i'),
            ]);
            if ($patient) {
                $this->notifyUser($patient, $appt, 'confirmed');
            }
        }

        if (isset($data['appointment_date']) && $appt->patient_id) {
            $patient = User::find($appt->patient_id);
            ManzanillaNotification::create([
                'user_id' => $appt->patient_id,
                'type'    => 'appointment_rescheduled',
                'title'   => 'Cita reprogramada',
                'body'    => 'Tu cita fue reprogramada para el ' . $appt->fresh()->appointment_date->format('d/m/Y \a \l\a\s H:i'),
            ]);
            if ($patient) {
                $this->notifyUser($patient, $appt->fresh(), 'rescheduled');
            }
        }

        return response()->json($appt->load('patient:id,name,email'));
    }

    public function destroy(int $id, Request $request): JsonResponse
    {
        $appt = Appointment::findOrFail($id);
        $user = $request->user();

        if ($user->isDoctor() && $appt->patient_id) {
            $patient = User::find($appt->patient_id);
            ManzanillaNotification::create([
                'user_id' => $appt->patient_id,
                'type'    => 'appointment_cancelled',
                'title'   => 'Cita cancelada por tu médico',
                'body'    => 'Tu cita del ' . $appt->appointment_date->format('d/m/Y \a \l\a\s H:i') . ' fue cancelada.',
            ]);
            if ($patient) {
                $this->notifyUser($patient, $appt, 'cancelled');
            }
        } elseif ($user->isPatient() && $appt->doctor_id) {
            $doctor = User::find($appt->doctor_id);
            ManzanillaNotification::create([
                'user_id' => $appt->doctor_id,
                'type'    => 'appointment_cancelled',
                'title'   => 'Cita cancelada por el paciente',
                'body'    => $user->name . ' canceló su cita del ' . $appt->appointment_date->format('d/m/Y \a \l\a\s H:i'),
            ]);
            if ($doctor) {
                $this->notifyUser($doctor, $appt, 'cancelled');
            }
        }

        $appt->delete();
        return response()->json(['message' => 'Cita eliminada']);
    }

    public function sendReminder(int $id, Request $request): JsonResponse
    {
        $appt = Appointment::with('patient')->findOrFail($id);
        $user = $request->user();

        abort_unless($user->isDoctor() || $user->isAdmin(), 403, 'Solo médicos y administradores pueden enviar recordatorios.');
        abort_unless($appt->patient_id, 422, 'Esta cita no tiene paciente asignado.');

        $patient = $appt->patient;

        if ($patient->notif_email !== false) {
            try {
                Mail::to($patient->email)->send(
                    new AppointmentMail($appt, 'reminder', $patient->name)
                );
            } catch (\Throwable $e) {
                Log::error("Manual reminder email failed for appt #{$appt->id}: " . $e->getMessage());
            }
        }

        if ($patient->notif_push) {
            PushSubscription::sendToUser($patient->id, $this->pushPayload($appt, 'reminder'));
        }

        return response()->json(['message' => 'Recordatorio enviado']);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private function notifyUser(User $recipient, Appointment $appt, string $event): void
    {
        // Email
        if ($recipient->notif_email !== false) {
            try {
                Mail::to($recipient->email)->send(
                    new AppointmentMail($appt, $event, $recipient->name)
                );
            } catch (\Throwable $e) {
                Log::error("AppointmentMail failed [{$event}] to {$recipient->email}: " . $e->getMessage());
            }
        }

        // Web Push
        if ($recipient->notif_push) {
            PushSubscription::sendToUser($recipient->id, $this->pushPayload($appt, $event));
        }
    }

    private function pushPayload(Appointment $appt, string $event): array
    {
        $titles = [
            'created'     => '🗓️ Nueva cita agendada',
            'confirmed'   => '✅ Cita confirmada',
            'rescheduled' => '📅 Cita reprogramada',
            'cancelled'   => '❌ Cita cancelada',
            'reminder'    => '⏰ Recordatorio de cita',
        ];

        return [
            'title' => $titles[$event] ?? 'Actualización de cita',
            'body'  => $appt->appointment_date->format('d/m/Y \a \l\a\s H:i'),
            'icon'  => '/icon-192.png',
            'data'  => ['url' => '/'],
        ];
    }

    private function getDoctorId(): int
    {
        $doctor = User::where('role', 'medico')->first();
        abort_if(!$doctor, 404, 'No doctor found');
        return $doctor->id;
    }
}
