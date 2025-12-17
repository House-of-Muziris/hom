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
import { db } from "./firebase";

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
    const docRef = await addDoc(collection(db, "requests"), {
      ...data,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    // Send welcome email via Resend
    const { sendWelcomeEmail } = await import("./resend-emails");
    await sendWelcomeEmail(data.email, data.name);

    return { success: true, id: docRef.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getRequestsByStatus(status?: "pending" | "approved" | "rejected") {
  try {
    let q;
    if (status) {
      q = query(
        collection(db, "requests"),
        where("status", "==", status),
        orderBy("createdAt", "desc")
      );
    } else {
      q = query(collection(db, "requests"), orderBy("createdAt", "desc"));
    }
    const snapshot = await getDocs(q);
    const requests: Request[] = [];
    snapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() } as Request);
    });
    return { success: true, data: requests };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function approveRequest(requestId: string, requestData: Request) {
  try {
    await updateDoc(doc(db, "requests", requestId), {
      status: "approved",
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function rejectRequest(requestId: string, reason?: string) {
  try {
    await updateDoc(doc(db, "requests", requestId), {
      status: "rejected",
      updatedAt: serverTimestamp(),
      rejectionReason: reason || "",
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Check if user has an approved request
export async function getApprovedRequest(email: string) {
  try {
    const q = query(
      collection(db, "requests"),
      where("email", "==", email),
      where("status", "==", "approved")
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return { success: true, data: null };
    }
    const doc = snapshot.docs[0];
    return { success: true, data: { id: doc.id, ...doc.data() } as Request };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Member profile functions
export async function getMember(email: string) {
  try {
    const memberRef = doc(db, "members", email);
    const memberDoc = await getDoc(memberRef);
    if (!memberDoc.exists()) {
      return { success: true, data: null };
    }
    return { success: true, data: { id: memberDoc.id, ...memberDoc.data() } as Member };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createMember(requestData: Request) {
  try {
    const memberRef = doc(db, "members", requestData.email);
    const memberData: Omit<Member, "id"> = {
      email: requestData.email,
      name: requestData.name,
      company: requestData.company,
      role: requestData.role,
      approvedAt: requestData.updatedAt || serverTimestamp(),
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    };
    await setDoc(memberRef, memberData);
    return { success: true, data: memberData };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateMemberLastLogin(email: string) {
  try {
    const memberRef = doc(db, "members", email);
    await updateDoc(memberRef, {
      lastLoginAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getUserCart(userId: string) {
  try {
    const q = query(collection(db, "carts"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return { success: true, data: { userId, items: [] } };
    }
    const cartDoc = snapshot.docs[0];
    return { success: true, data: { id: cartDoc.id, ...cartDoc.data() } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateUserCart(userId: string, items: CartItem[]) {
  try {
    const q = query(collection(db, "carts"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      await addDoc(collection(db, "carts"), {
        userId,
        items,
        updatedAt: serverTimestamp(),
      });
    } else {
      const cartDoc = snapshot.docs[0];
      await updateDoc(doc(db, "carts", cartDoc.id), {
        items,
        updatedAt: serverTimestamp(),
      });
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
