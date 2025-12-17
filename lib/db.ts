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
  memberType: "private" | "trade";
  name: string;
  email: string;
  phone?: string;
  message?: string;
  company?: string;
  role?: string;
  businessType?: "restaurant" | "hotel" | "corporate" | "retailer";
  monthlyVolume?: "<1kg" | "1-10kg" | "10+kg";
  status: "pending" | "approved" | "rejected";
  emailVerified?: boolean;
  verificationToken?: string;
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
  loyaltyPoints?: number;
}

// User Profile interface - stores user preferences and data
export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  loyaltyPoints: number;
  hasSetPassword: boolean;
  createdAt: any;
  updatedAt: any;
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

// Order interface - stores transaction history
export interface Order {
  id?: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  loyaltyPointsEarned: number;
  loyaltyPointsUsed: number;
  paymentStatus: "pending" | "confirmed" | "failed";
  paymentMethod: "upi";
  createdAt: any;
  updatedAt?: any;
}

// Payment interface - separate payment tracking
export interface Payment {
  id?: string;
  paymentId: string;
  orderId: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  amount: number;
  currency: string;
  paymentMethod: "upi" | "card" | "netbanking";
  status: "pending" | "success" | "failed";
  upiId?: string;
  transactionId?: string;
  createdAt: any;
  verifiedAt?: any;
}

// Activity Trail interface - user behavior and interaction tracking
export interface ActivityTrail {
  id?: string;
  userId: string;
  userEmail: string;
  action: "login" | "logout" | "order_placed" | "order_confirmed" | "payment_made" | "profile_updated" | "cart_updated" | "loyalty_earned" | "loyalty_redeemed" | "button_click" | "mouse_move" | "page_view" | "scroll" | "add_to_cart" | "remove_from_cart" | "checkout_started" | "modal_opened" | "modal_closed";
  description: string;
  metadata?: Record<string, any>;
  elementId?: string;
  elementClass?: string;
  pageUrl?: string;
  mouseX?: number;
  mouseY?: number;
  scrollDepth?: number;
  createdAt: any;
}

export async function submitMembershipRequest(data: Omit<Request, "id" | "status" | "createdAt">) {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return { success: false, error: "Invalid email format" };
    }

    // Sanitize inputs based on member type
    const sanitizedData: any = {
      memberType: data.memberType,
      name: data.name.trim().slice(0, 100),
      email: data.email.toLowerCase().trim(),
    };

    if (data.memberType === "private") {
      if (data.phone) sanitizedData.phone = data.phone.trim().slice(0, 20);
      if (data.message) sanitizedData.message = data.message.trim().slice(0, 500);
    } else {
      sanitizedData.company = data.company?.trim().slice(0, 200) || "";
      sanitizedData.role = data.role?.trim().slice(0, 100) || "";
      sanitizedData.businessType = data.businessType;
      sanitizedData.monthlyVolume = data.monthlyVolume;
    }

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
    // Generate verification token
    const verificationToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    await updateDoc(doc(db(), "requests", requestId), {
      status: "approved",
      verificationToken,
      emailVerified: false,
      updatedAt: serverTimestamp(),
    });
    return { success: true, verificationToken };
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

