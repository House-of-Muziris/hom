"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trackPageView, trackAddToCart, trackCheckout } from "@/lib/analytics";
import { motion, AnimatePresence } from "framer-motion";
import { serif, sans } from "@/lib/fonts";
import { getCurrentUser, signOut } from "@/lib/auth";
import { getUserCart, updateUserCart, type CartItem, getUserProfile, updateUserProfile, updateProfileLoyaltyPoints, createOrder, clearUserCart, createPayment, logActivity, getUserOrders, redeemLoyaltyPoints } from "@/lib/db";
import { collection, getDocs } from "firebase/firestore";
import { getDb } from "@/lib/firebase";

interface Spice {
  id: string;
  name: string;
  description: string;
  origin: string;
  price: number;
  weight: string;
  image?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [spices, setSpices] = useState<Spice[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [editedName, setEditedName] = useState("");
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [userId, setUserId] = useState("");
  const [pastOrders, setPastOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);
  const [notificationModal, setNotificationModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
  }>({ show: false, title: "", message: "", type: "info" });

  useEffect(() => {
    trackPageView("Member Dashboard");
    checkAuthAndLoadData();

    // Track user interactions
    const handleClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const user = await getCurrentUser();
      if (user) {
        await logActivity({
          userId: user.uid,
          userEmail: user.email || "",
          action: "button_click",
          description: `Clicked ${target.tagName}`,
          metadata: { tagName: target.tagName, textContent: target.textContent?.substring(0, 50) },
          elementId: target.id || undefined,
          elementClass: target.className || undefined,
          pageUrl: window.location.pathname,
          mouseX: e.clientX,
          mouseY: e.clientY,
        });
      }
    };

    const handleMouseMove = async (e: MouseEvent) => {
      // Sample mouse movements (every 5 seconds to reduce data)
      if (Math.random() < 0.01) {
        const user = await getCurrentUser();
        if (user) {
          await logActivity({
            userId: user.uid,
            userEmail: user.email || "",
            action: "mouse_move",
            description: "Mouse movement tracked",
            mouseX: e.clientX,
            mouseY: e.clientY,
            pageUrl: window.location.pathname,
          });
        }
      }
    };

    const handleScroll = async () => {
      const scrollDepth = Math.round((window.scrollY / document.documentElement.scrollHeight) * 100);
      if (scrollDepth % 25 === 0) { // Log at 25%, 50%, 75%, 100%
        const user = await getCurrentUser();
        if (user) {
          await logActivity({
            userId: user.uid,
            userEmail: user.email || "",
            action: "scroll",
            description: `Scrolled to ${scrollDepth}%`,
            scrollDepth,
            pageUrl: window.location.pathname,
          });
        }
      }
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  async function checkAuthAndLoadData() {
    const user = await getCurrentUser();
    
    if (!user) {
      router.push("/login");
      return;
    }

    setUserId(user.uid);
    setUserEmail(user.email || "");

    // Load user profile
    const profileResult = await getUserProfile(user.uid, user.email || "");
    if (profileResult.success && profileResult.data) {
      setUserName(profileResult.data.displayName);
      setLoyaltyPoints(profileResult.data.loyaltyPoints);
    } else {
      setUserName(user.email?.split("@")[0] || "Member");
    }

    // Log login activity
    await logActivity({
      userId: user.uid,
      userEmail: user.email || "",
      action: "login",
      description: "User logged into dashboard",
      metadata: { timestamp: new Date().toISOString() },
    });

    // Load spices catalog
    await loadSpices();
    
    // Load user cart
    const userCart = await getUserCart(user.uid);
    if (userCart.success && userCart.data) {
      setCart(userCart.data.items || []);
    }
    
    setLoading(false);
  }

  async function loadSpices() {
    try {
      const spicesRef = collection(getDb(), "spices");
      const snapshot = await getDocs(spicesRef);
      const spicesList = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as Spice[];
      setSpices(spicesList.length > 0 ? spicesList : SAMPLE_SPICES);
    } catch {
      // If no spices in database, use sample data
      setSpices(SAMPLE_SPICES);
    }
  }

  async function addToCart(spice: Spice) {
    const user = await getCurrentUser();
    if (!user) return;

    const existingItem = cart.find(item => item.spiceId === spice.id);
    
    let newCart: CartItem[];
    if (existingItem) {
      newCart = cart.map(item =>
        item.spiceId === spice.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [
        ...cart,
        {
          id: `${user.uid}_${spice.id}_${Date.now()}`,
          spiceId: spice.id,
          name: spice.name,
          price: spice.price,
          quantity: 1,
        }
      ];
      trackAddToCart(spice.id, spice.name, spice.price);
    }

    setCart(newCart);
    await updateUserCart(user.uid, newCart);
  }

  async function updateQuantity(spiceId: string, quantity: number) {
    const user = await getCurrentUser();
    if (!user) return;

    let newCart: CartItem[];
    if (quantity === 0) {
      newCart = cart.filter(item => item.spiceId !== spiceId);
    } else {
      newCart = cart.map(item =>
        item.spiceId === spiceId ? { ...item, quantity } : item
      );
    }

    setCart(newCart);
    await updateUserCart(user.uid, newCart);
  }

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  async function handleCheckout() {
    const user = await getCurrentUser();
    if (!user || cart.length === 0) return;

    // Generate order number
    const orderNumber = `HOM${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    // Track checkout event
    trackCheckout(cartTotal, cartCount);
    
    // Reset loyalty redemption
    setPointsToUse(0);
    setLoyaltyDiscount(0);
    
    // Log checkout started
    await logActivity({
      userId: user.uid,
      userEmail: user.email || "",
      action: "checkout_started",
      description: "User started checkout process",
      metadata: { cartTotal, cartCount },
      pageUrl: window.location.pathname,
    });
    
    // Show checkout modal with Paytm QR
    setShowCheckout(true);
    
    console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                     ORDER PLACED                                  ║
╠═══════════════════════════════════════════════════════════════════╣
║ Order #: ${orderNumber}                                         ║
║ Customer: ${userName} (${userEmail})                            ║
║ Items: ${cartCount}                                              ║
║ Total: ₹${(cartTotal * 83).toFixed(2)}                          ║
║ Paytm UPI: frank.ms@ptaxis                                      ║
╚═══════════════════════════════════════════════════════════════════╝
    `);
  }

  function handleApplyPoints(points: number) {
    const maxPoints = Math.min(loyaltyPoints, Math.floor(cartTotal * 10)); // Can't use more than order value
    const actualPoints = Math.min(points, maxPoints);
    setPointsToUse(actualPoints);
    setLoyaltyDiscount(actualPoints / 10); // 10 points = $1
  }

  async function handlePaymentConfirmed() {
    const user = await getCurrentUser();
    if (!user || cart.length === 0) return;

    try {
      // Generate order number and payment ID
      const orderNumber = `HOM${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const paymentId = `PAY${Date.now()}${Math.floor(Math.random() * 10000)}`;
      
      // Calculate final total with loyalty discount
      const finalTotal = cartTotal - loyaltyDiscount;
      
      // Calculate loyalty points (1 point per dollar on final amount)
      const pointsEarned = Math.floor(finalTotal);

      // Redeem loyalty points if used
      if (pointsToUse > 0) {
        const redeemResult = await redeemLoyaltyPoints(user.uid, pointsToUse);
        if (redeemResult.success) {
          setLoyaltyPoints(redeemResult.remainingPoints || 0);
          
          // Log redemption
          await logActivity({
            userId: user.uid,
            userEmail: userEmail,
            action: "loyalty_redeemed",
            description: `Redeemed ${pointsToUse} points for $${loyaltyDiscount.toFixed(2)} discount`,
            metadata: {
              pointsRedeemed: pointsToUse,
              discountAmount: loyaltyDiscount,
              orderNumber,
            },
          });
        }
      }

      // 1. Save order to database
      const orderResult = await createOrder({
        orderNumber,
        userId: user.uid,
        userEmail: userEmail,
        userName: userName,
        items: cart,
        subtotal: cartTotal,
        discount: loyaltyDiscount,
        total: finalTotal,
        loyaltyPointsEarned: pointsEarned,
        loyaltyPointsUsed: pointsToUse,
        paymentStatus: "pending",
        paymentMethod: "upi",
      });

      // 2. Create payment record
      await createPayment({
        paymentId,
        orderId: orderResult.orderId || "",
        orderNumber,
        userId: user.uid,
        userEmail: userEmail,
        amount: finalTotal,
        currency: "USD",
        paymentMethod: "upi",
        status: "pending",
        upiId: "frank.ms@ptaxis",
      });

      // 3. Update loyalty points in profile
      await updateProfileLoyaltyPoints(user.uid, pointsEarned);
      const newLoyaltyPoints = loyaltyPoints + pointsEarned;
      setLoyaltyPoints(newLoyaltyPoints);

      // 4. Log activity to trail
      await logActivity({
        userId: user.uid,
        userEmail: userEmail,
        action: "order_placed",
        description: `Order ${orderNumber} placed for $${cartTotal.toFixed(2)}`,
        metadata: {
          orderNumber,
          total: cartTotal,
          itemCount: cart.length,
          loyaltyPointsEarned: pointsEarned,
        },
      });

      // 5. Log loyalty points earned
      await logActivity({
        userId: user.uid,
        userEmail: userEmail,
        action: "loyalty_earned",
        description: `Earned ${pointsEarned} loyalty points from order ${orderNumber}`,
        metadata: {
          pointsEarned,
          orderNumber,
          newTotal: newLoyaltyPoints,
        },
      });

      // 6. Send order confirmation email (server-side)
      try {
        const { sendOrderEmail } = await import("@/app/actions/orders");
        await sendOrderEmail(userEmail, userName, orderNumber, cart, finalTotal, pointsEarned);
      } catch (emailError) {
        console.error("Email failed but order was saved:", emailError);
      }

      // 7. Clear cart from database and state
      await clearUserCart(user.uid);
      setCart([]);
      
      // 8. Log cart cleared
      await logActivity({
        userId: user.uid,
        userEmail: userEmail,
        action: "cart_updated",
        description: "Cart cleared after order placement",
        metadata: { orderNumber },
      });

      setShowCheckout(false);
      setShowCart(false);

      // Show success message
      setNotificationModal({
        show: true,
        title: "Order Confirmed!",
        message: `Order ${orderNumber} confirmed! You earned ${pointsEarned} loyalty points. Check your email for order details.`,
        type: "success"
      });
    } catch (error) {
      console.error("Failed to process order:", error);
      setNotificationModal({
        show: true,
        title: "Order Failed",
        message: "Failed to process order. Please try again or contact support.",
        type: "error"
      });
    }
  }

  function generatePaytmQR() {
    // UPI payment link format: upi://pay?pa=VPA&pn=NAME&am=AMOUNT&cu=CURRENCY&tn=NOTE
    const upiId = 'frank.ms@ptaxis';
    const amount = (cartTotal * 83).toFixed(2); // Convert USD to INR (approx)
    const merchantName = 'House of Muziris';
    const transactionNote = `Order Payment - ${cartCount} items`;
    
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
    
    // Generate QR code URL using QR Server API
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUrl)}`;
    
    return qrCodeUrl;
  }

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0EFEA] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 rounded-full border-2 border-[#C5A059] border-t-transparent"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0EFEA]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#E5E3DE]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className={`${serif.className} text-2xl text-[#1A1A1A]`}>
              House of Muziris
            </h1>
            <p className={`${sans.className} text-xs text-[#6B6B6B] mt-1`}>
              Welcome, {userName}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#F0EFEA] border border-[#C5A059]">
              <i className="fas fa-coins text-[#C5A059]"></i>
              <span className={`${sans.className} text-sm font-semibold text-[#1A1A1A]`}>
                {loyaltyPoints}
              </span>
              <span className={`${sans.className} text-xs text-[#6B6B6B]`}>pts</span>
            </div>
            
            <button
              onClick={() => setShowCart(!showCart)}
              className={`${sans.className} relative px-6 py-2 bg-[#1A1A1A] text-[#F0EFEA] text-sm tracking-wider uppercase hover:bg-[#C5A059] transition-colors`}
            >
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#C5A059] text-white text-xs rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            
            <button
              onClick={async () => { 
                setShowProfile(true); 
                setEditedName(userName);
                setLoadingOrders(true);
                const ordersResult = await getUserOrders(userId);
                if (ordersResult.success && ordersResult.data) {
                  setPastOrders(ordersResult.data);
                }
                setLoadingOrders(false);
              }}
              className={`${sans.className} px-6 py-2 border border-[#C5A059] text-[#C5A059] text-sm tracking-wider uppercase hover:bg-[#C5A059] hover:text-white transition-colors`}
            >
              Profile
            </button>
            
            <button
              onClick={handleSignOut}
              className={`${sans.className} px-6 py-2 border border-[#1A1A1A] text-[#1A1A1A] text-sm tracking-wider uppercase hover:bg-[#1A1A1A] hover:text-[#F0EFEA] transition-colors`}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">

        {/* Spice Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {spices.map((spice, index) => (
            <motion.div
              key={spice.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-[#E5E3DE] overflow-hidden group"
            >
              <div className="aspect-square bg-linear-to-br from-[#C5A059]/20 to-[#E5E3DE] flex items-center justify-center overflow-hidden">
                {spice.image ? (
                  <img src={spice.image} alt={spice.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className={`${serif.className} text-6xl text-[#C5A059]/40`}>
                    {spice.name[0]}
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <h3 className={`${serif.className} text-2xl text-[#1A1A1A] mb-2`}>
                  {spice.name}
                </h3>
                <p className={`${sans.className} text-xs text-[#C5A059] uppercase tracking-wider mb-3`}>
                  {spice.origin}
                </p>
                <p className={`${sans.className} text-sm text-[#6B6B6B] mb-4 line-clamp-3`}>
                  {spice.description}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className={`${sans.className} text-xs text-[#6B6B6B]`}>
                    {spice.weight}
                  </span>
                  <span className={`${serif.className} text-xl text-[#1A1A1A]`}>
                    ${spice.price.toFixed(2)}
                  </span>
                </div>
                
                <button
                  onClick={() => addToCart(spice)}
                  className={`${sans.className} w-full py-3 bg-[#1A1A1A] text-[#F0EFEA] text-sm tracking-wider uppercase hover:bg-[#C5A059] transition-colors`}
                >
                  Add to Cart
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCart(false)}
              className="fixed inset-0 bg-black/30 z-40"
            />
            
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="p-6 border-b border-[#E5E3DE] flex items-center justify-between">
                <h3 className={`${serif.className} text-2xl text-[#1A1A1A]`}>
                  Your Cart
                </h3>
                <button
                  onClick={() => setShowCart(false)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-[#F0EFEA] rounded-full transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M6 18L18 6M6 6l12 12" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <p className={`${sans.className} text-[#6B6B6B]`}>
                      Your cart is empty
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cart.map((item) => (
                      <div key={item.spiceId} className="flex gap-4 pb-6 border-b border-[#E5E3DE]">
                        <div className="flex-1">
                          <h4 className={`${serif.className} text-lg text-[#1A1A1A] mb-1`}>
                            {item.name}
                          </h4>
                          <p className={`${sans.className} text-sm text-[#6B6B6B]`}>
                            ${item.price.toFixed(2)} each
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.spiceId, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center border border-[#E5E3DE] hover:bg-[#F0EFEA] transition-colors"
                          >
                            -
                          </button>
                          <span className={`${sans.className} w-8 text-center`}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.spiceId, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center border border-[#E5E3DE] hover:bg-[#F0EFEA] transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-[#E5E3DE]">
                  <div className="flex items-center justify-between mb-6">
                    <span className={`${sans.className} text-lg text-[#6B6B6B]`}>
                      Total
                    </span>
                    <span className={`${serif.className} text-2xl text-[#1A1A1A]`}>
                      ${cartTotal.toFixed(2)}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleCheckout}
                    className={`${sans.className} w-full py-4 bg-[#1A1A1A] text-[#F0EFEA] text-sm tracking-wider uppercase hover:bg-[#C5A059] transition-colors`}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckout && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCheckout(false)}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white max-w-4xl w-full p-8 border border-[#E5E3DE] max-h-[85vh] overflow-y-auto"
              >
                <div>
                  <h3 className={`${serif.className} text-3xl text-[#1A1A1A] mb-6 text-center`}>
                    Complete Payment
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Left side - Loyalty & QR Code */}
                    <div className="flex flex-col">
                      {/* Loyalty Points Redemption */}
                      {loyaltyPoints > 0 && (
                        <div className="bg-[#C5A059]/10 border border-[#C5A059] p-4 mb-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <i className="fas fa-coins text-[#C5A059]"></i>
                                <span className={`${sans.className} text-sm font-semibold text-[#1A1A1A]`}>
                                  Available: {loyaltyPoints} pts
                                </span>
                              </div>
                              <span className={`${sans.className} text-xs text-[#6B6B6B]`}>
                                = ${(loyaltyPoints / 10).toFixed(2)}
                              </span>
                            </div>
                            
                            <div className="flex gap-2 mb-2">
                              <input
                                type="number"
                                min="0"
                                max={Math.min(loyaltyPoints, Math.floor(cartTotal * 10))}
                                step="10"
                                value={pointsToUse}
                                onChange={(e) => handleApplyPoints(Number(e.target.value))}
                                className={`${sans.className} flex-1 px-3 py-2 border border-[#E5E3DE] bg-white text-sm`}
                                placeholder="Points to use"
                              />
                              <button
                                onClick={() => handleApplyPoints(Math.min(loyaltyPoints, Math.floor(cartTotal * 10)))}
                                className={`${sans.className} px-4 py-2 bg-[#C5A059] text-white text-xs tracking-wider uppercase hover:bg-[#1A1A1A] transition-colors`}
                              >
                                Use Max
                              </button>
                            </div>
                            
                            {loyaltyDiscount > 0 && (
                              <p className={`${sans.className} text-xs text-[#C5A059] font-semibold`}>
                                Discount: -${loyaltyDiscount.toFixed(2)}
                              </p>
                            )}
                          </div>
                        )}
                      
                      {/* QR Code Section */}
                      <div className="flex flex-col items-center justify-center">
                        <p className={`${sans.className} text-sm text-[#6B6B6B] mb-4`}>
                          Scan QR Code to Pay via Paytm/UPI
                        </p>
                        
                        <div className="bg-white p-4 border-2 border-[#C5A059] mb-4">
                          <img 
                            src={generatePaytmQR()} 
                            alt="Paytm QR Code"
                            className="w-48 h-48"
                            onError={(e) => {
                              console.error('QR code failed to load');
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f0f0f0" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23666" font-size="14"%3EQR Code Error%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        </div>
                        
                        <div className="w-full bg-[#F0EFEA] p-4">
                          <p className={`${sans.className} text-xs text-[#6B6B6B] mb-2 text-center`}>
                            UPI ID
                          </p>
                          <p className={`${sans.className} text-sm text-[#1A1A1A] font-mono font-semibold text-center`}>
                            frank.ms@ptaxis
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right side - Order details and actions */}
                    <div className="flex flex-col justify-between">
                      <div>
                        <div className="bg-[#F0EFEA] p-6 mb-6">
                          <p className={`${sans.className} text-sm text-[#6B6B6B] mb-2`}>
                            {loyaltyDiscount > 0 ? 'Subtotal' : 'Total Amount'}
                          </p>
                          {loyaltyDiscount > 0 ? (
                            <>
                              <p className={`${sans.className} text-lg text-[#999] line-through mb-1`}>
                                ${cartTotal.toFixed(2)}
                              </p>
                              <p className={`${serif.className} text-4xl text-[#C5A059] mb-1`}>
                                ₹{((cartTotal - loyaltyDiscount) * 83).toFixed(2)}
                              </p>
                              <p className={`${sans.className} text-xs text-[#999]`}>
                                (${(cartTotal - loyaltyDiscount).toFixed(2)} USD)
                              </p>
                              <p className={`${sans.className} text-xs text-[#C5A059] mt-2`}>
                                Saved ${loyaltyDiscount.toFixed(2)} with {pointsToUse} points
                              </p>
                            </>
                          ) : (
                            <>
                              <p className={`${serif.className} text-4xl text-[#1A1A1A] mb-1`}>
                                ₹{(cartTotal * 83).toFixed(2)}
                              </p>
                              <p className={`${sans.className} text-xs text-[#999]`}>
                                (${cartTotal.toFixed(2)} USD)
                              </p>
                            </>
                          )}
                        </div>

                        <div className="bg-white border border-[#E5E3DE] p-4 mb-6">
                          <p className={`${sans.className} text-xs text-[#6B6B6B] mb-3`}>
                            Order Summary
                          </p>
                          <div className="space-y-2">
                            {cart.slice(0, 3).map((item) => (
                              <div key={item.spiceId} className="flex justify-between text-sm">
                                <span className={`${sans.className} text-[#1A1A1A]`}>
                                  {item.name} × {item.quantity}
                                </span>
                                <span className={`${sans.className} text-[#6B6B6B]`}>
                                  ${(item.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            ))}
                            {cart.length > 3 && (
                              <p className={`${sans.className} text-xs text-[#999] italic`}>
                                +{cart.length - 3} more items
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="space-y-3 mb-4">
                          <button
                            onClick={handlePaymentConfirmed}
                            className={`${sans.className} w-full py-4 bg-[#C5A059] text-white text-sm tracking-wider uppercase hover:bg-[#1A1A1A] transition-colors`}
                          >
                            I've Paid
                          </button>
                          
                          <button
                            onClick={() => setShowCheckout(false)}
                            className={`${sans.className} w-full py-3 border border-[#E5E3DE] text-[#1A1A1A] text-sm tracking-wider uppercase hover:bg-[#F0EFEA] transition-colors`}
                          >
                            Cancel
                          </button>
                        </div>

                        <div className="pt-4 border-t border-[#E5E3DE]">
                          <p className={`${sans.className} text-xs text-[#999] leading-relaxed`}>
                            After payment, please allow 2-3 minutes for verification. You will receive an order confirmation email once payment is confirmed.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowProfile(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-[#E5E3DE] p-8 md:p-12 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h3 className={`${serif.className} text-3xl text-[#1A1A1A] mb-6`}>
                Profile Settings
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column - Profile Info */}
                <div>
                  <div className="space-y-6">
                    <div>
                      <label className={`${sans.className} text-xs tracking-wider uppercase text-[#6B6B6B] mb-2 block`}>
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className={`${sans.className} w-full px-4 py-3 border border-[#E5E3DE] bg-transparent outline-none focus:border-[#C5A059] transition-colors text-sm`}
                      />
                    </div>

                    <div>
                      <label className={`${sans.className} text-xs tracking-wider uppercase text-[#6B6B6B] mb-2 block`}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={userEmail}
                        disabled
                        className={`${sans.className} w-full px-4 py-3 border border-[#E5E3DE] bg-[#F0EFEA] text-[#6B6B6B] cursor-not-allowed text-sm`}
                      />
                      <p className={`${sans.className} text-xs text-[#999] mt-1`}>
                        Email cannot be changed
                      </p>
                    </div>

                    <div>
                      <label className={`${sans.className} text-xs tracking-wider uppercase text-[#6B6B6B] mb-2 block`}>
                        Loyalty Points
                      </label>
                      <div className="flex items-center gap-3 px-4 py-3 bg-[#F0EFEA] border border-[#C5A059]">
                        <i className="fas fa-coins text-[#C5A059] text-xl"></i>
                        <span className={`${sans.className} text-2xl font-semibold text-[#1A1A1A]`}>
                          {loyaltyPoints}
                        </span>
                        <span className={`${sans.className} text-xs text-[#6B6B6B]`}>
                          points
                        </span>
                      </div>
                      <p className={`${sans.className} text-xs text-[#999] mt-1`}>
                        10 points = $1 discount
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={async () => {
                        if (!userId || !editedName.trim()) {
                          setNotificationModal({
                            show: true,
                            title: "Invalid Input",
                            message: "Please enter a valid display name.",
                            type: "error"
                          });
                          return;
                        }
                        
                        try {
                          const result = await updateUserProfile(userId, { displayName: editedName.trim() });
                          if (result.success) {
                            setUserName(editedName.trim());
                            
                            // Log profile update activity
                            await logActivity({
                              userId,
                              userEmail,
                              action: "profile_updated",
                              description: `Display name updated to "${editedName.trim()}"`,
                              metadata: { 
                                oldName: userName,
                                newName: editedName.trim() 
                              },
                            });
                            
                            setShowProfile(false);
                            setNotificationModal({
                              show: true,
                              title: "Profile Updated",
                              message: "Your profile has been updated successfully.",
                              type: "success"
                            });
                          } else {
                            setNotificationModal({
                              show: true,
                              title: "Update Failed",
                              message: result.error || "Failed to update profile. Please try again.",
                              type: "error"
                            });
                          }
                        } catch (error) {
                          console.error("Profile update error:", error);
                          setNotificationModal({
                            show: true,
                            title: "Update Failed",
                            message: "An error occurred while updating your profile.",
                            type: "error"
                          });
                        }
                      }}
                      className={`${sans.className} flex-1 py-3 bg-[#C5A059] text-white text-sm tracking-wider uppercase hover:bg-[#1A1A1A] transition-colors`}
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setShowProfile(false)}
                      className={`${sans.className} flex-1 py-3 border border-[#E5E3DE] text-[#6B6B6B] text-sm tracking-wider uppercase hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-colors`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                {/* Right Column - Past Purchases */}
                <div>
                  <h4 className={`${serif.className} text-xl text-[#1A1A1A] mb-4`}>
                    Past Purchases
                  </h4>
                  
                  {loadingOrders ? (
                    <div className="flex items-center justify-center py-12">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 rounded-full border-2 border-[#C5A059] border-t-transparent"
                      />
                    </div>
                  ) : pastOrders.length === 0 ? (
                    <div className="text-center py-12 bg-[#F0EFEA] border border-[#E5E3DE]">
                      <p className={`${sans.className} text-sm text-[#6B6B6B]`}>
                        No orders yet
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                      {pastOrders.map((order) => (
                        <div key={order.id} className="bg-[#F0EFEA] border border-[#E5E3DE] p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className={`${sans.className} text-xs text-[#999] uppercase`}>
                                Order Number
                              </p>
                              <p className={`${sans.className} text-sm font-mono text-[#1A1A1A]`}>
                                {order.orderNumber}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`${serif.className} text-lg text-[#C5A059]`}>
                                ${order.total.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-1 mb-3">
                            {order.items.slice(0, 2).map((item: any, idx: number) => (
                              <p key={idx} className={`${sans.className} text-xs text-[#6B6B6B]`}>
                                {item.name} × {item.quantity}
                              </p>
                            ))}
                            {order.items.length > 2 && (
                              <p className={`${sans.className} text-xs text-[#999] italic`}>
                                +{order.items.length - 2} more items
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between pt-3 border-t border-[#E5E3DE]">
                            <span className={`${sans.className} text-xs text-[#999]`}>
                              {order.createdAt?.toDate ? new Date(order.createdAt.toDate()).toLocaleDateString() : 'Recent'}
                            </span>
                            <span className={`${sans.className} text-xs text-[#C5A059]`}>
                              +{order.loyaltyPointsEarned} pts
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Modal */}
      <AnimatePresence>
        {notificationModal.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4"
            onClick={() => setNotificationModal({ ...notificationModal, show: false })}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-[#E5E3DE] p-8 max-w-md w-full"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                  notificationModal.type === "success" ? "bg-green-100" :
                  notificationModal.type === "error" ? "bg-red-100" : "bg-blue-100"
                }`}>
                  {notificationModal.type === "success" && (
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {notificationModal.type === "error" && (
                    <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  {notificationModal.type === "info" && (
                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`${serif.className} text-xl text-[#1A1A1A] mb-2`}>
                    {notificationModal.title}
                  </h3>
                  <p className={`${sans.className} text-sm text-[#6B6B6B] leading-relaxed`}>
                    {notificationModal.message}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setNotificationModal({ ...notificationModal, show: false })}
                className={`${sans.className} w-full py-3 bg-[#1A1A1A] text-[#F0EFEA] text-sm tracking-wider uppercase hover:bg-[#C5A059] transition-colors`}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sample spices data if database is empty
const SAMPLE_SPICES: Spice[] = [
  {
    id: "saffron-kashmiri",
    name: "Kashmiri Saffron",
    description: "The world's most precious spice, hand-harvested from Crocus sativus flowers in the Kashmir Valley. Deep crimson threads with an intensely aromatic, slightly sweet flavor.",
    origin: "Kashmir, India",
    price: 89.99,
    weight: "1g",
  },
  {
    id: "vanilla-tahitian",
    name: "Tahitian Vanilla",
    description: "Plump, moist pods with floral and fruity notes. Unlike Madagascar vanilla, Tahitian beans have a delicate, cherry-chocolate undertone perfect for desserts and beverages.",
    origin: "Tahiti, French Polynesia",
    price: 45.00,
    weight: "2 pods",
  },
  {
    id: "cardamom-guatemalan",
    name: "Guatemalan Cardamom",
    description: "Green cardamom pods with intense eucalyptus and camphor notes. Hand-picked at peak maturity from high-altitude plantations in the Guatemalan highlands.",
    origin: "Guatemala",
    price: 34.99,
    weight: "50g",
  },
  {
    id: "peppercorns-tellicherry",
    name: "Tellicherry Black Pepper",
    description: "Extra-bold peppercorns left to ripen longer on the vine. Complex flavor profile with citrus notes and deep, warm heat. The gold standard of black pepper.",
    origin: "Kerala, India",
    price: 28.50,
    weight: "100g",
  },
  {
    id: "cinnamon-ceylon",
    name: "Ceylon Cinnamon",
    description: "True cinnamon with delicate, sweet flavor and subtle citrus notes. Hand-rolled quills from inner bark of Cinnamomum verum trees. Superior to common cassia.",
    origin: "Sri Lanka",
    price: 22.00,
    weight: "50g",
  },
  {
    id: "sumac-wild",
    name: "Wild Sumac",
    description: "Tangy, lemony berries harvested from wild sumac shrubs. Ground to a coarse powder with deep burgundy color. Essential in Middle Eastern cuisine.",
    origin: "Anatolia, Turkey",
    price: 18.99,
    weight: "75g",
  },
];
