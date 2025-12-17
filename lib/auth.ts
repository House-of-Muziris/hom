import {
  signInWithEmailAndPassword,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut as firebaseSignOut,
  User,
  updatePassword,
  EmailAuthProvider,
  linkWithCredential,
} from "firebase/auth";
import { auth } from "./firebase";

const actionCodeSettings = {
  url: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/verify`,
  handleCodeInApp: true,
};

export async function sendPasswordlessEmail(email: string) {
  try {
    // Use Firebase default email sending
    // Note: Emails will go to spam until you set up a custom SMTP with Firebase
    // For production, configure Firebase email templates or use server action with Resend
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    
    if (typeof window !== "undefined") {
      window.localStorage.setItem("emailForSignIn", email);
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function verifyPasswordlessLink(email: string, link: string) {
  try {
    if (isSignInWithEmailLink(auth, link)) {
      const result = await signInWithEmailLink(auth, email, link);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("emailForSignIn");
      }
      return { success: true, user: result.user };
    }
    return { success: false, error: "Invalid link" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function signInWithPassword(email: string, password: string) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: result.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function signOut() {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export function getCurrentUser(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

export async function createPasswordForUser(password: string) {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // If user signed in with email link, we need to link password credential
    const hasPassword = user.providerData.some(p => p.providerId === "password");
    
    if (!hasPassword && user.email) {
      // Link password credential to existing account
      const credential = EmailAuthProvider.credential(user.email, password);
      await linkWithCredential(user, credential);
    } else {
      // Update existing password
      await updatePassword(user, password);
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