// Verify email with token
export async function verifyEmailWithToken(token: string) {
  try {
    console.log('=== VERIFYING EMAIL TOKEN ===');
    console.log('Token:', token);
    
    const q = query(
      collection(db(), "requests"),
      where("verificationToken", "==", token),
      where("status", "==", "approved")
    );
    const snapshot = await getDocs(q);
    
    console.log('Query results:', snapshot.size, 'documents found');
    
    if (snapshot.empty) {
      console.log('No matching documents found');
      return { success: false, error: "Invalid or expired verification link" };
    }
    
    const docSnap = snapshot.docs[0];
    const requestData = docSnap.data() as Request;
    console.log('Found request:', requestData.email);
    
    // Update to mark email as verified
    await updateDoc(doc(db(), "requests", docSnap.id), {
      emailVerified: true,
      updatedAt: serverTimestamp(),
    });
    
    console.log('Email verified successfully for:', requestData.email);
    return { success: true, data: { id: docSnap.id, ...requestData, emailVerified: true } as Request };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to verify email";
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
      company: requestData.company?.trim() || (requestData.memberType === 'private' ? 'Private Client' : ''),
      role: requestData.role?.trim() || (requestData.memberType === 'private' ? 'Individual' : ''),
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

// Get user loyalty points
export async function getUserLoyaltyPoints(userId: string) {
  try {
    const userDoc = await getDoc(doc(db(), "users", userId));
    if (!userDoc.exists()) {
      return { success: true, points: 0 };
    }
    return { success: true, points: userDoc.data().loyaltyPoints || 0 };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get loyalty points";
    return { success: false, error: message, points: 0 };
  }
}

// Add loyalty points (1 point per dollar spent)
export async function addLoyaltyPoints(userId: string, amountSpent: number) {
  try {
    const pointsToAdd = Math.floor(amountSpent);
    const userRef = doc(db(), "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const currentPoints = userDoc.data().loyaltyPoints || 0;
      await updateDoc(userRef, {
        loyaltyPoints: currentPoints + pointsToAdd,
      });
    } else {
      await setDoc(userRef, {
        loyaltyPoints: pointsToAdd,
      }, { merge: true });
    }
    
    return { success: true, pointsAdded: pointsToAdd };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add loyalty points";
    return { success: false, error: message };
  }
}

// Use loyalty points (10 points = $1 discount)
export async function useLoyaltyPoints(userId: string, pointsToUse: number) {
  try {
    const userRef = doc(db(), "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return { success: false, error: "User not found" };
    }
    
    const currentPoints = userDoc.data().loyaltyPoints || 0;
    if (currentPoints < pointsToUse) {
      return { success: false, error: "Insufficient points" };
    }
    
    await updateDoc(userRef, {
      loyaltyPoints: currentPoints - pointsToUse,
    });
    
    const discount = pointsToUse / 10; // 10 points = $1
    return { success: true, discount, remainingPoints: currentPoints - pointsToUse };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to use loyalty points";
    return { success: false, error: message };
  }
}

// Get or create user profile
export async function getUserProfile(userId: string, email: string) {
  try {
    const profileRef = doc(db(), "profiles", userId);
    const profileDoc = await getDoc(profileRef);
    
    if (profileDoc.exists()) {
      return { success: true, data: profileDoc.data() as UserProfile };
    }
    
    // Create new profile if doesn't exist
    const newProfile: UserProfile = {
      userId,
      email,
      displayName: email.split("@")[0],
      loyaltyPoints: 0,
      hasSetPassword: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(profileRef, newProfile);
    return { success: true, data: newProfile };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get profile";
    return { success: false, error: message };
  }
}

// Update user profile
export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  try {
    const profileRef = doc(db(), "profiles", userId);
    await updateDoc(profileRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update profile";
    return { success: false, error: message };
  }
}

// Update loyalty points in profile and user collections
export async function updateProfileLoyaltyPoints(userId: string, points: number) {
  try {
    const profileRef = doc(db(), "profiles", userId);
    const profileDoc = await getDoc(profileRef);
    
    if (profileDoc.exists()) {
      const currentPoints = profileDoc.data().loyaltyPoints || 0;
      await updateDoc(profileRef, {
        loyaltyPoints: currentPoints + points,
        updatedAt: serverTimestamp(),
      });
    }

    // Also save to user collection for redundancy
    const userRef = doc(db(), "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const currentUserPoints = userDoc.data().loyaltyPoints || 0;
      await updateDoc(userRef, {
        loyaltyPoints: currentUserPoints + points,
      });
    } else {
      await setDoc(userRef, {
        loyaltyPoints: points,
      }, { merge: true });
    }
    
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update loyalty points";
    return { success: false, error: message };
  }
}

// Mark password as set
export async function markPasswordSet(userId: string) {
  try {
    const profileRef = doc(db(), "profiles", userId);
    await updateDoc(profileRef, {
      hasSetPassword: true,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to mark password as set";
    return { success: false, error: message };
  }
}

// Create an order
export async function createOrder(orderData: Omit<Order, "id" | "createdAt">) {
  try {
    const docRef = await addDoc(collection(db(), "orders"), {
      ...orderData,
      createdAt: serverTimestamp(),
    });
    return { success: true, orderId: docRef.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create order";
    return { success: false, error: message };
  }
}

// Get user orders
export async function getUserOrders(userId: string) {
  try {
    const q = query(
      collection(db(), "orders"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    const orders: Order[] = [];
    snapshot.forEach((docSnap) => {
      orders.push({ id: docSnap.id, ...docSnap.data() } as Order);
    });
    return { success: true, data: orders };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get orders";
    return { success: false, error: message };
  }
}

// Clear user cart
export async function clearUserCart(userId: string) {
  try {
    const q = query(collection(db(), "carts"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const cartDoc = snapshot.docs[0];
      await updateDoc(doc(db(), "carts", cartDoc.id), {
        items: [],
        updatedAt: serverTimestamp(),
      });
    }
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to clear cart";
    return { success: false, error: message };
  }
}

// Update order payment status
export async function updateOrderPaymentStatus(orderId: string, status: "pending" | "confirmed" | "failed") {
  try {
    await updateDoc(doc(db(), "orders", orderId), {
      paymentStatus: status,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update order status";
    return { success: false, error: message };
  }
}

// ===== PAYMENT COLLECTION FUNCTIONS =====

// Create a payment record
export async function createPayment(paymentData: Omit<Payment, "id" | "createdAt">) {
  try {
    const docRef = await addDoc(collection(db(), "payments"), {
      ...paymentData,
      createdAt: serverTimestamp(),
    });
    return { success: true, paymentId: docRef.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create payment";
    return { success: false, error: message };
  }
}

// Get user payments
export async function getUserPayments(userId: string) {
  try {
    const q = query(
      collection(db(), "payments"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    const payments: Payment[] = [];
    snapshot.forEach((docSnap) => {
      payments.push({ id: docSnap.id, ...docSnap.data() } as Payment);
    });
    return { success: true, data: payments };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get payments";
    return { success: false, error: message };
  }
}

// Update payment status
export async function updatePaymentStatus(
  paymentId: string, 
  status: "pending" | "success" | "failed",
  transactionId?: string
) {
  try {
    const updates: any = {
      status,
      updatedAt: serverTimestamp(),
    };
    
    if (status === "success") {
      updates.verifiedAt = serverTimestamp();
      if (transactionId) {
        updates.transactionId = transactionId;
      }
    }
    
    await updateDoc(doc(db(), "payments", paymentId), updates);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update payment status";
    return { success: false, error: message };
  }
}

// ===== ACTIVITY TRAIL FUNCTIONS =====

// Log an activity
export async function logActivity(activityData: Omit<ActivityTrail, "id" | "createdAt">) {
  try {
    const docRef = await addDoc(collection(db(), "trail"), {
      ...activityData,
      createdAt: serverTimestamp(),
    });
    return { success: true, activityId: docRef.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to log activity";
    return { success: false, error: message };
  }
}

// Get user activity trail
export async function getUserActivityTrail(userId: string, limit: number = 50) {
  try {
    const q = query(
      collection(db(), "trail"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    const activities: ActivityTrail[] = [];
    let count = 0;
    snapshot.forEach((docSnap) => {
      if (count < limit) {
        activities.push({ id: docSnap.id, ...docSnap.data() } as ActivityTrail);
        count++;
      }
    });
    return { success: true, data: activities };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get activity trail";
    return { success: false, error: message };
  }
}

// Redeem loyalty points (subtract points)
export async function redeemLoyaltyPoints(userId: string, pointsToRedeem: number) {
  try {
    const profileRef = doc(db(), "profiles", userId);
    const profileDoc = await getDoc(profileRef);
    
    if (!profileDoc.exists()) {
      return { success: false, error: "Profile not found" };
    }
    
    const currentPoints = profileDoc.data().loyaltyPoints || 0;
    
    if (currentPoints < pointsToRedeem) {
      return { success: false, error: "Insufficient loyalty points" };
    }
    
    // Update profile
    await updateDoc(profileRef, {
      loyaltyPoints: currentPoints - pointsToRedeem,
      updatedAt: serverTimestamp(),
    });

    // Update user collection
    const userRef = doc(db(), "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const currentUserPoints = userDoc.data().loyaltyPoints || 0;
      await updateDoc(userRef, {
        loyaltyPoints: currentUserPoints - pointsToRedeem,
      });
    }
    
    const discount = pointsToRedeem / 10; // 10 points = $1
    return { success: true, discount, remainingPoints: currentPoints - pointsToRedeem };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to redeem loyalty points";
    return { success: false, error: message };
  }
}
