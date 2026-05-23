<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\DoctorProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    // ── Auth guard ────────────────────────────────────────────

    private function guard(Request $request): ?JsonResponse
    {
        if (! $request->user()?->isAdmin()) {
            return response()->json(['error' => 'Acceso restringido al administrador'], 403);
        }
        return null;
    }

    // ── Dashboard stats ───────────────────────────────────────

    public function stats(Request $request): JsonResponse
    {
        if ($err = $this->guard($request)) return $err;

        $today = now()->toDateString();

        $doctorCount  = User::where('role', 'medico')->count();
        $patientCount = User::where('role', 'paciente')->count();
        $todayAppts   = Appointment::whereDate('appointment_date', $today)
                            ->where('status', '!=', 'cancelled')
                            ->count();
        $monthAppts   = Appointment::whereYear('appointment_date', now()->year)
                            ->whereMonth('appointment_date', now()->month)
                            ->where('status', '!=', 'cancelled')
                            ->count();

        $todayList = Appointment::with([
                        'patient:id,name,username',
                        'doctor:id,name',
                     ])
                     ->whereDate('appointment_date', $today)
                     ->where('status', '!=', 'cancelled')
                     ->orderBy('appointment_date')
                     ->get();

        return response()->json([
            'doctor_count'  => $doctorCount,
            'patient_count' => $patientCount,
            'today_count'   => $todayAppts,
            'month_count'   => $monthAppts,
            'today_list'    => $todayList,
        ]);
    }

    // ── Doctors ───────────────────────────────────────────────

    public function listDoctors(Request $request): JsonResponse
    {
        if ($err = $this->guard($request)) return $err;

        $doctors = User::where('role', 'medico')
            ->withCount(['doctorAppointments as appointment_count'])
            ->orderBy('name')
            ->get();

        return response()->json($doctors);
    }

    public function createDoctor(Request $request): JsonResponse
    {
        if ($err = $this->guard($request)) return $err;

        $data = $request->validate([
            'name'           => 'required|string|max:255',
            'username'       => 'required|string|unique:users|max:50',
            'email'          => 'required|email|unique:users',
            'password'       => 'required|string|min:6',
            'phone'          => 'nullable|string|max:30',
            'sex'            => 'nullable|in:M,F,X',
            'speciality'     => 'nullable|string|max:100',
            'license_number' => 'nullable|string|max:50',
            'bio'            => 'nullable|string',
        ]);

        $doctor = User::create([
            'name'     => $data['name'],
            'username' => $data['username'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
            'role'     => 'medico',
            'phone'    => $data['phone'] ?? null,
            'sex'      => $data['sex'] ?? null,
            'email_verified_at' => now(),
        ]);

        DoctorProfile::create([
            'user_id'        => $doctor->id,
            'speciality'     => $data['speciality'] ?? null,
            'license_number' => $data['license_number'] ?? null,
            'bio'            => $data['bio'] ?? null,
        ]);

        return response()->json($doctor->fresh(), 201);
    }

    public function updateDoctor(Request $request, int $id): JsonResponse
    {
        if ($err = $this->guard($request)) return $err;

        $doctor = User::where('role', 'medico')->findOrFail($id);

        $data = $request->validate([
            'name'           => 'sometimes|string|max:255',
            'email'          => 'sometimes|email|unique:users,email,' . $id,
            'phone'          => 'nullable|string|max:30',
            'sex'            => 'nullable|in:M,F,X',
            'speciality'     => 'nullable|string|max:100',
            'license_number' => 'nullable|string|max:50',
            'bio'            => 'nullable|string',
        ]);

        $userFields = array_filter(
            $data,
            fn($k) => in_array($k, ['name', 'email', 'phone', 'sex']),
            ARRAY_FILTER_USE_KEY
        );
        if ($userFields) {
            $doctor->update($userFields);
        }

        $profileFields = array_filter(
            $data,
            fn($k) => in_array($k, ['speciality', 'license_number', 'bio']),
            ARRAY_FILTER_USE_KEY
        );
        if ($profileFields) {
            $doctor->doctorProfile()->updateOrCreate(
                ['user_id' => $doctor->id],
                $profileFields
            );
        }

        return response()->json($doctor->fresh());
    }

    public function deleteDoctor(Request $request, int $id): JsonResponse
    {
        if ($err = $this->guard($request)) return $err;

        $doctor = User::where('role', 'medico')->findOrFail($id);
        $doctor->delete();
        return response()->json(['message' => 'Médico eliminado']);
    }

    // ── Doctor ↔ Patient associations ────────────────────────

    public function getDoctorPatients(Request $request, int $doctorId): JsonResponse
    {
        if ($err = $this->guard($request)) return $err;

        $doctor   = User::where('role', 'medico')->findOrFail($doctorId);
        $patients = $doctor->associatedPatients()
            ->select('users.id', 'users.name', 'users.username', 'users.email', 'users.phone', 'users.sex')
            ->get();

        return response()->json($patients);
    }

    public function associatePatient(Request $request, int $doctorId): JsonResponse
    {
        if ($err = $this->guard($request)) return $err;

        $request->validate(['patient_id' => 'required|integer|exists:users,id']);

        $doctor  = User::where('role', 'medico')->findOrFail($doctorId);
        $patient = User::where('role', 'paciente')->findOrFail($request->patient_id);

        $doctor->associatedPatients()->syncWithoutDetaching([$patient->id]);

        return response()->json(['message' => 'Paciente asociado al médico']);
    }

    public function deassociatePatient(Request $request, int $doctorId, int $patientId): JsonResponse
    {
        if ($err = $this->guard($request)) return $err;

        $doctor = User::where('role', 'medico')->findOrFail($doctorId);
        $doctor->associatedPatients()->detach($patientId);

        return response()->json(['message' => 'Asociación eliminada']);
    }

    public function getPatientDoctors(Request $request, int $patientId): JsonResponse
    {
        if ($err = $this->guard($request)) return $err;

        $patient = User::where('role', 'paciente')->findOrFail($patientId);
        $doctors = $patient->associatedDoctors()
            ->select('users.id', 'users.name', 'users.email', 'users.phone')
            ->get();

        return response()->json($doctors);
    }

    // ── Patients (read-only, no clinical data) ────────────────

    public function listPatients(Request $request): JsonResponse
    {
        if ($err = $this->guard($request)) return $err;

        $query = User::where('role', 'paciente');

        if ($request->filled('search')) {
            $q = $request->search;
            $query->where(function ($sq) use ($q) {
                $sq->where('name', 'like', "%$q%")
                   ->orWhere('username', 'like', "%$q%")
                   ->orWhere('email', 'like', "%$q%");
            });
        }

        $patients = $query
            ->withCount(['appointments as appointment_count'])
            ->orderBy('name')
            ->get();

        return response()->json($patients);
    }

    // ── Global appointments ───────────────────────────────────

    public function listAppointments(Request $request): JsonResponse
    {
        if ($err = $this->guard($request)) return $err;

        $query = Appointment::with([
            'patient:id,name,username',
            'doctor:id,name',
        ]);

        if ($request->filled('date')) {
            $query->whereDate('appointment_date', $request->date);
        }

        if ($request->filled('doctor_id')) {
            $query->where('doctor_id', $request->doctor_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $appointments = $query
            ->orderBy('appointment_date', 'desc')
            ->limit(200)
            ->get();

        return response()->json($appointments);
    }
}
