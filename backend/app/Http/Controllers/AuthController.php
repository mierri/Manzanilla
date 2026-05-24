<?php

namespace App\Http\Controllers;

use App\Mail\EmailVerificationMail;
use App\Mail\LoginOtpMail;
use App\Mail\PasswordResetCodeMail;
use App\Models\PatientProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // ─── Login ────────────────────────────────────────────────────────────────

    /**
     * Step 1: validate credentials, send OTP via email.
     * Returns {needs_otp: true} — token is NOT issued until OTP is verified.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('username', $request->username)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'username' => ['Las credenciales son incorrectas.'],
            ]);
        }

        if ($user->isAdmin()) {
            $token = $user->createToken('api-token')->plainTextToken;
            return response()->json(['user' => $user->load(['doctorProfile', 'patientProfile']), 'token' => $token]);
        }

        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        Cache::put("otp:login:{$user->id}", Hash::make($code), 300);

        Mail::to($user->email)->send(new LoginOtpMail($code, $user->name));

        return response()->json([
            'needs_otp'    => true,
            'user_id'      => $user->id,
            'masked_email' => $this->maskEmail($user->email),
        ]);
    }

    /**
     * Step 2: verify OTP → issue Sanctum token.
     */
    public function verifyLoginOtp(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'otp'     => 'required|string|size:6',
        ]);

        $user       = User::findOrFail($request->user_id);
        $storedHash = Cache::get("otp:login:{$user->id}");

        if (!$storedHash || !Hash::check($request->otp, $storedHash)) {
            throw ValidationException::withMessages([
                'otp' => ['Código incorrecto o expirado. Solicita uno nuevo.'],
            ]);
        }

        Cache::forget("otp:login:{$user->id}");
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json(['user' => $user->load(['doctorProfile', 'patientProfile']), 'token' => $token]);
    }

    // ─── Register ─────────────────────────────────────────────────────────────

    /**
     * Create patient account (unverified). Sends a 6-digit verification code via email.
     * Token is NOT issued yet — user must verify email first.
     */
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'username' => 'required|string|unique:users|max:50',
            'email'    => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'phone'    => 'nullable|string|max:30',
            'sex'      => 'nullable|in:M,F,X',
            'age'      => 'nullable|integer|min:0|max:130',
            'address'  => 'nullable|string|max:255',
        ]);

        $user = User::create([
            'name'     => $data['name'],
            'username' => $data['username'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
            'role'     => 'paciente',
            'phone'    => $data['phone'] ?? null,
            'sex'      => $data['sex'] ?? null,
        ]);

        PatientProfile::create([
            'user_id' => $user->id,
            'age'     => $data['age'] ?? null,
            'address' => $data['address'] ?? null,
        ]);

        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        Cache::put("otp:email:{$user->id}", Hash::make($code), 86400);

        Mail::to($user->email)->send(new EmailVerificationMail($code, $user->name));

        return response()->json([
            'needs_verification' => true,
            'user_id'            => $user->id,
            'masked_email'       => $this->maskEmail($user->email),
        ], 201);
    }

    /**
     * Verify the email code sent on register → mark email verified, issue token.
     */
    public function verifyEmailCode(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'code'    => 'required|string|size:6',
        ]);

        $user       = User::findOrFail($request->user_id);
        $storedHash = Cache::get("otp:email:{$user->id}");

        if (!$storedHash || !Hash::check($request->code, $storedHash)) {
            throw ValidationException::withMessages([
                'code' => ['Código incorrecto o expirado. Solicita uno nuevo.'],
            ]);
        }

        Cache::forget("otp:email:{$user->id}");

        $user->update(['email_verified_at' => now()]);

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json(['user' => $user->load(['doctorProfile', 'patientProfile']), 'token' => $token]);
    }

    /**
     * Resend email verification code.
     */
    public function resendEmailVerification(Request $request): JsonResponse
    {
        $request->validate(['user_id' => 'required|integer|exists:users,id']);

        $user = User::findOrFail($request->user_id);

        if ($user->email_verified_at) {
            return response()->json(['message' => 'El correo ya está verificado.']);
        }

        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        Cache::put("otp:email:{$user->id}", Hash::make($code), 86400);

        Mail::to($user->email)->send(new EmailVerificationMail($code, $user->name));

        return response()->json(['message' => 'Nuevo código enviado a tu correo.']);
    }

    // ─── Session ──────────────────────────────────────────────────────────────

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Sesión cerrada']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user()->load(['doctorProfile', 'patientProfile']));
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'email'       => 'sometimes|email|unique:users,email,' . $user->id,
            'phone'       => 'nullable|string|max:30',
            'sex'         => 'nullable|in:M,F,X',
            'notif_email' => 'sometimes|boolean',
            'notif_push'  => 'sometimes|boolean',
            // Doctor-specific
            'speciality'      => 'nullable|string|max:100',
            'license_number'  => 'nullable|string|max:50',
            'bio'             => 'nullable|string',
            // Patient-specific
            'age'                     => 'nullable|integer|min:0|max:130',
            'address'                 => 'nullable|string|max:255',
            'blood_type'              => 'nullable|in:A+,A-,B+,B-,O+,O-,AB+,AB-',
            'allergies'               => 'nullable|string',
            'emergency_contact_name'  => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:30',
        ]);

        // Update base user fields
        $userFields = array_filter(
            $data,
            fn($k) => in_array($k, ['name', 'email', 'phone', 'sex', 'notif_email', 'notif_push']),
            ARRAY_FILTER_USE_KEY
        );
        if ($userFields) {
            $user->update($userFields);
        }

        // Update doctor profile
        if ($user->isDoctor()) {
            $doctorFields = array_filter(
                $data,
                fn($k) => in_array($k, ['speciality', 'license_number', 'bio']),
                ARRAY_FILTER_USE_KEY
            );
            if ($doctorFields) {
                $user->doctorProfile()->updateOrCreate(
                    ['user_id' => $user->id],
                    $doctorFields
                );
            }
        }

        // Update patient profile
        if ($user->isPatient()) {
            $patientFields = array_filter(
                $data,
                fn($k) => in_array($k, ['age', 'address', 'blood_type', 'allergies', 'emergency_contact_name', 'emergency_contact_phone']),
                ARRAY_FILTER_USE_KEY
            );
            if ($patientFields) {
                $user->patientProfile()->updateOrCreate(
                    ['user_id' => $user->id],
                    $patientFields
                );
            }
        }

        return response()->json($user->fresh()->load(['doctorProfile', 'patientProfile']));
    }

    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password'     => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['La contraseña actual es incorrecta.'],
            ]);
        }

        $user->update(['password' => Hash::make($request->new_password)]);

        return response()->json(['message' => 'Contraseña actualizada correctamente']);
    }

    // ─── Password Reset ───────────────────────────────────────────────────────

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Si ese correo existe, recibirás un código de recuperación.']);
        }

        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            ['token' => Hash::make($code), 'created_at' => now()]
        );

        Mail::to($user->email)->send(new PasswordResetCodeMail($code, $user->name));

        return response()->json(['message' => 'Si ese correo existe, recibirás un código de recuperación.']);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email'        => 'required|email',
            'code'         => 'required|string|size:6',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$record) {
            throw ValidationException::withMessages(['code' => ['Código inválido o expirado.']]);
        }

        if (now()->diffInMinutes($record->created_at) > 15) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            throw ValidationException::withMessages(['code' => ['El código ha expirado. Solicita uno nuevo.']]);
        }

        if (!Hash::check($request->code, $record->token)) {
            throw ValidationException::withMessages(['code' => ['Código incorrecto.']]);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $user->update(['password' => Hash::make($request->new_password)]);

        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Contraseña restablecida correctamente.']);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function maskEmail(string $email): string
    {
        [$local, $domain] = explode('@', $email);
        $masked = substr($local, 0, 2) . str_repeat('*', max(strlen($local) - 2, 2));
        return $masked . '@' . $domain;
    }
}
