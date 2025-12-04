/**
 * Validates email format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email format
 */
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and message
 */
export const validatePassword = (password) => {
    if (!password) {
        return { isValid: false, message: "Password is required" };
    }
    if (password.length < 6) {
        return { isValid: false, message: "Password must be at least 6 characters" };
    }
    return { isValid: true, message: "" };
};

/**
 * Converts Firebase auth error codes to user-friendly messages
 * @param {string} errorCode - Firebase error code
 * @returns {string} User-friendly error message
 */
export const getAuthErrorMessage = (errorCode) => {
    const errorMessages = {
        "auth/email-already-in-use": "This email is already registered. Please sign in instead.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/operation-not-allowed": "Email/password accounts are not enabled. Please contact support.",
        "auth/weak-password": "Password is too weak. Please use at least 6 characters.",
        "auth/user-disabled": "This account has been disabled. Please contact support.",
        "auth/user-not-found": "No account found with this email. Please sign up first.",
        "auth/wrong-password": "Incorrect password. Please try again.",
        "auth/invalid-credential": "Invalid email or password. Please check your credentials.",
        "auth/too-many-requests": "Too many failed attempts. Please try again later.",
        "auth/network-request-failed": "Network error. Please check your internet connection.",
        "auth/popup-closed-by-user": "Sign-in popup was closed. Please try again.",
        "auth/cancelled-popup-request": "Sign-in was cancelled. Please try again.",
        "auth/missing-password": "Please enter your password.",
        "auth/invalid-login-credentials": "Invalid email or password. Please check and try again.",
    };

    return errorMessages[errorCode] || "An unexpected error occurred. Please try again.";
};

/**
 * Extracts Firebase error code from error object or string
 * @param {Error|string} error - Error object or error message
 * @returns {string} Firebase error code or original message
 */
export const extractFirebaseError = (error) => {
    if (typeof error === "string") {
        // Check if the string contains a Firebase error code
        const match = error.match(/auth\/[\w-]+/);
        return match ? match[0] : error;
    }
    
    if (error?.code) {
        return error.code;
    }
    
    if (error?.message) {
        const match = error.message.match(/auth\/[\w-]+/);
        return match ? match[0] : error.message;
    }
    
    return "An unexpected error occurred";
};
