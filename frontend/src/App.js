import React, { useState, useEffect, useRef } from 'react';

// Define base URL for your API Gateway endpoints
// *** IMPORTANT: REPLACE THIS WITH YOUR ACTUAL API GATEWAY INVOKE URL ***
const API_BASE_URL = 'https://l4fi5f9bxk.execute-api.us-east-1.amazonaws.com/Test'; // Example: https://xxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod

// App Component
const App = () => {
    // Authentication State
    const [userId, setUserId] = useState(null); // Represents the authenticated user's ID (Cognito Sub)
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showSignup, setShowSignup] = useState(false); // To toggle between login/signup forms
    const [loading, setLoading] = useState(true); // Initial app loading (for full screen spinner)
    const [authLoading, setAuthLoading] = useState(false); // For login/signup button states

    // Account Verification States (NEW)
    const [showVerificationForm, setShowVerificationForm] = useState(false); // Controls visibility of verification form
    const [verificationCode, setVerificationCode] = useState(''); // Stores the 6-digit code entered by user
    const [pendingVerificationEmail, setPendingVerificationEmail] = useState(''); // Stores email for verification

    // UI States
    const [activeSection, setActiveSection] = useState('employee'); // For navigation active state

    // Form Data States for Auth
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Messages/Modals
    const [authMessage, setAuthMessage] = useState({ text: '', type: '' }); // type: 'error' or 'success' for auth forms
    const [isModalOpen, setIsModalOpen] = useState(false); // For custom success/error modals
    const [modalMessage, setModalMessage] = useState('');
    const [modalType, setModalType] = useState('info'); // 'info', 'success', 'error' for modals

    // HR Data States (fetched from backend)
    const [profile, setProfile] = useState({ empId: '', name: '', email: '', department: '' });
    const [leaves, setLeaves] = useState([]);
    const [feedbackList, setFeedbackList] = useState([]);
    const [documents, setDocuments] = useState([]);

    // Refs for scroll positioning and navigation highlight
    const navRef = useRef(null);
    // Use an object to store refs for each section dynamically
    const sectionRefs = useRef({});

    // --- Modal Handler Functions ---
    // Displays a custom modal message to the user
    const showModal = (message, type = 'info') => {
        setModalMessage(message);
        setModalType(type);
        setIsModalOpen(true);
    };

    // Closes the custom modal
    const closeModal = () => {
        setIsModalOpen(false);
        setModalMessage('');
        setModalType('info');
    };

    // --- Initial App Load and Data Fetching (after login) ---
    useEffect(() => {
        // Simulate initial loading. In a real app, you might check localStorage for a JWT
        // and try to re-authenticate or load user data based on it.
        // For this guide, we start at the login screen unless explicitly logged in.
        setTimeout(() => {
            setLoading(false); // Hide the initial loading spinner
        }, 1000); // Simulate a network delay
    }, []); // Runs only once on component mount

    // Effect to fetch user-specific data from the backend once logged in
    useEffect(() => {
        const fetchUserData = async () => {
            // Only fetch if user is logged in and userId is available
            if (!isLoggedIn || !userId) return;

            setLoading(true); // Show loading indicator while fetching
            try {
                // Fetch Profile Data
                const profileResponse = await fetch(`${API_BASE_URL}/profile?userId=${userId}`, {
                    headers: { /* 'Authorization': `Bearer ${userToken}` */ } // In real app, include auth token
                });
                if (profileResponse.ok) {
                    const data = await profileResponse.json();
                    // Set profile, or empty if no data (e.g., first login)
                    setProfile(data.profile || { empId: '', name: '', email: '', department: '' });
                } else {
                    console.error('Failed to fetch profile:', await profileResponse.text());
                    showModal('Failed to load employee profile.', 'error');
                }

                // Fetch Leaves Data
                const leavesResponse = await fetch(`${API_BASE_URL}/leaves?userId=${userId}`, {
                    headers: { /* 'Authorization': `Bearer ${userToken}` */ }
                });
                if (leavesResponse.ok) {
                    const data = await leavesResponse.json();
                    // Sort leaves by submittedAt descending for latest first
                    setLeaves(data.leaves ? data.leaves.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)) : []);
                } else {
                    console.error('Failed to fetch leaves:', await leavesResponse.text());
                    showModal('Failed to load leave history.', 'error');
                }

                // Fetch Feedback Data
                const feedbackResponse = await fetch(`${API_BASE_URL}/feedback?userId=${userId}`, {
                    headers: { /* 'Authorization': `Bearer ${userToken}` */ }
                });
                if (feedbackResponse.ok) {
                    const data = await feedbackResponse.json();
                    // Sort feedback by timestamp descending
                    setFeedbackList(data.feedback ? data.feedback.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) : []);
                } else {
                    console.error('Failed to fetch feedback:', await feedbackResponse.text());
                    showModal('Failed to load performance feedback.', 'error');
                }

                // Fetch Documents Metadata
                const documentsResponse = await fetch(`${API_BASE_URL}/documents?userId=${userId}`, {
                    headers: { /* 'Authorization': `Bearer ${userToken}` */ }
                });
                if (documentsResponse.ok) {
                    const data = await documentsResponse.json();
                    // Sort documents by uploadDate descending
                    setDocuments(data.documents ? data.documents.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)) : []);
                } else {
                    console.error('Failed to fetch documents:', await documentsResponse.text());
                    showModal('Failed to load document list.', 'error');
                }

            } catch (error) {
                console.error('Error during data fetching:', error);
                showModal('Network error or backend issue. Could not load all HR data.', 'error');
            } finally {
                setLoading(false); // Hide loading indicator after data fetch attempt
            }
        };

        fetchUserData(); // Call the fetch function
    }, [isLoggedIn, userId]); // Dependency array: re-run when isLoggedIn or userId changes

    // --- Authentication Handlers ---
    const handleLogin = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        setAuthLoading(true); // Show loading spinner on button
        setAuthMessage({ text: '', type: '' }); // Clear any previous auth messages

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: loginEmail, password: loginPassword }),
            });

            if (response.ok) {
                const data = await response.json();
                // Assuming your backend returns a userId (Cognito 'sub' claim) on successful login
                // In a real app, you'd store data.idToken in localStorage/sessionStorage for persistent sessions.
                setUserId(data.userId); // Set the userId state
                setIsLoggedIn(true); // Update login status
                setAuthMessage({ text: 'Login successful!', type: 'success' });
            } else {
                const errorData = await response.json();
                // Display error message from backend or a generic one
                setAuthMessage({ text: errorData.message || 'Login failed. Please check your credentials.', type: 'error' });
            }
        } catch (error) {
            console.error("Login error:", error);
            setAuthMessage({ text: 'Network error or backend issue. Please try again.', type: 'error' });
        } finally {
            setAuthLoading(false); // Hide loading spinner
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setAuthLoading(true);
        setAuthMessage({ text: '', type: '' }); // Clear previous auth messages

        if (signupPassword !== confirmPassword) {
            setAuthMessage({ text: 'Passwords do not match.', type: 'error' });
            setAuthLoading(false);
            return;
        }
        if (signupPassword.length < 8 || !/[0-9]/.test(signupPassword) || !/[a-z]/.test(signupPassword) || !/[A-Z]/.test(signupPassword) || !/[!@#$%^&*()]/.test(signupPassword)) {
            setAuthMessage({ text: 'Password must be at least 8 characters long and include numbers, uppercase, lowercase, and special characters.', type: 'error' });
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
                // *** MODIFIED LOGIC FOR VERIFICATION FLOW ***
                setPendingVerificationEmail(signupEmail); // Store email for verification
                setShowVerificationForm(true); // Show the verification form
                setShowSignup(false); // Hide the signup form
                setAuthMessage({ text: 'Account created successfully! A verification code has been sent to your email.', type: 'success' });
                // Clear signup form fields
                setSignupEmail('');
                setSignupPassword('');
                setConfirmPassword('');
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

    // --- Account Verification Handlers (NEW) ---
    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setAuthLoading(true);
        setAuthMessage({ text: '', type: '' });

        if (!pendingVerificationEmail) {
            setAuthMessage({ text: 'No email found for verification. Please sign up again.', type: 'error' });
            setAuthLoading(false);
            return;
        }
        if (!verificationCode || verificationCode.length !== 6) {
            setAuthMessage({ text: 'Please enter a valid 6-digit verification code.', type: 'error' });
            setAuthLoading(false);
            return;
        }

        try {
            // Call your backend API to confirm the user's account with Cognito
            const response = await fetch(`${API_BASE_URL}/auth/confirm-signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: pendingVerificationEmail, code: verificationCode }),
            });

            if (response.ok) {
                setAuthMessage({ text: 'Account verified successfully! You can now log in.', type: 'success' });
                setShowVerificationForm(false); // Hide verification form
                setPendingVerificationEmail(''); // Clear pending email
                setVerificationCode(''); // Clear code
                setShowSignup(false); // Ensure we are on login view
                setLoginEmail(pendingVerificationEmail); // Pre-fill login email for convenience
            } else {
                const errorData = await response.json();
                setAuthMessage({ text: errorData.message || 'Verification failed. Please check the code or try again.', type: 'error' });
            }
        } catch (error) {
            console.error("Verification error:", error);
            setAuthMessage({ text: 'Network error or backend issue during verification. Please try again.', type: 'error' });
        } finally {
            setAuthLoading(false);
        }
    };

    const handleResendCode = async () => {
        setAuthLoading(true);
        setAuthMessage({ text: '', type: '' });

        if (!pendingVerificationEmail) {
            setAuthMessage({ text: 'No email found to resend code to. Please sign up again.', type: 'error' });
            setAuthLoading(false);
            return;
        }

        try {
            // Call your backend API to resend the confirmation code via Cognito
            const response = await fetch(`${API_BASE_URL}/auth/resend-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: pendingVerificationEmail }),
            });

            if (response.ok) {
                setAuthMessage({ text: 'New verification code sent! Check your email.', type: 'success' });
            } else {
                const errorData = await response.json();
                setAuthMessage({ text: errorData.message || 'Failed to resend code. Please try again.', type: 'error' });
            }
        } catch (error) {
            console.error("Resend code error:", error);
            setAuthMessage({ text: 'Network error or backend issue during resend. Please try again.', type: 'error' });
        } finally {
            setAuthLoading(false);
        }
    };

    const handleLogout = () => {
        setAuthLoading(true); // Indicate loading while logging out
        // In a real application, you would also clear any stored tokens (JWTs) from localStorage/sessionStorage.
        setUserId(null); // Clear userId
        setIsLoggedIn(false); // Set logged out state
        // Clear all form inputs for a fresh start on next login/signup
        setLoginEmail('');
        setLoginPassword('');
        setSignupEmail('');
        setSignupPassword('');
        setConfirmPassword('');
        setShowVerificationForm(false); // Hide verification form
        setPendingVerificationEmail(''); // Clear pending email
        setVerificationCode(''); // Clear verification code
        // Clear all HR data states
        setProfile({ empId: '', name: '', email: '', department: '' });
        setLeaves([]);
        setFeedbackList([]);
        setDocuments([]);
        showModal('You have been logged out successfully!', 'info'); // Inform user
        setAuthMessage({ text: '', type: '' }); // Clear any auth messages
        setAuthLoading(false); // Hide loading spinner
    };

    // --- HR Feature Handlers (interacting with backend via fetch) ---

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (!userId) { // Ensure user is logged in
            showModal("Please log in to save your profile.", 'error');
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/profile`, {
                method: 'POST', // Using POST for both create/update as per typical simple API design
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${userToken}` // In real app, include auth token for protected routes
                },
                body: JSON.stringify({ userId, ...profile }), // Send userId along with profile data
            });

            if (response.ok) {
                showModal('Profile saved successfully!', 'success');
                // Re-fetch data to ensure UI is updated with latest from DB (or update state directly)
                // In this case, we trigger fetch by modifying a dummy state or specific fetch function
                if (isLoggedIn && userId) { /* Trigger data fetch by updating a dummy state or specific fetch function */ }
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
            userId, // Pass userId for backend to associate
            leaveType: formData.get('leaveType'),
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate'),
            reason: formData.get('reason'),
            status: 'Pending', // Default status for new requests
            submittedAt: new Date().toISOString() // Capture submission timestamp
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
                e.target.reset(); // Clear the form fields
                // Re-fetch leaves to update the list on the UI
                if (isLoggedIn && userId) { /* Trigger data fetch by updating a dummy state or specific fetch function */ }
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
                if (isLoggedIn && userId) { /* Trigger data fetch */ }
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
        const docFile = formData.get('docUpload'); // This is a File object
        const docType = formData.get('docType');

        if (!docFile || docFile.name === '') {
            showModal('Please select a file to upload.', 'error');
            return;
        }

        // IMPORTANT: For a real file upload, you would typically:
        // 1. Send a request to your backend to get a pre-signed S3 URL.
        // 2. Use that URL to directly upload the file from the frontend to S3.
        // 3. Then send metadata (including the S3 key) to your backend (DynamoDB).
        // This example only sends metadata to the backend. The actual file is NOT sent via this fetch.
        const newDocumentMetadata = {
            userId,
            fileName: docFile.name,
            fileSize: docFile.size, // Size in bytes
            fileType: docType,
            uploadDate: new Date().toISOString(),
            // Placeholder for S3 key and public URL; backend would generate real ones
            s3Key: `documents/${userId}/${docFile.name}`, // Example S3 key path
        };
        // Fallback/dummy for downloadUrl (replace with actual S3 URL in production)
        newDocumentMetadata.downloadUrl = `https://f13tech-hrms-documents-youruniqueid.s3.amazonaws.com/${newDocumentMetadata.s3Key}`; // Make sure this matches your S3 bucket name if you want to test link

        try {
            const response = await fetch(`${API_BASE_URL}/documents/upload`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify(newDocumentMetadata), // Sending metadata, not the actual file binary
            });

            if (response.ok) {
                showModal('Document metadata saved successfully! (Actual file upload to S3 needs further implementation)', 'success');
                e.target.reset(); // Clear form
                if (isLoggedIn && userId) { /* Trigger data fetch */ }
            } else {
                const errorData = await response.json();
                showModal(`Error uploading document: ${errorData.message || response.statusText}`, 'error');
            }
        } catch (error) {
            console.error("Error uploading document:", error);
            showModal(`Network error or backend issue: ${error.message}`, 'error');
        }
    };


    // --- UI Navigation and Scroll Logic (for main portal sections) ---
    useEffect(() => {
        // Select all navigation links and content sections
        const navLinks = document.querySelectorAll('#main-nav .nav-item');
        const sections = document.querySelectorAll('main section');

        // Function to update the active navigation link based on scroll position
        const handleScroll = () => {
            // Only execute if user is logged in and navigation element exists
            if (!isLoggedIn || !navRef.current) return;

            let currentSectionId = '';
            // Iterate through each section to determine which one is currently in view
            sections.forEach(section => {
                if (sectionRefs.current[section.id]) { // Ensure the ref is attached to the DOM element
                    const sectionTop = sectionRefs.current[section.id].offsetTop; // Top position of the section
                    const sectionHeight = sectionRefs.current[section.id].clientHeight; // Height of the section
                    const navHeight = navRef.current.offsetHeight; // Height of the sticky navigation bar
                    // Calculate scroll offset considering the sticky nav
                    const scrollOffset = window.pageYOffset + navHeight + 30; // +30px for a bit of padding

                    // If scroll position is within the current section's bounds
                    if (scrollOffset >= sectionTop && scrollOffset < sectionTop + sectionHeight) {
                        currentSectionId = section.id; // Mark this section as current
                    }
                }
            });

            // Update CSS classes for navigation links
            navLinks.forEach(link => {
                // Remove active styles from all links first
                link.classList.remove('nav-link-active', 'bg-blue-500', 'text-white');
                link.classList.add('bg-transparent', 'text-gray-700'); // Reset to default styles

                // If this link's href matches the current section, apply active styles
                if (link.getAttribute('href').includes(currentSectionId)) {
                    link.classList.add('nav-link-active', 'bg-blue-500', 'text-white');
                    link.classList.remove('bg-transparent', 'text-gray-700');
                }
            });
        };

        // Add scroll event listener
        window.addEventListener('scroll', handleScroll);
        // Initial call to set active link after logged in state changes or data loads
        if (isLoggedIn) {
            // A small delay ensures all DOM elements are rendered and offsets are correct
            setTimeout(handleScroll, 100);
        }

        // Cleanup: remove event listener when component unmounts or isLoggedIn changes
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isLoggedIn, loading]); // Dependencies for this effect

    // Handles click on navigation links for smooth scrolling
    const handleNavLinkClick = (e, sectionId) => {
        e.preventDefault(); // Prevent default anchor link behavior
        setActiveSection(sectionId); // Update the active section state directly

        const targetSection = sectionRefs.current[sectionId]; // Get the DOM element for the target section
        if (targetSection && navRef.current) { // Ensure elements exist
            const navHeight = navRef.current.offsetHeight; // Height of the sticky nav
            const elementPosition = targetSection.getBoundingClientRect().top; // Position relative to viewport
            // Calculate absolute scroll position with offset for sticky nav
            const offsetPosition = elementPosition + window.pageYOffset - navHeight - 20; // Extra 20px padding

            // Perform smooth scroll
            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    };

    // --- Conditional Rendering for Initial Loading Spinner ---
    if (loading && !isLoggedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                    <p className="mt-4 text-gray-700 text-lg">Loading HRMS Portal...</p>
                </div>
            </div>
        );
    }

    // --- Main Render Logic ---
    return (
        <div className="bg-gray-100 text-gray-800">
            {/* Custom Modal Component for Alerts (replaces browser alert/confirm) */}
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

            {/* Authentication Page Container (Login/Signup forms) */}
            {!isLoggedIn && (
                <div id="auth-container" className="min-h-screen flex items-center justify-center bg-gray-100">
                    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                        <h2 className="text-3xl font-bold text-center text-blue-800 mb-6">Welcome to F13 Tech HR Management System</h2>
                        <p className="text-center text-gray-600 mb-8" id="auth-tagline">
                            {showVerificationForm ? 'Enter the verification code sent to your email.' : (showSignup ? 'Create your account to get started.' : 'Please login to access the portal.')}
                        </p>

                        {/* Display Auth Message (Success or Error) */}
                        {authMessage.text && (
                            <p className={`text-center text-sm mb-4 ${authMessage.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                                {authMessage.text}
                            </p>
                        )}

                        {/* Login Form (Conditionally rendered) */}
                        {!showSignup && !showVerificationForm && (
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
                                <p className="text-center text-gray-600 mt-4">Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setShowSignup(true); setAuthMessage({ text: '', type: '' }); setShowVerificationForm(false); }} className="text-blue-600 hover:underline font-medium">Sign Up</a></p>
                            </form>
                        )}

                        {/* Signup Form (Conditionally rendered) */}
                        {showSignup && !showVerificationForm && (
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
                                        placeholder="Enter a strong password (min 8 chars, incl. special, number, upper, lower)"
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
                                <p className="text-center text-gray-600 mt-4">Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setShowSignup(false); setAuthMessage({ text: '', type: '' }); setShowVerificationForm(false); }} className="text-blue-600 hover:underline font-medium">Login</a></p>
                            </form>
                        )}

                        {/* NEW VERIFICATION FORM BLOCK (Conditionally rendered) */}
                        {showVerificationForm && (
                            <form id="verification-form" className="space-y-6" onSubmit={handleVerifyCode}>
                                <p className="text-center text-gray-700">A 6-digit code has been sent to **{pendingVerificationEmail}**.</p>
                                <div>
                                    <label htmlFor="verification-code" className="block text-gray-700 text-sm font-semibold mb-2">Verification Code</label>
                                    <input
                                        type="text"
                                        id="verification-code"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200"
                                        placeholder="Enter 6-digit code"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        maxLength="6"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={authLoading}
                                >
                                    {authLoading ? 'Verifying...' : 'Verify Account'}
                                </button>
                                <p className="text-center text-gray-600 mt-4">
                                    Didn't receive the code? <a href="#" onClick={(e) => { e.preventDefault(); handleResendCode(); }} className="text-blue-600 hover:underline font-medium">Resend Code</a>
                                </p>
                                <p className="text-center text-gray-600">
                                    <a href="#" onClick={(e) => { e.preventDefault(); setShowVerificationForm(false); setShowSignup(false); setAuthMessage({ text: '', type: '' }); }} className="text-blue-600 hover:underline font-medium">Back to Login</a>
                                </p>
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
                        {/* Display User ID for debugging/identification */}
                        <p className="text-xs absolute top-4 left-4 opacity-70">
                            User ID: {userId || 'N/A'}
                        </p>
                        {/* Logout Button */}
                        <button
                            id="logout-button"
                            onClick={handleLogout}
                            className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-xl shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={authLoading}
                        >
                            {authLoading ? 'Logging Out...' : 'Logout'}
                        </button>
                    </header>

                    {/* Navigation Bar (Sticky at the top) */}
                    <nav id="main-nav" ref={navRef} className="sticky top-0 z-50 bg-white p-3 rounded-2xl shadow-lg flex justify-center mb-8">
                        <div className="flex flex-wrap justify-center space-x-2 md:space-x-4">
                            {/* Navigation Links, dynamically apply active class */}
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
                                        <div key={leave.leaveId || leave.submittedAt} className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-center">
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
                                        <div key={feedbackItem.feedbackId || feedbackItem.timestamp} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
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
                                        <div key={docItem.documentId || docItem.uploadDate} className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold text-lg">{docItem.fileName} ({docItem.fileType})</p>
                                                <p className="text-sm text-gray-600">Size: {(docItem.fileSize / 1024).toFixed(2)} KB</p>
                                                <p className="text-xs text-gray-400">Uploaded: {new Date(docItem.uploadDate).toLocaleString()}</p>
                                            </div>
                                            {/* Assuming downloadUrl is provided by backend (S3 public URL or pre-signed URL) */}
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
