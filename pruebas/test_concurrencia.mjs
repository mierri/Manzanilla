import fs from 'fs';

const CONFIG = {
    apiUrl: 'http://localhost:8000/api/appointments',
    token: 'INSERT_VALID_TOKEN_HERE',
    concurrentRequests: 20
};

const PAYLOAD = {
    patient_id: 1,
    doctor_id: 1,
    appointment_date: '2026-06-01 10:00:00',
    duration: 30
};

async function executeRequest(threadId) {
    const startTime = performance.now();
    
    try {
        const response = await fetch(CONFIG.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${CONFIG.token}`
            },
            body: JSON.stringify(PAYLOAD)
        });
        
        const endTime = performance.now();
        
        let responseData;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            responseData = await response.json();
        } else {
            responseData = { message: await response.text() };
        }
        
        return {
            threadId: threadId,
            statusCode: response.status,
            latencyMs: Math.round(endTime - startTime),
            message: response.status === 201 ? 'Created' : (responseData.message || `HTTP ${response.status}`)
        };
    } catch (error) {
        return { 
            threadId: threadId, 
            statusCode: 500, 
            latencyMs: 0, 
            message: error.message 
        };
    }
}

async function runConcurrencyTest() {
    console.log(`Target URL:         ${CONFIG.apiUrl}`);
    console.log(`Target Slot:        ${PAYLOAD.appointment_date}`);
    console.log(`Concurrent Threads: ${CONFIG.concurrentRequests}`);

    const requests = Array.from({ length: CONFIG.concurrentRequests }, (_, i) => executeRequest(i + 1));
    const results = await Promise.all(requests);

    let successCount = 0;
    let conflictCount = 0;
    let errorCount = 0;

    console.log('EXECUTION RESULTS:');
    console.log('ID'.padEnd(5) + 'STATUS'.padEnd(10) + 'LATENCY'.padEnd(10) + 'MESSAGE');
    console.log('-'.repeat(80));

    results.forEach(result => {
        if (result.statusCode === 201) successCount++;
        else if (result.statusCode === 409) conflictCount++;
        else errorCount++;
        
        const idStr = result.threadId.toString().padStart(2, '0');
        const statusStr = result.statusCode.toString().padEnd(10);
        const latencyStr = `${result.latencyMs}ms`.padEnd(10);
        console.log(`${idStr.padEnd(5)}${statusStr}${latencyStr}${result.message}`);
    });

    console.log(`Total Requests Sent:     ${CONFIG.concurrentRequests}`);
    console.log(`Successful (HTTP 201):   ${successCount}`);
    console.log(`Mutex Blocks (HTTP 409): ${conflictCount}`);
    
    if (errorCount > 0) {
        console.log(`Other Errors:            ${errorCount}`);
    }
    
    if (successCount === 1 && conflictCount === (CONFIG.concurrentRequests - 1)) {
        console.log('STATUS: PASS');
        console.log('Distributed mutual exclusion effectively prevented race conditions.');
    } else {
        console.log('STATUS: FAIL');
        console.log('Race condition detected or unexpected API behavior.');
    }
}

runConcurrencyTest();
