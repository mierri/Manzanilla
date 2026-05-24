<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\ClinicalRecord;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function patients(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_if($user->isPatient(), 403);

        $query = User::where('role', 'paciente');

        if ($user->isDoctor()) {
            $associatedIds = $user->associatedPatients()->pluck('users.id');
            $query->whereIn('id', $associatedIds);
        }

        $patients = $query
            ->withCount(['clinicalRecords as notes_count'])
            ->addSelect([
                'last_visit' => Appointment::select('appointment_date')
                    ->whereColumn('patient_id', 'users.id')
                    ->where('status', 'confirmed')
                    ->orderByDesc('appointment_date')
                    ->limit(1),
            ])
            ->orderBy('name')
            ->get();

        return response()->json($patients);
    }

    public function calendar(Request $request): JsonResponse
    {
        abort_if($request->user()->isPatient(), 403);

        $doctorId = $request->user()->id;
        $month = $request->input('month', now()->format('Y-m'));

        $appointments = Appointment::with('patient:id,name,username')
            ->where('doctor_id', $doctorId)
            ->whereYear('appointment_date', substr($month, 0, 4))
            ->whereMonth('appointment_date', substr($month, 5, 2))
            ->orderBy('appointment_date')
            ->get();

        return response()->json($appointments);
    }

    public function history(int $patientId, Request $request): JsonResponse
    {
        $user = $request->user();
        // Patients can only see their own history
        if ($user->isPatient() && $user->id !== $patientId) {
            abort(403);
        }

        $patient = User::where('role', 'paciente')->findOrFail($patientId);
        $records = ClinicalRecord::where('patient_id', $patientId)
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['patient' => $patient, 'records' => $records]);
    }
}
