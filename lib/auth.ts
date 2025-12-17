import {
  signInWithEmailAndPassword,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut as firebaseSignOut,
  type User,
  updatePassword,
  EmailAuthProvider,
  linkWithCredential,
} from "firebase/auth";
import { getAuth } from "./firebase";

function getActionCodeSettings() {
  return {
    url: `${typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || ""}/auth/verify`,
    handleCodeInApp: true,
  };
}

export async function sendPasswordlessEmail(email: string) {
  try {
    const auth = getAuth();
    await sendSignInLinkToEmail(auth, email, getActionCodeSettings());
    
    if (typeof window !== "undefined") {
      window.localStorage.setItem("emailForSignIn", email);
    }
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send email";
    return { success: false, error: message };
  }
}

export async function verifyPasswordlessLink(email: string, link: string) {
  try {
    const auth = getAuth();
    if (isSignInWithEmailLink(auth, link)) {
      const result = await signInWithEmailLink(auth, email, link);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("emailForSignIn");
      }
      return { success: true, user: result.user };
    }
    return { success: false, error: "Invalid link" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Verification failed";
    return { success: false, error: message };
  }
}

export async function signInWithPassword(email: string, password: string) {
  try {
    const auth = getAuth();
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: result.user };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    return { success: false, error: message };
  }
}

export async function signOut() {
  try {
    const auth = getAuth();
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sign out failed";
    return { success: false, error: message };
  }
}

export function getCurrentUser(): Promise<User | null> {
  return new Promise((resolve) => {
    try {
      const auth = getAuth();
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe();
        resolve(user);
      });
    } catch {
      resolve(null);
    }
  });
}

export async function createPasswordForUser(password: string) {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Validate password strength
    if (password.length < 8) {
      return { success: false, error: "Password must be at least 8 characters" };
    }

    // If user signed in with email link, we need to link password credential
    const hasPassword = user.providerData.some(p => p.providerId === "password");
    
    if (!hasPassword && user.email) {
      const credential = EmailAuthProvider.credential(user.email, password);
      await linkWithCredential(user, credential);
    } else {
      await updatePassword(user, password);
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create password";
    return { success: false, error: message };
  }
}

export async function checkUserHasPassword(email: string): Promise<{ success: boolean; hasPassword?: boolean; error?: string }> {
  try {
    const auth = getAuth();
    // Check Firebase Auth methods
    const { fetchSignInMethodsForEmail } = await import('firebase/auth');
    const methods = await fetchSignInMethodsForEmail(auth, email);
    const hasPassword = methods.includes('password');
    return { success: true, hasPassword };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to check password status";
    return { success: false, error: message };
  }
}

export async function createPasswordForApprovedMember(email: string, password: string) {
  try {
    const auth = getAuth();
    const { createUserWithEmailAndPassword } = await import('firebase/auth');
    
    // Create the user account with email and password
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    return { success: true, user: result.user };
  } catch (error: any) {
    // If user already exists, try to sign them in
    if (error.code === 'auth/email-already-in-use') {
      return await signInWithPassword(email, password);
    }
    const message = error instanceof Error ? error.message : "Failed to create account";
    return { success: false, error: message };
  }
}
