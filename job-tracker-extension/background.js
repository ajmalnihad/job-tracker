/**
 * background.js
 * Service worker that handles API requests to bypass Content Security Policy (CSP) headers on LinkedIn and Indeed.
 */

// Define API Base URL. Update this depending on Local vs Live environment.
const API_BASE_URL = 'http://localhost:8000';
// const API_BASE_URL = 'https://job-tracker-iwj8.onrender.com';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'SAVE_JOB') {
        const { payload, token } = request;

        
        // Use an IIFE to handle the async fetch
        (async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/applications/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    const data = await response.json();
                    sendResponse({ success: true, data: data });
                } else {
                    let errorMsg = `HTTP ${response.status}`;
                    try {
                        const errorData = await response.json();
                        errorMsg = JSON.stringify(errorData);
                    } catch (e) {
                        try {
                            errorMsg = await response.text();
                        } catch (err) { }
                    }
                    sendResponse({ success: false, error: errorMsg });
                }
            } catch (error) {
                console.error('Background Fetch Error:', error);
                sendResponse({ success: false, error: error.message || 'Network error. Failed to reach API.' });
            }
        })();

        // Mathematically necessary in Manifest V3 for async sendResponse.
        // It tells Chrome's extension engine that we intend to call sendResponse 
        // at a later, asynchronous time, preventing it from closing the channel immediately.
        return true;
    }
});
