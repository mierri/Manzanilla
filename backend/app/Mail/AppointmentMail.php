<?php

namespace App\Mail;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AppointmentMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Appointment $appointment,
        public string $event,   // created | confirmed | rescheduled | cancelled | reminder
        public string $recipientName,
    ) {}

    public function envelope(): Envelope
    {
        $subjects = [
            'created'     => 'Cita agendada · Consultorio Manzanilla',
            'confirmed'   => 'Tu cita fue confirmada · Consultorio Manzanilla',
            'rescheduled' => 'Cita reprogramada · Consultorio Manzanilla',
            'cancelled'   => 'Cita cancelada · Consultorio Manzanilla',
            'reminder'    => 'Recordatorio: tienes cita mañana · Consultorio Manzanilla',
        ];

        return new Envelope(subject: $subjects[$this->event] ?? 'Actualización de cita');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.appointment');
    }
}
