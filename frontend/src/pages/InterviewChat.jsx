import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import './InterviewChat.css';

const InterviewChat = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // 1. Defensive Routing: Null-Checking the state
    const sessionId = location.state?.sessionId || null;
    const initialMessage = location.state?.initialMessage || null;

    useEffect(() => {
        if (!sessionId) {
            // User likely refreshed the page; redirect back to setup
            navigate('/mock-interview', { replace: true });
        }
    }, [sessionId, navigate]);

    // 2. State Management for Chat Bubbles
    const [chatHistory, setChatHistory] = useState(() => {
        return initialMessage ? [{ role: 'model', text: initialMessage }] : [];
    });
    const [currentInput, setCurrentInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [questionCount, setQuestionCount] = useState(1);
    const [isInterviewOver, setIsInterviewOver] = useState(false);

    const chatEndRef = useRef(null);

    // 3. Auto-Scroll Engine
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, isTyping]);

    // 4. Optimistic UI & API Call
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!currentInput.trim() || isTyping || isInterviewOver) return;

        const userText = currentInput;

        // Optimistic UI Update
        setChatHistory(prev => [...prev, { role: 'user', text: userText }]);
        setCurrentInput('');
        setIsTyping(true);

        try {
            const payload = {
                session_id: sessionId,
                message: userText,
                question_count: questionCount
            };

            const response = await axiosInstance.post(`/api/interview/chat/`, payload);
            const { message, is_completed } = response.data;

            // Append AI response
            setChatHistory(prev => [...prev, { role: 'model', text: message }]);

            if (is_completed) {
                setIsInterviewOver(true);
            } else {
                setQuestionCount(prev => prev + 1);
            }
        } catch (error) {
            console.error("Chat Error:", error);
            setChatHistory(prev => [...prev, { role: 'system', text: "Network error. Please try answering again." }]);
        } finally {
            setIsTyping(false);
        }
    };

    if (!sessionId) return null; // Prevent rendering during redirect

    return (
        <div className="chat-wrapper">
            <div className="chat-glass-container">
                <div className="chat-header">
                    <h2 className="chat-title">Live AI Mock Interview</h2>
                </div>

                {/* The Kill Switch & Input Area */}
                {isInterviewOver ? (
                    <div className="report-dashboard-container">
                        {(() => {
                            try {
                                const lastMessage = chatHistory[chatHistory.length - 1]?.text;
                                if (!lastMessage) throw new Error("No report data found.");

                                const report = JSON.parse(lastMessage);

                                return (
                                    <>
                                        <div className="report-header">
                                            <h2 className="report-title">Interview Completed</h2>
                                            <p className="report-subtitle">Here is your comprehensive performance review.</p>
                                        </div>

                                        <div className="report-dashboard">
                                            
                                            {/* Top Card: Responsive Circle Score */}
                                            <div className="glass-card score-card">
                                                <div className="score-circle-container">
                                                    <svg className="score-svg" viewBox="0 0 100 100">
                                                        <circle className="score-bg-circle" cx="50" cy="50" r="40"></circle>
                                                        <circle 
                                                            className="score-progress-circle"
                                                            style={{
                                                                stroke: report.score_out_of_100 >= 70 ? '#4ade80' : report.score_out_of_100 >= 40 ? '#facc15' : '#f87171',
                                                                strokeDasharray: `${(report.score_out_of_100 / 100) * 251.2} 251.2`
                                                            }}
                                                            cx="50" cy="50" r="40"
                                                        ></circle>
                                                    </svg>
                                                    <div className="score-text-absolute">
                                                        <span className="score-number">{report.score_out_of_100}</span>
                                                        <span className="score-label">/ 100</span>
                                                    </div>
                                                </div>
                                                <h3 className="score-title">Overall Score</h3>
                                            </div>

                                            {/* Mid Left: Core Strengths */}
                                            <div className="glass-card strengths-card">
                                                <h3 className="card-title">
                                                    <svg className="report-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                    Core Strengths
                                                </h3>
                                                <ul className="report-list">
                                                    {report.core_strengths?.map((strength, i) => (
                                                        <li key={i}>
                                                            <span className="bullet-icon">•</span>
                                                            {strength}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Mid Right: Critical Weaknesses */}
                                            <div className="glass-card weaknesses-card">
                                                <h3 className="card-title">
                                                    <svg className="report-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                                    Critical Weaknesses
                                                </h3>
                                                <ul className="report-list">
                                                    {report.critical_weaknesses?.map((weakness, i) => (
                                                        <li key={i}>
                                                            <span className="bullet-icon">•</span>
                                                            {weakness}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Bottom Card: Overall Feedback */}
                                            <div className="glass-card feedback-card">
                                                <h3 className="card-title">
                                                    <svg className="report-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                                    Overall Feedback
                                                </h3>
                                                <p className="feedback-text">{report.overall_feedback}</p>
                                            </div>

                                        </div>

                                        <div className="report-actions">
                                            <button onClick={() => navigate('/dashboard')} className="report-action-btn">
                                                Return to Dashboard
                                            </button>
                                        </div>
                                    </>
                                );
                            } catch (e) {
                                console.error("Failed to parse report JSON:", e);
                                return (
                                    <div className="chat-completed-area">
                                        <h3 className="completed-title">Interview Completed!</h3>
                                        <p className="text-gray-300 mb-4 text-sm max-w-2xl mx-auto whitespace-pre-wrap">
                                            {chatHistory[chatHistory.length - 1]?.text || "Report rendering failed. See console."}
                                        </p>
                                        <button onClick={() => navigate('/dashboard')} className="return-btn">
                                            Return to Dashboard
                                        </button>
                                    </div>
                                );
                            }
                        })()}
                    </div>
                ) : (
                    <>
                        {/* Chat Window rendering ONLY when interview is active */}
                        <div className="chat-messages-area">
                            {chatHistory.map((chat, index) => (
                                <div
                                    key={index}
                                    className={`message-row ${chat.role}`}
                                >
                                    <div className={`message-bubble ${chat.role}`}>
                                        <div className="whitespace-pre-wrap">
                                            {chat.text}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="message-row model">
                                    <div className="typing-indicator">
                                        <span className="dot"></span>
                                        <span className="dot"></span>
                                        <span className="dot"></span>
                                    </div>
                                </div>
                            )}

                            {/* Auto-scroll target */}
                            <div ref={chatEndRef} />
                        </div>

                        <form onSubmit={handleSendMessage} className="chat-input-area">
                            <textarea
                                rows={2}
                                value={currentInput}
                                onChange={(e) => setCurrentInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage(e);
                                    }
                                }}
                                disabled={isTyping}
                                placeholder={isTyping ? 'Interviewer is typing...' : 'Type your answer here... (Shift + Enter for new line)'}
                                className="chat-input resize-none"
                                style={{ minHeight: '60px' }}
                            />
                            <button
                                type="submit"
                                disabled={isTyping || !currentInput.trim()}
                                className="chat-send-btn"
                            >
                                <span>Send</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default InterviewChat;
