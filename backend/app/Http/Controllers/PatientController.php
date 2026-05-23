<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\PatientProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class PatientController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->isDoctor()) {
            $associatedIds = $user->associatedPatients()->pluck('users.id');
            $query = User::where('role', 'paciente')->whereIn('id', $associatedIds);
        } else {
            $query = User::where('role', 'paciente');
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('username', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%");
            });
        }

        $patients = $query->withCount(['clinicalRecords as notes_count'])
            ->addSelect([
                'last_visit' => Appointment::select('appointment_date')
                    ->whereColumn('patient_id', 'users.id')
                    ->where('status', 'confirmed')
                    ->orderByDesc('appointment_date')
                    ->limit(1),
            ])
            ->orderByDesc('last_visit')
            ->get();

        return response()->json($patients);
    }

    public function show(int $id): JsonResponse
    {
        $patient = User::where('role', 'paciente')
            ->withCount(['clinicalRecords as notes_count'])
            ->findOrFail($id);
        return response()->json($patient);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'username' => 'required|string|unique:users|max:50',
            'email'    => 'required|email|unique:users',
            'password' => 'required|string|min:6',
            'phone'    => 'nullable|string|max:30',
            'sex'      => 'nullable|in:M,F,X',
            'age'      => 'nullable|integer|min:0|max:130',
            'address'  => 'nullable|string|max:255',
            'blood_type'              => 'nullable|in:A+,A-,B+,B-,O+,O-,AB+,AB-',
            'allergies'               => 'nullable|string',
            'emergency_contact_name'  => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:30',
        ]);

        $patient = User::create([
            'name'              => $data['name'],
            'username'          => $data['username'],
            'email'             => $data['email'],
            'password'          => Hash::make($data['password']),
            'role'              => 'paciente',
            'phone'             => $data['phone'] ?? null,
            'sex'               => $data['sex'] ?? null,
            'email_verified_at' => now(),
        ]);

        PatientProfile::create([
            'user_id'                 => $patient->id,
            'age'                     => $data['age'] ?? null,
            'address'                 => $data['address'] ?? null,
            'blood_type'              => $data['blood_type'] ?? null,
            'allergies'               => $data['allergies'] ?? null,
            'emergency_contact_name'  => $data['emergency_contact_name'] ?? null,
            'emergency_contact_phone' => $data['emergency_contact_phone'] ?? null,
        ]);

        return response()->json($patient->fresh(), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $patient = User::where('role', 'paciente')->findOrFail($id);

        $data = $request->validate([
            'name'    => 'sometimes|string|max:255',
            'email'   => 'sometimes|email|unique:users,email,' . $id,
            'phone'   => 'nullable|string|max:30',
            'sex'     => 'nullable|in:M,F,X',
            'age'     => 'nullable|integer|min:0|max:130',
            'address' => 'nullable|string|max:255',
            'blood_type'              => 'nullable|in:A+,A-,B+,B-,O+,O-,AB+,AB-',
            'allergies'               => 'nullable|string',
            'emergency_contact_name'  => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:30',
        ]);

        $userFields = array_filter(
            $data,
            fn($k) => in_array($k, ['name', 'email', 'phone', 'sex']),
            ARRAY_FILTER_USE_KEY
        );
        if ($userFields) {
            $patient->update($userFields);
        }

        $profileFields = array_filter(
            $data,
            fn($k) => in_array($k, ['age', 'address', 'blood_type', 'allergies', 'emergency_contact_name', 'emergency_contact_phone']),
            ARRAY_FILTER_USE_KEY
        );
        if ($profileFields) {
            $patient->patientProfile()->updateOrCreate(
                ['user_id' => $patient->id],
                $profileFields
            );
        }

        return response()->json($patient->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $patient = User::where('role', 'paciente')->findOrFail($id);
        $patient->delete();
        return response()->json(['message' => 'Paciente eliminado']);
    }
}
