import React, { useState, useEffect, useRef } from 'react';

// Define base URL for your API Gateway endpoints
// Replace with your actual API Gateway endpoint once deployed
const API_BASE_URL = 'https://your-api-gateway-id.execute-api.your-region.amazonaws.com/prod'; // Example

// App Component
const App = () => {
    // Authentication State
    const [userId, setUserId] = useState(null); // Represents the authenticated user's ID
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showSignup, setShowSignup] = useState(false);
    const [loading, setLoading] = useState(true); // Initial app loading
    const [authLoading, setAuthLoading] = useState(false); // For login/signup buttons

    // UI States
    const [activeSection, setActiveSection] = useState('employee');

    // Form Data States
    const [loginEmail, setLoginEmail] = useState(''); // Changed to email for Cognito
    const [loginPassword, setLoginPassword] = useState('');
    const [signupEmail, setSignupEmail] = useState(''); // Changed to email for Cognito
    const [signupPassword, setSignupPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Messages/Modals
    const [authMessage, setAuthMessage] = useState({ text: '', type: '' }); // type: 'error' or 'success'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [modalType, setModalType] = useState('info'); // 'info', 'success', 'error'

    // HR Data States
    const [profile, setProfile] = useState({ empId: '', name: '', email: '', department: '' });
    const [leaves, setLeaves] = useState([]);
    const [feedbackList, setFeedbackList] = useState([]);
    const [documents, setDocuments] = useState([]);

    // Refs for scroll positioning
    const navRef = useRef(null);
    const sectionRefs = useRef({});

    // --- Modal Handler ---
    const showModal = (message, type = 'info') => {
        setModalMessage(message);
        setModalType(type);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalMessage('');
        setModalType('info');
    };

    // Simulate initial loading and checking for an existing session (e.g., via localStorage token)
    useEffect(() => {
        // In a real app, you'd check for a stored JWT/session token here
        // For now, we simulate a quick load and start at login page
        setTimeout(() => {
            setLoading(false);
            // If you had a token, you'd try to validate it and set isLoggedIn(true)
            // For this example, we always start at login/signup unless user explicitly logs in
        }, 1000);
    }, []);

    // Fetch user data when logged in
    useEffect(() => {
        const fetchUserData = async () => {
            if (!isLoggedIn || !userId) return;

            setLoading(true); // Show loading while fetching user data
            try {
                // Fetch Profile
                const profileResponse = await fetch(`${API_BASE_URL}/profile?userId=${userId}`);
                if (profileResponse.ok) {
                    const data = await profileResponse.json();
                    setProfile(data.profile || { empId: '', name: '', email: '', department: '' });
                } else {
                    console.error('Failed to fetch profile:', await profileResponse.text());
                }

                // Fetch Leaves
                const leavesResponse = await fetch(`${API_BASE_URL}/leaves?userId=${userId}`);
                if (leavesResponse.ok) {
                    const data = await leavesResponse.json();
                    setLeaves(data.leaves ? data.leaves.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)) : []);
                } else {
                    console.error('Failed to fetch leaves:', await leavesResponse.text());
                }

                // Fetch Feedback
                const feedbackResponse = await fetch(`${API_BASE_URL}/feedback?userId=${userId}`);
                if (feedbackResponse.ok) {
                    const data = await feedbackResponse.json();
                    setFeedbackList(data.feedback ? data.feedback.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) : []);
                } else {
                    console.error('Failed to fetch feedback:', await feedbackResponse.text());
                }

                // Fetch Documents
                const documentsResponse = await fetch(`${API_BASE_URL}/documents?userId=${userId}`);
                if (documentsResponse.ok) {
                    const data = await documentsResponse.json();
                    setDocuments(data.documents ? data.documents.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)) : []);
                } else {
                    console.error('Failed to fetch documents:', await documentsResponse.text());
                }

            } catch (error) {
                console.error('Error fetching user data:', error);
                showModal('Failed to load your HR data. Please try again later.', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [isLoggedIn, userId]); // Re-fetch when logged in or userId changes

    // --- Authentication Handlers ---
    const handleLogin = async (e) => {
        e.preventDefault();
        setAuthLoading(true);
        setAuthMessage({ text: '', type: '' }); // Clear previous messages
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: loginEmail, password: loginPassword }),
            });

            if (response.ok) {
                const data = await response.json();
                // In a real app, data.idToken would be stored in localStorage/sessionStorage
                // and data.userId would be the Cognito User Pool Sub (unique ID)
                setUserId(data.userId); // Assume backend returns the Cognito Sub
                setIsLoggedIn(true);
                setAuthMessage({ text: 'Login successful!', type: 'success' });
            } else {
                const errorData = await response.json();
                setAuthMessage({ text: errorData.message || 'Login failed. Please check your credentials.', type: 'error' });
            }
        } catch (error) {
            console.error("Login error:", error);
            setAuthMessage({ text: 'Network error or backend issue. Please try again.', type: 'error' });
        } finally {
            setAuthLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setAuthLoading(true);
        setAuthMessage({ text: '', type: '' }); // Clear previous messages

        if (signupPassword !== confirmPassword) {
            setAuthMessage({ text: 'Passwords do not match.', type: 'error' });
            setAuthLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: signupEmail, password: signupPassword }),
            });

            if (response.ok) {
                const data = await response.json();
                setAuthMessage({ text: 'Account created successfully! Please login.', type: 'success' });
                setShowSignup(false); // Switch to login form
                setLoginEmail(signupEmail); // Pre-fill login email
            } else {
                const errorData = await response.json();
                setAuthMessage({ text: errorData.message || 'Signup failed. Please try again.', type: 'error' });
            }
        } catch (error) {
            console.error("Signup error:", error);
            setAuthMessage({ text: 'Network error or backend issue. Please try again.', type: 'error' });
        } finally {
            setAuthLoading(false);
        }
    };

    const handleLogout = () => {
        setAuthLoading(true); // Indicate loading while logging out
        // In a real app, you'd also invalidate any tokens here
        setUserId(null);
        setIsLoggedIn(false);
        setLoginEmail('');
        setLoginPassword('');
        setSignupEmail('');
        setSignupPassword('');
        setConfirmPassword('');
        setProfile({ empId: '', name: '', email: '', department: '' });
        setLeaves([]);
        setFeedbackList([]);
        setDocuments([]);
        showModal('You have been logged out.', 'info');
        setAuthMessage({ text: '', type: '' }); // Clear auth messages
        setAuthLoading(false);
    };

    // --- HR Feature Handlers ---
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (!userId) {
            showModal("Please log in to save your profile.", 'error');
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/profile`, {
                method: 'POST', // Or PUT for update
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${userToken}` // In a real app, include auth token
                },
                body: JSON.stringify({ userId, ...profile }),
            });

            if (response.ok) {
                showModal('Profile saved successfully!', 'success');
            } else {
                const errorData = await response.json();
                showModal(`Error saving profile: ${errorData.message || response.statusText}`, 'error');
            }
        } catch (error) {
            console.error("Error saving profile:", error);
            showModal(`Network error or backend issue: ${error.message}`, 'error');
        }
    };

    const handleSubmitLeave = async (e) => {
        e.preventDefault();
        if (!userId) {
            showModal("Please log in to submit a leave request.", 'error');
            return;
        }
        const formData = new FormData(e.target);
        const newLeave = {
            userId,
            leaveType: formData.get('leaveType'),
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate'),
            reason: formData.get('reason'),
            status: 'Pending', // Default status
            submittedAt: new Date().toISOString()
        };

        try {
            const response = await fetch(`${API_BASE_URL}/leaves`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify(newLeave),
            });

            if (response.ok) {
                showModal('Leave request submitted successfully!', 'success');
                e.target.reset(); // Clear form
            } else {
                const errorData = await response.json();
                showModal(`Error submitting leave request: ${errorData.message || response.statusText}`, 'error');
            }
        } catch (error) {
            console.error("Error submitting leave request:", error);
            showModal(`Network error or backend issue: ${error.message}`, 'error');
        }
    };

    const handleSubmitFeedback = async (e) => {
        e.preventDefault();
        if (!userId) {
            showModal("Please log in to submit feedback.", 'error');
            return;
        }
        const formData = new FormData(e.target);
        const newFeedback = {
            userId,
            feedback: formData.get('feedback'),
            timestamp: new Date().toISOString()
        };

        try {
            const response = await fetch(`${API_BASE_URL}/feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify(newFeedback),
            });

            if (response.ok) {
                showModal('Feedback submitted successfully!', 'success');
                e.target.reset(); // Clear form
            } else {
                const errorData = await response.json();
                showModal(`Error submitting feedback: ${errorData.message || response.statusText}`, 'error');
            }
        } catch (error) {
                console.error("Error submitting feedback:", error);
                showModal(`Network error or backend issue: ${error.message}`, 'error');
            }
    };

    const handleUploadDocument = async (e) => {
        e.preventDefault();
        if (!userId) {
            showModal("Please log in to upload documents.", 'error');
            return;
        }
        const formData = new FormData(e.target);
        const docFile = formData.get('docUpload');
        const docType = formData.get('docType');

        if (!docFile || docFile.name === '') {
            showModal('Please select a file to upload.', 'error');
            return;
        }

        // In a real application, you would send the file to S3 via a signed URL or direct upload
        // For this example, we'll simulate by sending metadata
        const newDocumentMetadata = {
            userId,
            fileName: docFile.name,
            fileSize: docFile.size,
            fileType: docType,
            uploadDate: new Date().toISOString(),
            // In a real app, backend would return the S3 key/URL
            s3Key: `documents/${userId}/${docFile.name}`
        };

        try {
            const response = await fetch(`${API_BASE_URL}/documents/upload`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify(newDocumentMetadata), // Send metadata, not actual file
            });

            if (response.ok) {
                showModal('Document metadata saved successfully! (File would be uploaded to S3)', 'success');
                e.target.reset(); // Clear form
            } else {
                const errorData = await response.json();
                showModal(`Error uploading document: ${errorData.message || response.statusText}`, 'error');
            }
        } catch (error) {
            console.error("Error uploading document:", error);
            showModal(`Network error or backend issue: ${error.message}`, 'error');
        }
    };


    // --- UI Navigation and Scroll Logic ---
    useEffect(() => {
        const navLinks = document.querySelectorAll('#main-nav .nav-item');
        const sections = document.querySelectorAll('main section');

        const handleScroll = () => {
            if (!isLoggedIn || !navRef.current) return;

            let currentSectionId = '';
            sections.forEach(section => {
                if (sectionRefs.current[section.id]) {
                    const sectionTop = sectionRefs.current[section.id].offsetTop;
                    const sectionHeight = sectionRefs.current[section.id].clientHeight;
                    const navHeight = navRef.current.offsetHeight;
                    const scrollOffset = window.pageYOffset + navHeight + 30; // Add some offset

                    if (scrollOffset >= sectionTop && scrollOffset < sectionTop + sectionHeight) {
                        currentSectionId = section.id;
                    }
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('nav-link-active', 'bg-blue-500', 'text-white');
                link.classList.add('bg-transparent', 'text-gray-700');
                if (link.getAttribute('href').includes(currentSectionId)) {
                    link.classList.add('nav-link-active', 'bg-blue-500', 'text-white');
                    link.classList.remove('bg-transparent', 'text-gray-700');
                }
            });
        };

        window.addEventListener('scroll', handleScroll);
        if (isLoggedIn) {
            setTimeout(handleScroll, 100); // Small delay to ensure rendering
        }

        return () => window.removeEventListener('scroll', handleScroll);
    }, [isLoggedIn, loading]);

    const handleNavLinkClick = (e, sectionId) => {
        e.preventDefault();
        setActiveSection(sectionId);

        const targetSection = sectionRefs.current[sectionId];
        if (targetSection && navRef.current) {
            const navHeight = navRef.current.offsetHeight;
            const elementPosition = targetSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - navHeight - 20;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    };

    if (loading && !isLoggedIn) { // Only show full loading screen if not logged in
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                    <p className="mt-4 text-gray-700 text-lg">Loading HRMS Portal...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 text-gray-800">
            {/* Modal for messages */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className={`bg-white p-6 rounded-xl shadow-xl max-w-sm w-full text-center
                        ${modalType === 'success' ? 'border-t-4 border-green-500' : ''}
                        ${modalType === 'error' ? 'border-t-4 border-red-500' : ''}
                        ${modalType === 'info' ? 'border-t-4 border-blue-500' : ''}`}>
                        <p className={`text-lg font-semibold ${modalType === 'success' ? 'text-green-700' : ''} ${modalType === 'error' ? 'text-red-700' : ''} ${modalType === 'info' ? 'text-blue-700' : ''} mb-4`}>
                            {modalMessage}
                        </p>
                        <button onClick={closeModal} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200">
                            Okay
                        </button>
                    </div>
                </div>
            )}

            {/* Auth Page Container (Login/Signup) */}
            {!isLoggedIn && (
                <div id="auth-container" className="min-h-screen flex items-center justify-center bg-gray-100">
                    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                        <h2 className="text-3xl font-bold text-center text-blue-800 mb-6">Welcome to F13 Tech HRMS</h2>
                        <p className="text-center text-gray-600 mb-8" id="auth-tagline">
                            {showSignup ? 'Create your account to get started.' : 'Please login to access the portal.'}
                        </p>

                        {authMessage.text && (
                            <p className={`text-center text-sm mb-4 ${authMessage.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                                {authMessage.text}
                            </p>
                        )}

                        {/* Login Form */}
                        {!showSignup && (
                            <form id="login-form" className="space-y-6" onSubmit={handleLogin}>
                                <div>
                                    <label htmlFor="login-email" className="block text-gray-700 text-sm font-semibold mb-2">Email</label>
                                    <input
                                        type="email"
                                        id="login-email"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200"
                                        placeholder="Enter your email"
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="login-password" className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
                                    <input
                                        type="password"
                                        id="login-password"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200"
                                        placeholder="Enter your password"
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={authLoading}
                                >
                                    {authLoading ? 'Logging in...' : 'Login'}
                                </button>
                                <p className="text-center text-gray-600 mt-4">Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setShowSignup(true); setAuthMessage({ text: '', type: '' }); }} className="text-blue-600 hover:underline font-medium">Sign Up</a></p>
                            </form>
                        )}

                        {/* Signup Form */}
                        {showSignup && (
                            <form id="signup-form" className="space-y-6" onSubmit={handleSignup}>
                                <div>
                                    <label htmlFor="signup-email" className="block text-gray-700 text-sm font-semibold mb-2">Email</label>
                                    <input
                                        type="email"
                                        id="signup-email"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200"
                                        placeholder="Enter your email"
                                        value={signupEmail}
                                        onChange={(e) => setSignupEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="signup-password" className="block text-gray-700 text-sm font-semibold mb-2">Choose Password</label>
                                    <input
                                        type="password"
                                        id="signup-password"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200"
                                        placeholder="Enter a strong password (min 8 chars, incl. special, number, upper, lower)" // Cognito policy usually requires this
                                        value={signupPassword}
                                        onChange={(e) => setSignupPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="confirm-password" className="block text-gray-700 text-sm font-semibold mb-2">Confirm Password</label>
                                    <input
                                        type="password"
                                        id="confirm-password"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200"
                                        placeholder="Confirm your password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={authLoading}
                                >
                                    {authLoading ? 'Signing Up...' : 'Sign Up'}
                                </button>
                                <p className="text-center text-gray-600 mt-4">Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setShowSignup(false); setAuthMessage({ text: '', type: '' }); }} className="text-blue-600 hover:underline font-medium">Login</a></p>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Main HRMS Portal Container */}
            {isLoggedIn && (
                <div id="portal-container" className="container mx-auto p-4 md:p-8">
                    {/* Header Section */}
                    <header className="header-bg text-white py-6 md:py-8 px-6 rounded-2xl shadow-xl mb-8 text-center relative">
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">F13 Tech HRMS Portal</h1>
                        <p className="text-md md:text-lg opacity-90 mt-2">Empowering our team with seamless HR solutions.</p>
                        <p className="text-xs absolute top-4 left-4 opacity-70">
                            User ID: {userId || 'N/A'}
                        </p>
                        <button
                            id="logout-button"
                            onClick={handleLogout}
                            className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-xl shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={authLoading}
                        >
                            {authLoading ? 'Logging Out...' : 'Logout'}
                        </button>
                    </header>

                    {/* Navigation Bar */}
                    <nav id="main-nav" ref={navRef} className="sticky top-0 z-50 bg-white p-3 rounded-2xl shadow-lg flex justify-center mb-8">
                        <div className="flex flex-wrap justify-center space-x-2 md:space-x-4">
                            <a className={`nav-item transition-all duration-300 py-3 px-6 rounded-xl text-gray-700 hover:bg-blue-500 hover:text-white font-medium text-sm md:text-base whitespace-nowrap ${activeSection === 'employee' ? 'nav-link-active bg-blue-500 text-white' : ''}`} href="#employee" onClick={(e) => handleNavLinkClick(e, 'employee')}>Employee Profile</a>
                            <a className={`nav-item transition-all duration-300 py-3 px-6 rounded-xl text-gray-700 hover:bg-blue-500 hover:text-white font-medium text-sm md:text-base whitespace-nowrap ${activeSection === 'leave' ? 'nav-link-active bg-blue-500 text-white' : ''}`} href="#leave" onClick={(e) => handleNavLinkClick(e, 'leave')}>Leave Request</a>
                            <a className={`nav-item transition-all duration-300 py-3 px-6 rounded-xl text-gray-700 hover:bg-blue-500 hover:text-white font-medium text-sm md:text-base whitespace-nowrap ${activeSection === 'performance' ? 'nav-link-active bg-blue-500 text-white' : ''}`} href="#performance" onClick={(e) => handleNavLinkClick(e, 'performance')}>Performance Feedback</a>
                            <a className={`nav-item transition-all duration-300 py-3 px-6 rounded-xl text-gray-700 hover:bg-blue-500 hover:text-white font-medium text-sm md:text-base whitespace-nowrap ${activeSection === 'documents' ? 'nav-link-active bg-blue-500 text-white' : ''}`} href="#documents" onClick={(e) => handleNavLinkClick(e, 'documents')}>Upload Documents</a>
                        </div>
                    </nav>

                    {/* Main Content Sections */}
                    <main>
                        {/* Employee Profile Section */}
                        <section id="employee" ref={el => sectionRefs.current['employee'] = el} className="bg-white p-6 md:p-8 rounded-2xl shadow-lg mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold text-blue-800 mb-6 border-b-2 border-blue-200 pb-3">Employee Profile</h2>
                            <form className="space-y-6" onSubmit={handleSaveProfile}>
                                <div>
                                    <label htmlFor="empId" className="block text-gray-700 text-sm font-semibold mb-2">Employee ID</label>
                                    <input
                                        type="text"
                                        id="empId"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200"
                                        placeholder="E.g., F13-001"
                                        value={profile.empId}
                                        onChange={(e) => setProfile({ ...profile, empId: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="name" className="block text-gray-700 text-sm font-semibold mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200"
                                        placeholder="Your Full Name"
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200"
                                        placeholder="you@f13tech.com"
                                        value={profile.email}
                                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="department" className="block text-gray-700 text-sm font-semibold mb-2">Department</label>
                                    <input
                                        type="text"
                                        id="department"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200"
                                        placeholder="E.g., Engineering"
                                        value={profile.department}
                                        onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                                        required
                                    />
                                </div>
                                <button type="submit" className="w-full md:w-auto bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">Save Profile</button>
                            </form>
                            <h3 className="text-xl font-bold text-blue-700 mt-8 mb-4">Current Profile</h3>
                            {profile.empId ? (
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <p><strong>Employee ID:</strong> {profile.empId}</p>
                                    <p><strong>Name:</strong> {profile.name}</p>
                                    <p><strong>Email:</strong> {profile.email}</p>
                                    <p><strong>Department:</strong> {profile.department}</p>
                                </div>
                            ) : (
                                <p className="text-gray-500">No profile data available. Please save your profile.</p>
                            )}
                        </section>

                        {/* Leave Request Section */}
                        <section id="leave" ref={el => sectionRefs.current['leave'] = el} className="bg-white p-6 md:p-8 rounded-2xl shadow-lg mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold text-blue-800 mb-6 border-b-2 border-blue-200 pb-3">Leave Request</h2>
                            <form className="space-y-6" onSubmit={handleSubmitLeave}>
                                <div>
                                    <label htmlFor="leaveType" className="block text-gray-700 text-sm font-semibold mb-2">Leave Type</label>
                                    <select name="leaveType" id="leaveType" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200" required>
                                        <option value="sick">Sick Leave</option>
                                        <option value="casual">Casual Leave</option>
                                        <option value="earned">Earned Leave</option>
                                        <option value="maternity">Maternity Leave</option>
                                        <option value="paternity">Paternity Leave</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="startDate" className="block text-gray-700 text-sm font-semibold mb-2">Start Date</label>
                                    <input type="date" name="startDate" id="startDate" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200" required />
                                </div>
                                <div>
                                    <label htmlFor="endDate" className="block text-gray-700 text-sm font-semibold mb-2">End Date</label>
                                    <input type="date" name="endDate" id="endDate" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200" required />
                                </div>
                                <div>
                                    <label htmlFor="reason" className="block text-gray-700 text-sm font-semibold mb-2">Reason (Optional)</label>
                                    <textarea name="reason" id="reason" rows="3" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200" placeholder="Briefly describe the reason for your leave..."></textarea>
                                </div>
                                <button type="submit" className="w-full md:w-auto bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">Submit Request</button>
                            </form>

                            <h3 className="text-xl font-bold text-blue-700 mt-8 mb-4">Your Leave History</h3>
                            {leaves.length > 0 ? (
                                <div className="space-y-4">
                                    {leaves.map((leave) => (
                                        <div key={leave.leaveId} className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold text-lg">{leave.leaveType} ({leave.status})</p>
                                                <p className="text-sm text-gray-600">{new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</p>
                                                {leave.reason && <p className="text-sm italic text-gray-500">Reason: {leave.reason}</p>}
                                                <p className="text-xs text-gray-400">Submitted: {new Date(leave.submittedAt).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No leave requests submitted yet.</p>
                            )}
                        </section>

                        {/* Performance Feedback Section */}
                        <section id="performance" ref={el => sectionRefs.current['performance'] = el} className="bg-white p-6 md:p-8 rounded-2xl shadow-lg mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold text-blue-800 mb-6 border-b-2 border-blue-200 pb-3">Performance Feedback</h2>
                            <form className="space-y-6" onSubmit={handleSubmitFeedback}>
                                <div>
                                    <label htmlFor="feedback" className="block text-gray-700 text-sm font-semibold mb-2">Your Feedback / Self-Appraisal</label>
                                    <textarea name="feedback" id="feedback" rows="7" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200" placeholder="Provide your comprehensive feedback here..." required></textarea>
                                </div>
                                <button type="submit" className="w-full md:w-auto bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">Submit Feedback</button>
                            </form>

                            <h3 className="text-xl font-bold text-blue-700 mt-8 mb-4">Your Past Feedback</h3>
                            {feedbackList.length > 0 ? (
                                <div className="space-y-4">
                                    {feedbackList.map((feedbackItem) => (
                                        <div key={feedbackItem.feedbackId} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <p className="text-gray-800 leading-relaxed">{feedbackItem.feedback}</p>
                                            <p className="text-sm text-gray-500 mt-2">Submitted: {new Date(feedbackItem.timestamp).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No performance feedback submitted yet.</p>
                            )}
                        </section>

                        {/* Upload Documents Section */}
                        <section id="documents" ref={el => sectionRefs.current['documents'] = el} className="bg-white p-6 md:p-8 rounded-2xl shadow-lg mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold text-blue-800 mb-6 border-b-2 border-blue-200 pb-3">Upload Documents</h2>
                            <form className="space-y-6" onSubmit={handleUploadDocument}>
                                <div>
                                    <label htmlFor="docType" className="block text-gray-700 text-sm font-semibold mb-2">Document Type</label>
                                    <select name="docType" id="docType" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200" required>
                                        <option value="">Select Document Type</option>
                                        <option value="payslip">Payslip</option>
                                        <option value="tax-info">Tax Information</option>
                                        <option value="id-proof">ID Proof</option>
                                        <option value="address-proof">Address Proof</option>
                                        <option value="medical-cert">Medical Certificate</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="docUpload" className="block text-gray-700 text-sm font-semibold mb-2">Select Document File</label>
                                    <input type="file" name="docUpload" id="docUpload" className="w-full p-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer transition-all duration-200" required />
                                </div>
                                <button type="submit" className="w-full md:w-auto bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">Upload Document</button>
                            </form>

                            <h3 className="text-xl font-bold text-blue-700 mt-8 mb-4">Your Uploaded Documents</h3>
                            {documents.length > 0 ? (
                                <div className="space-y-4">
                                    {documents.map((docItem) => (
                                        <div key={docItem.documentId} className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold text-lg">{docItem.fileName} ({docItem.fileType})</p>
                                                <p className="text-sm text-gray-600">Size: {(docItem.fileSize / 1024).toFixed(2)} KB</p>
                                                <p className="text-xs text-gray-400">Uploaded: {new Date(docItem.uploadDate).toLocaleString()}</p>
                                            </div>
                                            <a href={docItem.downloadUrl} target="_blank" rel="noopener noreferrer" className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                                                Download
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No documents uploaded yet.</p>
                            )}
                        </section>
                    </main>

                    {/* Footer Section */}
                    <footer className="text-center text-gray-600 text-sm mt-10 py-4 border-t border-gray-200">
                        &copy; 2025 F13 Tech. All rights reserved.
                    </footer>
                </div>
            )}
        </div>
    );
};

export default App;
