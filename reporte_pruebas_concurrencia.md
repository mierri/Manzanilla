# Concurrency Test Report — Manzanilla System

## 1. Test Objective
The purpose of this test is to empirically validate the distributed mutual exclusion mechanism implemented within the Manzanilla Medical Appointment API. It aims to demonstrate the effective prevention of race conditions when multiple concurrent requests attempt to reserve the identical time slot for the same medical professional.

## 2. Methodology
A Node.js test script (`pruebas/test_concurrencia.mjs`) was engineered to execute high-concurrency stress testing against the reservation endpoint. The script utilizes asynchronous execution (`Promise.all`) to dispatch multiple HTTP POST requests simultaneously.

**Simulation Parameters:**
*   **Target Endpoint:** `POST /api/appointments`
*   **Concurrent Threads:** 20
*   **Payload Structure:**
    ```json
    {
        "patient_id": 1,
        "doctor_id": 1,
        "appointment_date": "2026-06-01 10:00:00",
        "duration": 30
    }
    ```
*   **Success Criteria:** Exactly 1 request must succeed (HTTP 201 Created), while the remaining 19 requests must be actively rejected by the mutual exclusion lock (HTTP 409 Conflict).

## 3. Backend Control Mechanism
The business logic layer (Laravel Controller) implements a distributed locking algorithm leveraging Redis (`Cache::lock`) to secure the critical section prior to executing database transactions:

```php
$lockKey = "appointment_slot:{$doctorId}:" . $appointmentCarbon->format('YmdHi');
$lock    = Cache::lock($lockKey, 10);

if (!$lock->get()) {
    abort(409, 'El horario está siendo reservado en este momento. Intenta de nuevo.');
}
```
This ensures that the critical section (overlap verification and MySQL `INSERT`) is strictly limited to a single execution thread globally.

---

## 4. Execution Log and Results

The following is a direct transcription of the console output generated during the stress test execution:

```text
--------------------------------------------------
CONCURRENCY AND MUTUAL EXCLUSION TEST RUNNER
--------------------------------------------------
Target URL:         http://localhost:8000/api/appointments
Target Slot:        2026-06-01 10:00:00
Concurrent Threads: 20
--------------------------------------------------

EXECUTION RESULTS:
ID   STATUS    LATENCY   MESSAGE
--------------------------------------------------------------------------------
01   409       182ms     El horario está siendo reservado en este momento. Intenta de nuevo.
02   409       181ms     El horario está siendo reservado en este momento. Intenta de nuevo.
03   409       185ms     El horario está siendo reservado en este momento. Intenta de nuevo.
04   201       179ms     Created
05   409       186ms     El horario está siendo reservado en este momento. Intenta de nuevo.
06   409       190ms     El horario está siendo reservado en este momento. Intenta de nuevo.
07   409       188ms     El horario está siendo reservado en este momento. Intenta de nuevo.
08   409       189ms     El horario está siendo reservado en este momento. Intenta de nuevo.
09   409       195ms     El horario está siendo reservado en este momento. Intenta de nuevo.
10   409       192ms     El horario está siendo reservado en este momento. Intenta de nuevo.
11   409       194ms     El horario está siendo reservado en este momento. Intenta de nuevo.
12   409       201ms     El horario está siendo reservado en este momento. Intenta de nuevo.
13   409       200ms     El horario está siendo reservado en este momento. Intenta de nuevo.
14   409       198ms     El horario está siendo reservado en este momento. Intenta de nuevo.
15   409       205ms     El horario está siendo reservado en este momento. Intenta de nuevo.
16   409       202ms     El horario está siendo reservado en este momento. Intenta de nuevo.
17   409       210ms     El horario está siendo reservado en este momento. Intenta de nuevo.
18   409       208ms     El horario está siendo reservado en este momento. Intenta de nuevo.
19   409       211ms     El horario está siendo reservado en este momento. Intenta de nuevo.
20   409       209ms     El horario está siendo reservado en este momento. Intenta de nuevo.

--------------------------------------------------
EXECUTION SUMMARY
--------------------------------------------------
Total Requests Sent:     20
Successful (HTTP 201):   1
Mutex Blocks (HTTP 409): 19
--------------------------------------------------
STATUS: PASS
Distributed mutual exclusion effectively prevented race conditions.
--------------------------------------------------
```

## 5. Final Conclusion
The `Manzanilla` system demonstrated robust resilience against concurrent network collisions. The deployment of a memory-backed distributed lock (Redis) successfully enabled thread `04` to acquire the mutex and finalize the database transaction exclusively. Simultaneously, the controller effectively halted the 19 remaining client requests, thereby safeguarding data integrity. 

Based on these empirical results, the system securely passes the concurrency stress test, fulfilling the race-condition prevention requirement of the distributed systems architecture.
