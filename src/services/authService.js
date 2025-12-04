import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { extractFirebaseError, getAuthErrorMessage } from '../utils/validation';

export const signUp = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        const errorCode = extractFirebaseError(error);
        const friendlyMessage = getAuthErrorMessage(errorCode);
        return { success: false, error: friendlyMessage, code: errorCode };
    }
};

export const signIn = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        const errorCode = extractFirebaseError(error);
        const friendlyMessage = getAuthErrorMessage(errorCode);
        return { success: false, error: friendlyMessage, code: errorCode };
    }
};

export const logOut = async () => {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        const errorCode = extractFirebaseError(error);
        const friendlyMessage = getAuthErrorMessage(errorCode);
        return { success: false, error: friendlyMessage, code: errorCode };
    }
}