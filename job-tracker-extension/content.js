/**
 * content.js
 * Injected into the active tab to extract job application details and show Floating UI.
 */
console.log('--- Job Tracker Content Script Loaded ---');

// Define API Base URL. Upgrade this to live URL as needed.
// Note: Actual API requests have been moved to background.js to bypass CSP.
const API_BASE_URL = 'http://localhost:8000';

// Prevent multiple listeners from being attached
if (!window.hasJobTrackerListener) {
    window.hasJobTrackerListener = true;
    function checkAndInjectWidget() {
        console.log("Checking token...");
        chrome.storage.local.get(['access_token'], (result) => {
            if (result.access_token) {
                console.log("Widget injected");
                initFloatingUI(result.access_token);
            } else {
                console.log("No token, widget hidden");
            }
        });
    }

    // Run only after the document body is fully available
    if (document.readyState === 'loading') {
        window.addEventListener('load', checkAndInjectWidget);
    } else {
        checkAndInjectWidget();
    }

    // Listen for auth state changes from popup.js
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'extractJobData') {
            const data = extractJobData();
            sendResponse(data);
        } else if (request.action === 'authChanged') {
            if (request.token) {
                initFloatingUI(request.token);
            } else {
                removeFloatingUI();
            }
        }
        return true;
    });

    /**
     * Initializes the Floating Action Button and Panel
     */
    function initFloatingUI(token) {
        if (document.getElementById('job-tracker-fab-container')) return;

        // Container definition to isolate CSS
        const container = document.createElement('div');
        container.id = 'job-tracker-fab-container';
        // Enforce the host container to always be visible and positioned correctly, immune to external CSS
        container.style.cssText = `
            position: fixed !important;
            bottom: 20px !important;
            right: 20px !important;
            z-index: 2147483647 !important; /* Max Z-index */
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            pointer-events: none !important; /* Let clicks pass through container */
            width: auto !important;
            height: auto !important;
            display: block !important;
            background: transparent !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
        `;

        // Use a Shadow DOM to completely isolate CSS from the host page (LinkedIn/Indeed)
        const shadow = container.attachShadow({ mode: 'open' });

        const style = document.createElement('style');
        style.textContent = `
            :host {
                --primary: #4f46e5;
                --primary-hover: #4338ca;
                --bg: #121212;
                --surface: #1e1e1e;
                --border: #2d2d2d;
                --text: #f3f4f6;
                --success: #10b981;
                --error: #ef4444;
            }
            .fab {
                width: 56px !important;
                height: 56px !important;
                border-radius: 50% !important;
                background-color: var(--primary) !important;
                color: white !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
                cursor: pointer !important;
                pointer-events: auto !important;
                transition: transform 0.2s, background-color 0.2s !important;
                position: absolute !important;
                bottom: 0 !important;
                right: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
                z-index: 9999 !important;
            }
            .fab:hover {
                background-color: var(--primary-hover) !important;
                transform: scale(1.05) !important;
            }
            .fab svg {
                width: 24px !important;
                height: 24px !important;
                fill: none !important;
                stroke: currentColor !important;
                stroke-width: 2 !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            .panel {
                position: absolute !important;
                bottom: 70px !important;
                right: 0 !important;
                width: 320px !important;
                background-color: var(--bg) !important;
                border: 1px solid var(--border) !important;
                border-radius: 12px !important;
                padding: 20px !important;
                box-shadow: 0 8px 24px rgba(0,0,0,0.4) !important;
                color: var(--text) !important;
                pointer-events: auto !important;
                opacity: 0 !important;
                transform: translateY(20px) !important;
                transition: opacity 0.3s, transform 0.3s !important;
                visibility: hidden !important;
                box-sizing: border-box !important;
                z-index: 9999 !important;
            }
            .panel.open {
                opacity: 1 !important;
                transform: translateY(0) !important;
                visibility: visible !important;
            }
            .header {
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                margin-bottom: 16px !important;
            }
            .header h3 {
                margin: 0 !important;
                font-size: 16px !important;
                font-weight: 600 !important;
                color: var(--text) !important;
            }
            .close-btn {
                background: none !important;
                border: none !important;
                color: #9ca3af !important;
                cursor: pointer !important;
                font-size: 20px !important;
                padding: 0 !important;
                line-height: 1 !important;
            }
            .close-btn:hover { color: white; }
            .form-group {
                margin-bottom: 12px;
            }
            label {
                display: block;
                font-size: 12px;
                color: #9ca3af;
                margin-bottom: 4px;
            }
            input {
                width: 100%;
                background: var(--surface);
                border: 1px solid var(--border);
                border-radius: 6px;
                padding: 8px 10px;
                color: var(--text);
                font-size: 13px;
                box-sizing: border-box;
            }
            input:focus {
                outline: none;
                border-color: var(--primary);
            }
            button.save-btn {
                width: 100%;
                padding: 10px;
                background: var(--primary);
                color: white;
                border: none;
                border-radius: 6px;
                font-weight: 600;
                cursor: pointer;
                margin-top: 8px;
            }
            button.save-btn:hover:not(:disabled) {
                background: var(--primary-hover);
            }
            button.save-btn:disabled {
                opacity: 0.7;
                cursor: not-allowed;
            }
            #status {
                margin-top: 12px;
                font-size: 12px;
                text-align: center;
                min-height: 16px;
            }
            .success { color: var(--success); }
            .error { color: var(--error); }
        `;

        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
            <div class="panel" id="jt-panel">
                <div class="header">
                    <h3>Save Job</h3>
                    <button class="close-btn" id="jt-close">&times;</button>
                </div>
                <div class="form-group">
                    <label>Job Title</label>
                    <input type="text" id="jt-role">
                </div>
                <div class="form-group">
                    <label>Company</label>
                    <input type="text" id="jt-company">
                </div>
                <div class="form-group">
                    <label>Job URL</label>
                    <input type="url" id="jt-url">
                </div>
                <div class="form-group">
                    <label>Follow-up Date</label>
                    <input type="date" id="jt-followup">
                </div>
                <button class="save-btn" id="jt-save">Save Application</button>
                <div id="status"></div>
            </div>
            <div class="fab" id="jt-fab" title="Save Job">
                <svg viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            </div>
        `;

        shadow.appendChild(style);
        shadow.appendChild(wrapper);
        document.body.appendChild(container);

        // Logic Bindings
        const fab = shadow.getElementById('jt-fab');
        const panel = shadow.getElementById('jt-panel');
        const closeBtn = shadow.getElementById('jt-close');

        const roleInp = shadow.getElementById('jt-role');
        const compInp = shadow.getElementById('jt-company');
        const urlInp = shadow.getElementById('jt-url');
        const followInp = shadow.getElementById('jt-followup');
        const saveBtn = shadow.getElementById('jt-save');
        const statusEl = shadow.getElementById('status');

        fab.addEventListener('click', () => {
            panel.classList.add('open');
            fab.style.display = 'none';

            // 1. Auto-fill Scraped Data
            const data = extractJobData();
            if (data.jobTitle) roleInp.value = data.jobTitle;
            if (data.companyName) compInp.value = data.companyName;

            // 2. Auto-fill URL
            urlInp.value = window.location.href;

            // 3. Auto-fill +7 Days Date
            const today = new Date();
            today.setDate(today.getDate() + 7);
            followInp.value = today.toISOString().split('T')[0];

            // Clear status
            statusEl.textContent = '';
            statusEl.className = '';
        });

        const closePanel = () => {
            panel.classList.remove('open');
            setTimeout(() => { fab.style.display = 'flex'; }, 300);
        };

        closeBtn.addEventListener('click', closePanel);

        saveBtn.addEventListener('click', async () => {
            const role = roleInp.value.trim();
            const comp = compInp.value.trim();
            const link = urlInp.value.trim();
            const fwup = followInp.value;

            if (!role || !comp || !link || !fwup) {
                statusEl.textContent = 'Please fill all fields.';
                statusEl.className = 'error';
                return;
            }

            saveBtn.disabled = true;
            saveBtn.textContent = 'Saving...';
            statusEl.textContent = '';

            try {
                const payload = {
                    company_name: comp,
                    role: role,
                    job_url: link,
                    status: 'applied',
                    applied_date: new Date().toISOString().split('T')[0],
                    follow_up_date: fwup
                };

                // Send message to background script to bypass CSP restrictions
                chrome.runtime.sendMessage({
                    action: 'SAVE_JOB',
                    payload: payload,
                    token: token
                }, (response) => {
                    // Check for internal Chrome extension messaging errors
                    if (chrome.runtime.lastError) {
                        const errMsg = chrome.runtime.lastError.message || 'Unknown messaging error';
                        console.error('Save Application Failed: ', errMsg);
                        statusEl.textContent = 'Error communicating with background script.';
                        statusEl.className = 'error';
                        saveBtn.disabled = false;
                        saveBtn.textContent = 'Save Application';
                        return;
                    }

                    if (response && response.success) {
                        statusEl.textContent = 'Saved successfully!';
                        statusEl.className = 'success';

                        // Clear inputs & minimize after 2 secs
                        setTimeout(() => {
                            roleInp.value = '';
                            compInp.value = '';
                            closePanel();
                        }, 2000);
                    } else {
                        const specificError = response ? response.error : 'Unknown message error';
                        console.error("Save Application Failed:", specificError);
                        statusEl.textContent = `Error: ${specificError}`;
                        statusEl.className = 'error';
                    }

                    saveBtn.disabled = false;
                    saveBtn.textContent = 'Save Application';
                });

            } catch (error) {
                statusEl.textContent = 'Unexpected error occurred.';
                statusEl.className = 'error';
                saveBtn.disabled = false;
                saveBtn.textContent = 'Save Application';
            }
        });
    }

    function removeFloatingUI() {
        const ui = document.getElementById('job-tracker-fab-container');
        if (ui) ui.remove();
    }

    /**
     * Helper: Safely query selectors inside a specific parent container.
     */
    function getTextFromContainer(container, selectors) {
        if (!container) return '';

        for (const selector of selectors) {
            try {
                const el = container.querySelector(selector);
                if (el && el.innerText && el.innerText.trim()) {
                    return el.innerText.trim();
                }
            } catch (err) { }
        }
        return '';
    }

    /**
     * Helper: Scrape LinkedIn
     */
    function extractLinkedInData() {
        let jobTitle = '';
        let companyName = '';

        const containerSelectors = ['.job-view-layout', '.jobs-details__main-content', '.job-details-jobs-unified-top-card', 'main'];
        let mainContainer = document;

        for (const selector of containerSelectors) {
            const el = document.querySelector(selector);
            if (el) {
                mainContainer = el;
                break;
            }
        }

        const titleSelectors = ['.job-details-jobs-unified-top-card__job-title h1', '.job-details-jobs-unified-top-card__job-title', '.top-card-layout__title', '.artdeco-entity-lockup__title', 'h1.t-24', 'h1'];
        const companySelectors = ['.job-details-jobs-unified-top-card__company-name a', '.job-details-jobs-unified-top-card__company-name', '.job-details-jobs-unified-top-card__primary-description-container a', '.topcard__org-name-link', '.artdeco-entity-lockup__subtitle', '.job-details-jobs-unified-top-card__primary-description-container'];

        jobTitle = getTextFromContainer(mainContainer, titleSelectors);
        companyName = getTextFromContainer(mainContainer, companySelectors);

        if (companyName.includes('·')) companyName = companyName.split('·')[0].trim();

        return { jobTitle, companyName };
    }

    /**
     * Helper: Scrape Indeed
     */
    function extractIndeedData() {
        let jobTitle = '';
        let companyName = '';

        const mainContainer = document.querySelector('.jobsearch-JobComponent') || document.querySelector('.jobsearch-JobInfoHeader') || document.querySelector('#jobDescriptionText')?.parentElement || document;

        const titleSelectors = ['h1.jobsearch-JobInfoHeader-title', 'h2.jobTitle', '.jobsearch-JobInfoHeader-title', 'h1'];
        const companySelectors = ['div[data-company-name="true"]', '.jobsearch-CompanyInfoContainer a', '.jobsearch-CompanyInfoContainer', '.jobsearch-InlineCompanyRating-company'];

        jobTitle = getTextFromContainer(mainContainer, titleSelectors);
        companyName = getTextFromContainer(mainContainer, companySelectors);

        return { jobTitle, companyName };
    }

    /**
     * Master Router Function
     */
    function extractJobData() {
        const hostname = window.location.hostname;
        let result = { jobTitle: '', companyName: '' };

        if (hostname.includes('linkedin.com')) {
            result = extractLinkedInData();
        } else if (hostname.includes('indeed.com')) {
            result = extractIndeedData();
        }

        return {
            jobTitle: result.jobTitle || "",
            companyName: result.companyName || ""
        };
    }
}
