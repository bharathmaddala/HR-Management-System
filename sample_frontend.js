import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    signInAnonymously,
    signInWithCustomToken,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where // Not used for sorting, but useful for filtering
} from 'firebase/firestore';

// Define global variables as per instructions
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Main App Component
const App = () => {
    // Authentication State
    const [user, setUser] = useState(null); // Firebase Auth user object
    const [userId, setUserId] = useState(null); // Custom userId for Firestore paths
    const [isAuthReady, setIsAuthReady] = useState(false); // Indicates if Firebase Auth is initialized

    // UI States
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showSignup, setShowSignup] = useState(false);
    const [activeSection, setActiveSection] = useState('employee');
    const [loading, setLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(false); // For login/signup buttons

    // Form Data States
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [signupUsername, setSignupUsername] = useState('');
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

    // --- Firebase Initialization and Auth State Listener ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // User is signed in.
                setUser(currentUser);
                setUserId(currentUser.uid); // Use Firebase UID as userId
                setIsLoggedIn(true);
            } else {
                // User is signed out.
                setUser(null);
                setUserId(null); // No userId if not authenticated
                setIsLoggedIn(false);

                // Attempt anonymous sign-in or custom token sign-in
                try {
                    if (initialAuthToken) {
                        await signInWithCustomToken(auth, initialAuthToken);
                        console.log('Signed in with custom token.');
                    } else {
                        // This path will be hit if running outside Canvas or token is not provided
                        // This is necessary for Firestore rules that require request.auth != null
                        await signInAnonymously(auth);
                        console.log('Signed in anonymously.');
                    }
                } catch (error) {
                    console.error('Firebase Auth initialization error:', error);
                    // Handle cases where anonymous sign-in or custom token fails
                    setAuthMessage({ text: 'Error initializing authentication. Please refresh.', type: 'error' });
                }
            }
            setIsAuthReady(true); // Auth state is now ready
            setLoading(false); // Initial loading finished
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []); // Run only once on component mount

    // --- Firestore Data Subscriptions (Real-time updates) ---
    useEffect(() => {
        if (!isAuthReady || !userId) {
            console.log("Firestore subscriptions waiting for auth readiness or userId...");
            return;
        }

        console.log(`Setting up Firestore subscriptions for userId: ${userId}`);

        // --- Profile Subscription ---
        const profileDocRef = doc(db, `artifacts/${appId}/users/${userId}/profile`, 'myProfile'); // Single profile document
        const unsubscribeProfile = onSnapshot(profileDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setProfile(docSnap.data());
            } else {
                console.log("No profile data found, initializing empty.");
                setProfile({ empId: '', name: '', email: '', department: '' });
            }
        }, (error) => {
            console.error("Error fetching profile:", error);
            showModal(`Error fetching profile: ${error.message}`, 'error');
        });

        // --- Leaves Subscription ---
        const leavesCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/leaves`);
        const unsubscribeLeaves = onSnapshot(leavesCollectionRef, (snapshot) => {
            const fetchedLeaves = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Sort leaves by startDate descending
            fetchedLeaves.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
            setLeaves(fetchedLeaves);
        }, (error) => {
            console.error("Error fetching leaves:", error);
            showModal(`Error fetching leaves: ${error.message}`, 'error');
        });

        // --- Feedback Subscription ---
        const feedbackCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/feedback`);
        const unsubscribeFeedback = onSnapshot(feedbackCollectionRef, (snapshot) => {
            const fetchedFeedback = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Sort feedback by timestamp descending if available
            fetchedFeedback.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            setFeedbackList(fetchedFeedback);
        }, (error) => {
            console.error("Error fetching feedback:", error);
            showModal(`Error fetching feedback: ${error.message}`, 'error');
        });

        // --- Documents Subscription ---
        const documentsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/documents`);
        const unsubscribeDocuments = onSnapshot(documentsCollectionRef, (snapshot) => {
            const fetchedDocuments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Sort documents by uploadDate descending if available
            fetchedDocuments.sort((a, b) => (b.uploadDate || 0) - (a.uploadDate || 0));
            setDocuments(fetchedDocuments);
        }, (error) => {
            console.error("Error fetching documents:", error);
            showModal(`Error fetching documents: ${error.message}`, 'error');
        });

        // Cleanup subscriptions on unmount or userId change
        return () => {
            unsubscribeProfile();
            unsubscribeLeaves();
            unsubscribeFeedback();
            unsubscribeDocuments();
            console.log("Unsubscribed from all Firestore listeners.");
        };
    }, [isAuthReady, userId]); // Re-run when auth state is ready or userId changes

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

    // --- Authentication Handlers ---
    const handleLogin = async (e) => {
        e.preventDefault();
        setAuthLoading(true);
        setAuthMessage({ text: '', type: '' }); // Clear previous messages
        try {
            await signInWithEmailAndPassword(auth, loginUsername, loginPassword);
            setAuthMessage({ text: 'Login successful!', type: 'success' });
            // The onAuthStateChanged listener will handle setting isLoggedIn and showing portal
        } catch (error) {
            console.error("Login error:", error);
            let errorMessage = "Login failed. Please check your credentials.";
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                errorMessage = "Invalid username or password.";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "Invalid email format.";
            }
            setAuthMessage({ text: errorMessage, type: 'error' });
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
            const userCredential = await createUserWithEmailAndPassword(auth, signupUsername, signupPassword);
            const newUser = userCredential.user;

            // Immediately create a user document in Firestore upon successful signup
            // This is for demonstration; in a real app, you might use Cloud Functions for this.
            const userDocRef = doc(db, `artifacts/${appId}/users/${newUser.uid}`, 'userData');
            await setDoc(userDocRef, {
                username: signupUsername,
                createdAt: new Date().toISOString(),
                // Add any other initial user data here
            });

            setAuthMessage({ text: 'Account created successfully! Please login.', type: 'success' });
            setShowSignup(false); // Switch to login form
            setLoginUsername(signupUsername); // Pre-fill login username
        } catch (error) {
            console.error("Signup error:", error);
            let errorMessage = "Signup failed. Please try again.";
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = "Email already in use. Try logging in or use a different email.";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "Invalid email format.";
            } else if (error.code === 'auth/weak-password') {
                errorMessage = "Password is too weak. Must be at least 6 characters.";
            }
            setAuthMessage({ text: errorMessage, type: 'error' });
        } finally {
            setAuthLoading(false);
        }
    };

    const handleLogout = async () => {
        setAuthLoading(true); // Indicate loading while logging out
        try {
            await signOut(auth);
            setIsLoggedIn(false); // Update state manually
            showModal('You have been logged out.', 'info');
            setAuthMessage({ text: '', type: '' }); // Clear auth messages
        } catch (error) {
            console.error("Logout error:", error);
            showModal(`Error logging out: ${error.message}`, 'error');
        } finally {
            setAuthLoading(false);
        }
    };

    // --- HR Feature Handlers ---
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (!userId) {
            showModal("Please log in to save your profile.", 'error');
            return;
        }
        try {
            const profileDocRef = doc(db, `artifacts/${appId}/users/${userId}/profile`, 'myProfile');
            await setDoc(profileDocRef, profile, { merge: true }); // Merge to update specific fields
            showModal('Profile saved successfully!', 'success');
        } catch (error) {
            console.error("Error saving profile:", error);
            showModal(`Error saving profile: ${error.message}`, 'error');
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
            leaveType: formData.get('leaveType'),
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate'),
            reason: formData.get('reason'),
            status: 'Pending', // Default status
            submittedAt: new Date().toISOString()
        };

        try {
            await addDoc(collection(db, `artifacts/${appId}/users/${userId}/leaves`), newLeave);
            showModal('Leave request submitted successfully!', 'success');
            e.target.reset(); // Clear form
        } catch (error) {
            console.error("Error submitting leave request:", error);
            showModal(`Error submitting leave request: ${error.message}`, 'error');
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
            feedback: formData.get('feedback'),
            timestamp: new Date().toISOString()
        };

        try {
            await addDoc(collection(db, `artifacts/${appId}/users/${userId}/feedback`), newFeedback);
            showModal('Feedback submitted successfully!', 'success');
            e.target.reset(); // Clear form
        } catch (error) {
            console.error("Error submitting feedback:", error);
            showModal(`Error submitting feedback: ${error.message}`, 'error');
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

        // In a real application, you would upload the file to Firebase Storage here
        // and then save the download URL and metadata to Firestore.
        // For this example, we'll just save metadata with a placeholder URL.
        const newDocument = {
            fileName: docFile.name,
            fileSize: docFile.size,
            fileType: docType,
            uploadDate: new Date().toISOString(),
            // Placeholder: In a real app, this would be the actual Storage download URL
            downloadUrl: `https://example.com/documents/${userId}/${docFile.name}`
        };

        try {
            await addDoc(collection(db, `artifacts/${appId}/users/${userId}/documents`), newDocument);
            showModal('Document uploaded successfully!', 'success');
            e.target.reset(); // Clear form
        } catch (error) {
            console.error("Error uploading document:", error);
            showModal(`Error uploading document: ${error.message}`, 'error');
        }
    };

    // --- UI Navigation and Scroll Logic ---
    useEffect(() => {
        const navLinks = document.querySelectorAll('#main-nav .nav-item');
        const sections = document.querySelectorAll('main section');

        const handleScroll = () => {
            if (!isLoggedIn) return; // Only run if logged in

            let currentSectionId = '';
            sections.forEach(section => {
                if (sectionRefs.current[section.id]) {
                    const sectionTop = sectionRefs.current[section.id].offsetTop;
                    const sectionHeight = sectionRefs.current[section.id].clientHeight;
                    const navHeight = navRef.current ? navRef.current.offsetHeight : 0;
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
        // Initial call to set active link
        if (isLoggedIn) {
            // Need a slight delay to ensure all section heights are rendered
            setTimeout(handleScroll, 100);
        }

        return () => window.removeEventListener('scroll', handleScroll);
    }, [isLoggedIn, loading]); // Re-run when login state changes or initial loading finishes

    // Smooth scroll for nav links
    const handleNavLinkClick = (e, sectionId) => {
        e.preventDefault();
        setActiveSection(sectionId); // Update active section state

        const targetSection = sectionRefs.current[sectionId];
        if (targetSection && navRef.current) {
            const navHeight = navRef.current.offsetHeight;
            const elementPosition = targetSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - navHeight - 20; // Extra padding

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    };

    if (loading || !isAuthReady) {
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
                        <h2 className="text-3xl font-bold text-center text-blue-800 mb-6">Welcome to F13 HR Management Portal</h2>
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
                                    <label htmlFor="login-username" className="block text-gray-700 text-sm font-semibold mb-2">Email</label>
                                    <input
                                        type="email" // Changed to email for Firebase Auth
                                        id="login-username"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200"
                                        placeholder="Enter your email"
                                        value={loginUsername}
                                        onChange={(e) => setLoginUsername(e.target.value)}
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
                                    <label htmlFor="signup-username" className="block text-gray-700 text-sm font-semibold mb-2">Email</label>
                                    <input
                                        type="email" // Changed to email for Firebase Auth
                                        id="signup-username"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200"
                                        placeholder="Enter your email"
                                        value={signupUsername}
                                        onChange={(e) => setSignupUsername(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="signup-password" className="block text-gray-700 text-sm font-semibold mb-2">Choose Password</label>
                                    <input
                                        type="password"
                                        id="signup-password"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200"
                                        placeholder="Enter a strong password (min 6 chars)"
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
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">F13 Tech HR Management Portal</h1>
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
                                        <div key={leave.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-center">
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
                                        <div key={feedbackItem.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
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
                                        <div key={docItem.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold text-lg">{docItem.fileName} ({docItem.fileType})</p>
                                                <p className="text-sm text-gray-600">Size: {(docItem.fileSize / 1024).toFixed(2)} KB</p>
                                                <p className="text-xs text-gray-400">Uploaded: {new Date(docItem.uploadDate).toLocaleString()}</p>
                                            </div>
                                            <a href={docItem.downloadUrl} target="_blank" rel="noopener noreferrer" className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                                                Download (Placeholder)
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
