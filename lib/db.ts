import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { getDb } from "./firebase";

// Helper to get db instance
function db() {
  return getDb();
}

// Request interface - for membership applications
export interface Request {
  id?: string;
  name: string;
  email: string;
  company: string;
  role: string;
  status: "pending" | "approved" | "rejected";
  createdAt: any;
  updatedAt?: any;
  rejectionReason?: string;
}

// Member interface - created after first login
export interface Member {
  id?: string;
  email: string;
  name: string;
  company: string;
  role: string;
  approvedAt: any;
  createdAt: any;
  lastLoginAt?: any;
}

export interface CartItem {
  id: string;
  spiceId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface UserCart {
  userId: string;
  items: CartItem[];
  updatedAt: any;
}

export async function submitMembershipRequest(data: Omit<Request, "id" | "status" | "createdAt">) {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return { success: false, error: "Invalid email format" };
    }

    // Sanitize inputs
    const sanitizedData = {
      name: data.name.trim().slice(0, 100),
      email: data.email.toLowerCase().trim(),
      company: data.company.trim().slice(0, 200),
      role: data.role.trim().slice(0, 100),
    };

    const docRef = await addDoc(collection(db(), "requests"), {
      ...sanitizedData,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    // Send welcome email via Resend
    const { sendWelcomeEmail } = await import("./resend-emails");
    await sendWelcomeEmail(sanitizedData.email, sanitizedData.name);

    return { success: true, id: docRef.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit request";
    return { success: false, error: message };
  }
}

export async function getRequestsByStatus(status?: "pending" | "approved" | "rejected") {
  try {
    let q;
    if (status) {
      q = query(
        collection(db(), "requests"),
        where("status", "==", status),
        orderBy("createdAt", "desc")
      );
    } else {
      q = query(collection(db(), "requests"), orderBy("createdAt", "desc"));
    }
    const snapshot = await getDocs(q);
    const requests: Request[] = [];
    snapshot.forEach((docSnap) => {
      requests.push({ id: docSnap.id, ...docSnap.data() } as Request);
    });
    return { success: true, data: requests };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch requests";
    return { success: false, error: message };
  }
}

export async function approveRequest(requestId: string, _requestData: Request) {
  try {
    await updateDoc(doc(db(), "requests", requestId), {
      status: "approved",
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to approve request";
    return { success: false, error: message };
  }
}

export async function rejectRequest(requestId: string, reason?: string) {
  try {
    await updateDoc(doc(db(), "requests", requestId), {
      status: "rejected",
      updatedAt: serverTimestamp(),
      rejectionReason: reason?.trim().slice(0, 500) || "",
    });
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to reject request";
    return { success: false, error: message };
  }
}

// Check if user has an approved request
export async function getApprovedRequest(email: string) {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const q = query(
      collection(db(), "requests"),
      where("email", "==", normalizedEmail),
      where("status", "==", "approved")
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return { success: true, data: null };
    }
    const docSnap = snapshot.docs[0];
    return { success: true, data: { id: docSnap.id, ...docSnap.data() } as Request };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to check request";
    return { success: false, error: message };
  }
}

// Member profile functions
export async function getMember(email: string) {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const memberRef = doc(db(), "members", normalizedEmail);
    const memberDoc = await getDoc(memberRef);
    if (!memberDoc.exists()) {
      return { success: true, data: null };
    }
    return { success: true, data: { id: memberDoc.id, ...memberDoc.data() } as Member };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get member";
    return { success: false, error: message };
  }
}

export async function createMember(requestData: Request) {
  try {
    const normalizedEmail = requestData.email.toLowerCase().trim();
    const memberRef = doc(db(), "members", normalizedEmail);
    const memberData: Omit<Member, "id"> = {
      email: normalizedEmail,
      name: requestData.name.trim(),
      company: requestData.company.trim(),
      role: requestData.role.trim(),
      approvedAt: requestData.updatedAt || serverTimestamp(),
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    };
    await setDoc(memberRef, memberData);
    return { success: true, data: memberData };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create member";
    return { success: false, error: message };
  }
}

export async function updateMemberLastLogin(email: string) {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const memberRef = doc(db(), "members", normalizedEmail);
    await updateDoc(memberRef, {
      lastLoginAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update login";
    return { success: false, error: message };
  }
}

export async function getUserCart(userId: string) {
  try {
    const q = query(collection(db(), "carts"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return { success: true, data: { userId, items: [] } };
    }
    const cartDoc = snapshot.docs[0];
    return { success: true, data: { id: cartDoc.id, ...cartDoc.data() } };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get cart";
    return { success: false, error: message };
  }
}

export async function updateUserCart(userId: string, items: CartItem[]) {
  try {
    const q = query(collection(db(), "carts"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      await addDoc(collection(db(), "carts"), {
        userId,
        items,
        updatedAt: serverTimestamp(),
      });
    } else {
      const cartDoc = snapshot.docs[0];
      await updateDoc(doc(db(), "carts", cartDoc.id), {
        items,
        updatedAt: serverTimestamp(),
      });
    }
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update cart";
    return { success: false, error: message };
  }
}
