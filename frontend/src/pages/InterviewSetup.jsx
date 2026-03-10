import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import './InterviewSetup.css';

const InterviewSetup = () => {
    const navigate = useNavigate();

    // 1. States for UI & Data
    const [cvList, setCvList] = useState([]); // Database-ൽ നിന്നുള്ള CV-കൾ വെക്കാൻ
    const [selectedCV, setSelectedCV] = useState('');
    const [jdText, setJdText] = useState('');
    const [interviewType, setInterviewType] = useState('Technical');

    // 2. States for UX (Critical!)
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // (നിന്റെ നിലവിലെ CV ഡാറ്റാബേസിൽ നിന്ന് ഫെച്ച് ചെയ്യാനുള്ള useEffect ഇവിടെ എഴുതാം)

    // 3. The Submit Function (Using Async/Await properly)
    const handleStartInterview = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        // Brutal Validation: Frontend-ൽ തന്നെ ഡാറ്റ ബ്ലോക്ക് ചെയ്യുക
        if (!selectedCV || !jdText.trim()) {
            setErrorMsg("CV and Job Description are strictly required.");
            return;
        }

        setIsLoading(true); // ഇത് കൊടുത്തില്ലെങ്കിൽ Double-Click Flaw ഉണ്ടാകും (Non-Viable)

        try {
            const payload = {
                cv_text: selectedCV, // യഥാർത്ഥത്തിൽ CV-യുടെ ടെക്സ്റ്റ് ആണ് ബാക്കെൻഡിന് വേണ്ടത്
                jd_text: jdText,
                interview_type: interviewType
            };

            const response = await axiosInstance.post(`/api/interview/start/`, payload);

            // 4. Success Navigation (The handoff to Phase 4)
            if (response.status === 200 && response.data.session_id) {
                const { session_id, message } = response.data;

                // അടുത്ത പേജിലേക്ക് session_id ഉം ആദ്യത്തെ മെസ്സേജും കൊണ്ടുപോകുന്നു
                navigate('/interview-chat', {
                    state: {
                        sessionId: session_id,
                        initialMessage: message
                    }
                });
            }

        } catch (error) {
            console.error("API Error:", error);
            setErrorMsg(error.response?.data?.error || "Failed to connect to the server. Try again.");
        } finally {
            setIsLoading(false); // എന്ത് സംഭവിച്ചാലും ലോഡിങ് നിർത്തണം
        }
    };

    return (
        <div className="setup-wrapper">
            <div className="glass-container">
                <h2 className="glass-title">Setup Mock Interview</h2>

                {errorMsg && <div className="error-message">{errorMsg}</div>}

                <form onSubmit={handleStartInterview}>

                    {/* CV Selector */}
                    <div className="form-group">
                        <label className="form-label">Select CV Profile</label>
                        <select
                            value={selectedCV}
                            onChange={(e) => setSelectedCV(e.target.value)}
                            className="glass-select"
                        >
                            <option value="">-- Choose your CV --</option>
                            <option value="I am a fresher Python developer with Django skills...">Python Developer CV</option>
                        </select>
                    </div>

                    {/* JD Input */}
                    <div className="form-group">
                        <label className="form-label">Paste Job Description (JD)</label>
                        <textarea
                            rows="5"
                            value={jdText}
                            onChange={(e) => setJdText(e.target.value)}
                            placeholder="Paste the requirements here..."
                            className="glass-input"
                        ></textarea>
                    </div>

                    {/* Interview Type */}
                    <div className="form-group">
                        <label className="form-label">Interview Type</label>
                        <div className="radio-group">
                            <label className="radio-label">
                                <input type="radio" className="radio-input" value="Technical" checked={interviewType === 'Technical'} onChange={(e) => setInterviewType(e.target.value)} />
                                Technical
                            </label>
                            <label className="radio-label">
                                <input type="radio" className="radio-input" value="HR" checked={interviewType === 'HR'} onChange={(e) => setInterviewType(e.target.value)} />
                                HR Round
                            </label>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="glass-btn"
                    >
                        {isLoading ? 'Starting Engine...' : 'Start Mock Interview'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default InterviewSetup;