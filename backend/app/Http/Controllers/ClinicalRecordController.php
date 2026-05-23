<?php

namespace App\Http\Controllers;

use App\Models\ClinicalRecord;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClinicalRecordController extends Controller
{
    public function index(int $patientId, Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->isPatient() && $user->id !== $patientId) {
            abort(403);
        }

        $records = ClinicalRecord::where('patient_id', $patientId)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($records);
    }

    public function show(int $patientId, int $recordId, Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->isPatient() && $user->id !== $patientId) {
            abort(403);
        }

        $record = ClinicalRecord::where('patient_id', $patientId)->findOrFail($recordId);
        return response()->json($record);
    }

    public function store(int $patientId, Request $request): JsonResponse
    {
        $user = $request->user();
        abort_if($user->isPatient(), 403, 'Solo el médico puede crear registros clínicos.');

        User::where('role', 'paciente')->findOrFail($patientId);

        $data = $request->validate([
            'appointment_id'     => 'nullable|exists:appointments,id',
            'vitals'             => 'required|array',
            'vitals.temperature' => 'required|numeric',
            'vitals.weight'      => 'required|numeric',
            'vitals.height'      => 'required|numeric',
            'vitals.systolic'    => 'required|numeric',
            'vitals.diastolic'   => 'required|numeric',
            'vitals.heart_rate'  => 'nullable|numeric',
            'diagnosis'          => 'nullable|string',
            'prescriptions'      => 'nullable|string',
            'analysis_results'   => 'nullable|string',
        ]);

        $record = new ClinicalRecord(['appointment_id' => $data['appointment_id'] ?? null, 'patient_id' => $patientId]);
        $record->vitals           = $data['vitals'];
        $record->diagnosis        = $data['diagnosis'] ?? null;
        $record->prescriptions    = $data['prescriptions'] ?? null;
        $record->analysis_results = $data['analysis_results'] ?? null;
        $record->save();

        return response()->json($record, 201);
    }

    public function update(int $patientId, int $recordId, Request $request): JsonResponse
    {
        abort_if($request->user()->isPatient(), 403);

        $record = ClinicalRecord::where('patient_id', $patientId)->findOrFail($recordId);
        $data = $request->validate([
            'vitals'           => 'sometimes|array',
            'diagnosis'        => 'nullable|string',
            'prescriptions'    => 'nullable|string',
            'analysis_results' => 'nullable|string',
        ]);

        if (isset($data['vitals']))                         $record->vitals           = $data['vitals'];
        if (array_key_exists('diagnosis', $data))           $record->diagnosis        = $data['diagnosis'];
        if (array_key_exists('prescriptions', $data))       $record->prescriptions    = $data['prescriptions'];
        if (array_key_exists('analysis_results', $data))    $record->analysis_results = $data['analysis_results'];
        $record->save();

        return response()->json($record);
    }
}
