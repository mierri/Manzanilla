<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'username', 'email', 'password',
        'role', 'phone', 'sex',
        'notif_email', 'notif_push',
    ];

    protected $hidden = ['password', 'remember_token'];

    // Expose profile fields at top level for frontend compatibility
    protected $appends = [
        'speciality', 'license_number', 'bio',
        'age', 'address', 'blood_type', 'allergies',
        'emergency_contact_name', 'emergency_contact_phone',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'notif_email'       => 'boolean',
            'notif_push'        => 'boolean',
        ];
    }

    // ── Profile relationships ─────────────────────────────────

    public function doctorProfile(): HasOne
    {
        return $this->hasOne(DoctorProfile::class);
    }

    public function patientProfile(): HasOne
    {
        return $this->hasOne(PatientProfile::class);
    }

    // ── Appointment relationships ─────────────────────────────

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'patient_id');
    }

    public function doctorAppointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'doctor_id');
    }

    public function clinicalRecords(): HasMany
    {
        return $this->hasMany(ClinicalRecord::class, 'patient_id');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(ManzanillaNotification::class);
    }

    // ── Doctor ↔ Patient pivot ────────────────────────────────

    public function associatedPatients(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'doctor_patient', 'doctor_id', 'patient_id')
                    ->withTimestamps();
    }

    public function associatedDoctors(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'doctor_patient', 'patient_id', 'doctor_id')
                    ->withTimestamps();
    }

    // ── Role helpers ──────────────────────────────────────────

    public function isDoctor(): bool  { return $this->role === 'medico'; }
    public function isPatient(): bool { return $this->role === 'paciente'; }
    public function isAdmin(): bool   { return $this->role === 'admin'; }

    // ── Doctor profile accessors (flat for frontend compat) ───
    // Guard with relationLoaded() so listing endpoints never trigger lazy loads.

    public function getSpecialityAttribute(): ?string
    {
        return $this->relationLoaded('doctorProfile') ? $this->doctorProfile?->speciality : null;
    }

    public function getLicenseNumberAttribute(): ?string
    {
        return $this->relationLoaded('doctorProfile') ? $this->doctorProfile?->license_number : null;
    }

    public function getBioAttribute(): ?string
    {
        return $this->relationLoaded('doctorProfile') ? $this->doctorProfile?->bio : null;
    }

    // ── Patient profile accessors (flat for frontend compat) ──

    public function getAgeAttribute(): ?int
    {
        return $this->relationLoaded('patientProfile') ? $this->patientProfile?->age : null;
    }

    public function getAddressAttribute(): ?string
    {
        return $this->relationLoaded('patientProfile') ? $this->patientProfile?->address : null;
    }

    public function getBloodTypeAttribute(): ?string
    {
        return $this->relationLoaded('patientProfile') ? $this->patientProfile?->blood_type : null;
    }

    public function getAllergiesAttribute(): ?string
    {
        return $this->relationLoaded('patientProfile') ? $this->patientProfile?->allergies : null;
    }

    public function getEmergencyContactNameAttribute(): ?string
    {
        return $this->relationLoaded('patientProfile') ? $this->patientProfile?->emergency_contact_name : null;
    }

    public function getEmergencyContactPhoneAttribute(): ?string
    {
        return $this->relationLoaded('patientProfile') ? $this->patientProfile?->emergency_contact_phone : null;
    }
}
