<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClinicalRecordController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\PushSubscriptionController;
use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::prefix('auth')->group(function () {
    // Step 1 login: validate credentials, send OTP
    Route::post('login',                   [AuthController::class, 'login']);
    // Step 2 login: verify OTP, receive token
    Route::post('login/verify-otp',        [AuthController::class, 'verifyLoginOtp']);

    // Step 1 register: create account, send email verification code
    Route::post('register',                [AuthController::class, 'register']);
    // Step 2 register: verify email code, receive token
    Route::post('email/verify-code',       [AuthController::class, 'verifyEmailCode']);
    // Resend email verification code
    Route::post('email/resend',            [AuthController::class, 'resendEmailVerification']);

    Route::post('forgot-password',         [AuthController::class, 'forgotPassword']);
    Route::post('reset-password',          [AuthController::class, 'resetPassword']);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('auth/logout',          [AuthController::class, 'logout']);
    Route::get('auth/me',               [AuthController::class, 'me']);
    Route::put('profile',               [AuthController::class, 'updateProfile']);
    Route::put('auth/change-password',  [AuthController::class, 'changePassword']);

    // Patients (doctor manages, patient reads own)
    Route::apiResource('patients', PatientController::class);

    // Patient's associated doctors (for booking)
    Route::get('my-doctors', function (\Illuminate\Http\Request $r) {
        $doctors = $r->user()->associatedDoctors()
            ->select('users.id', 'users.name', 'users.email', 'users.phone')
            ->get();
        return response()->json($doctors);
    });

    // Appointments (with Redis mutex on create)
    Route::apiResource('appointments', AppointmentController::class);
    Route::post('appointments/{id}/remind', [AppointmentController::class, 'sendReminder']);

    // Clinical records (nested under patient)
    Route::get('patients/{patientId}/records',              [ClinicalRecordController::class, 'index']);
    Route::post('patients/{patientId}/records',             [ClinicalRecordController::class, 'store']);
    Route::get('patients/{patientId}/records/{recordId}',   [ClinicalRecordController::class, 'show']);
    Route::put('patients/{patientId}/records/{recordId}',   [ClinicalRecordController::class, 'update']);

    // Web Push subscriptions
    Route::get('push/public-key',                [PushSubscriptionController::class, 'publicKey']);
    Route::post('push/subscribe',                [PushSubscriptionController::class, 'store']);
    Route::post('push/unsubscribe',              [PushSubscriptionController::class, 'destroy']);

    // Notifications
    Route::get('notifications',                  [NotificationController::class, 'index']);
    Route::patch('notifications/{id}/read',      [NotificationController::class, 'markRead']);
    Route::patch('notifications/read-all',       [NotificationController::class, 'markAllRead']);
    Route::delete('notifications/{id}',          [NotificationController::class, 'delete']);
    Route::delete('notifications',               [NotificationController::class, 'deleteAll']);

    // Reports (doctor only, enforced in controller)
    Route::get('reports/patients',               [ReportController::class, 'patients']);
    Route::get('reports/calendar',               [ReportController::class, 'calendar']);
    Route::get('reports/history/{patientId}',    [ReportController::class, 'history']);

    // Admin routes (admin role enforced inside controller)
    Route::prefix('admin')->group(function () {
        Route::get('stats',                              [AdminController::class, 'stats']);
        Route::get('doctors',                            [AdminController::class, 'listDoctors']);
        Route::post('doctors',                           [AdminController::class, 'createDoctor']);
        Route::put('doctors/{id}',                       [AdminController::class, 'updateDoctor']);
        Route::delete('doctors/{id}',                    [AdminController::class, 'deleteDoctor']);
        Route::get('doctors/{doctorId}/patients',        [AdminController::class, 'getDoctorPatients']);
        Route::post('doctors/{doctorId}/patients',       [AdminController::class, 'associatePatient']);
        Route::delete('doctors/{doctorId}/patients/{patientId}', [AdminController::class, 'deassociatePatient']);
        Route::get('patients/{patientId}/doctors',       [AdminController::class, 'getPatientDoctors']);
        Route::get('patients',                           [AdminController::class, 'listPatients']);
        Route::get('appointments',                       [AdminController::class, 'listAppointments']);
    });
});
