'use client';
import {
  Auth,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import {
  doc,
  Firestore,
} from 'firebase/firestore';
import { setDocumentNonBlocking } from './non-blocking-updates';

/**
 * Initiates email/password sign-up, profile update, and Firestore document creation.
 * This is a "fire-and-forget" operation from the UI's perspective.
 * It handles the entire sign-up flow asynchronously without blocking the main thread.
 * Auth state changes are managed by the global onAuthStateChanged listener.
 */
export function initiateSignUp(
  auth: Auth,
  firestore: Firestore,
  email: string,
  password: string,
  displayName: string
): void {
  createUserWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      const user = userCredential.user;
      
      // Chain the next operations inside the .then() block.
      
      // 1. Update the user's profile in Firebase Authentication.
      // This promise is returned to the next .then() block.
      return updateProfile(user, { displayName: displayName })
        .then(() => {
          // 2. Create the user's document in Firestore.
          // This is also a non-blocking call.
          const userRef = doc(firestore, 'users', user.uid);
          const userData = {
            id: user.uid,
            email: user.email,
            displayName: displayName,
            createdAt: new Date().toISOString(),
          };
          setDocumentNonBlocking(userRef, userData, { merge: true });
          
          // The user object is passed down the promise chain if needed,
          // but we don't need to do anything further with it here.
          return user; 
        });
    })
    .catch(error => {
      // All errors from createUser, updateProfile, or setDoc will be caught here.
      // We can log them or send them to a reporting service.
      console.error("An error occurred during the sign-up process:", error);
      // Optionally, you could use a global event emitter to show a toast notification
      // to the user without coupling this service to the UI.
    });
}
