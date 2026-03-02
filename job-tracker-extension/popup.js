/**
 * popup.js
 * Manages the Auth UI logic of the extension.
 * The active job saving UI is now handled by the injected content.js floating widget.
 */

// Define API Base URL
// const API_BASE_URL = 'http://localhost:8000';
const API_BASE_URL = 'https://job-tracker-iwj8.onrender.com';

document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const loginSection = document.getElementById('loginSection');
    const loggedInSection = document.getElementById('loggedInSection');

    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');

    const logoutBtn = document.getElementById('logoutBtn');
    const statusEl = document.getElementById('status');

    // On Load: Check auth status
    checkAuthStatus();

    // 1. Handle Login
    loginBtn.addEventListener('click', async () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
            setStatus('Please enter both username and password.', 'error');
            return;
        }

        loginBtn.disabled = true;
        loginBtn.textContent = 'Logging in...';
        setStatus('', '');

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok && data.access) {
                chrome.storage.local.set({ access_token: data.access }, () => {
                    setStatus('Login successful!', 'success');
                    usernameInput.value = '';
                    passwordInput.value = '';

                    setTimeout(() => {
                        setStatus('', '');
                        showLoggedInSection();
                        window.close();
                    }, 1000);

                    // Notify content scripts that auth changed so they show the FAB
                    notifyContentScriptsOfAuthChange(data.access);
                });
            } else {
                let errorMsg = 'Login failed. Please check credentials.';
                if (data.detail) errorMsg = data.detail;
                setStatus(errorMsg, 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            setStatus('Network error. Unable to reach API.', 'error');
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = 'Login';
        }
    });

    // 2. Handle Logout
    logoutBtn.addEventListener('click', () => {
        chrome.storage.local.remove('access_token', () => {
            showLoginSection();
            setStatus('Logged out successfully.', 'success');
            setTimeout(() => setStatus('', ''), 2000);

            // Notify content scripts that auth changed so they hide the FAB
            notifyContentScriptsOfAuthChange(null);
        });
    });

    // --- Helper Functions ---

    function checkAuthStatus() {
        chrome.storage.local.get(['access_token'], (result) => {
            if (result.access_token) {
                showLoggedInSection();
            } else {
                showLoginSection();
            }
        });
    }

    function showLoginSection() {
        loginSection.classList.add('active');
        loggedInSection.classList.remove('active');
    }

    function showLoggedInSection() {
        loginSection.classList.remove('active');
        loggedInSection.classList.add('active');
    }

    function setStatus(message, type) {
        statusEl.textContent = message;
        statusEl.className = type;
    }

    async function notifyContentScriptsOfAuthChange(token) {
        // Query active tab and send a message.
        // We do this so the widget appears immediately upon login without a manual refresh.
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'authChanged',
                    token: token
                }, (response) => {
                    // Ignore errors here if the script wasn't injected yet (e.g. non-job page)
                    if (chrome.runtime.lastError) { }
                });
            }
        } catch (e) { }
    }
});
