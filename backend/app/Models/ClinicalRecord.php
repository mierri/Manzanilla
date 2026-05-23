<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Crypt;

class ClinicalRecord extends Model
{
    protected $fillable = [
        'appointment_id', 'patient_id',
        'vitals_encrypted', 'diagnosis_encrypted',
        'prescriptions_encrypted', 'analysis_results_encrypted',
    ];

    // Never expose raw encrypted columns
    protected $hidden = [
        'vitals_encrypted', 'diagnosis_encrypted',
        'prescriptions_encrypted', 'analysis_results_encrypted',
    ];

    protected $appends = ['vitals', 'diagnosis', 'prescriptions', 'analysis_results'];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    // Accessors — decrypt on read
    public function getVitalsAttribute(): ?array
    {
        if (empty($this->vitals_encrypted)) return null;
        return json_decode(Crypt::decryptString($this->vitals_encrypted), true);
    }

    public function getDiagnosisAttribute(): ?string
    {
        if (empty($this->diagnosis_encrypted)) return null;
        return Crypt::decryptString($this->diagnosis_encrypted);
    }

    public function getPrescriptionsAttribute(): ?string
    {
        if (empty($this->prescriptions_encrypted)) return null;
        return Crypt::decryptString($this->prescriptions_encrypted);
    }

    public function getAnalysisResultsAttribute(): ?string
    {
        if (empty($this->analysis_results_encrypted)) return null;
        return Crypt::decryptString($this->analysis_results_encrypted);
    }

    // Mutators — encrypt on write
    public function setVitalsAttribute(array $value): void
    {
        $this->attributes['vitals_encrypted'] = Crypt::encryptString(json_encode($value));
    }

    public function setDiagnosisAttribute(?string $value): void
    {
        $this->attributes['diagnosis_encrypted'] = $value ? Crypt::encryptString($value) : null;
    }

    public function setPrescriptionsAttribute(?string $value): void
    {
        $this->attributes['prescriptions_encrypted'] = $value ? Crypt::encryptString($value) : null;
    }

    public function setAnalysisResultsAttribute(?string $value): void
    {
        $this->attributes['analysis_results_encrypted'] = $value ? Crypt::encryptString($value) : null;
    }
}
