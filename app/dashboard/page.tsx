"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trackPageView, trackAddToCart, trackCheckout } from "@/lib/analytics";
import { motion, AnimatePresence } from "framer-motion";
import { serif, sans } from "@/lib/fonts";
import { getCurrentUser, signOut } from "@/lib/auth";
import { getUserCart, updateUserCart, type CartItem } from "@/lib/db";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    trackPageView("Member Dashboard");
    checkAuthAndLoadData();
  }, []);

  async function checkAuthAndLoadData() {
    const user = await getCurrentUser();
    
    if (!user) {
      router.push("/login");
      return;
    }

    setUserName(user.email?.split("@")[0] || "Member");
    setUserEmail(user.email || "");

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
      const spicesRef = collection(db, "spices");
      const snapshot = await getDocs(spicesRef);
      const spicesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Spice[];
      setSpices(spicesList);
    } catch (error) {
      console.error("Error loading spices:", error);
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
    
    // Show checkout modal
    setShowCheckout(true);
    
    // TODO: Implement payment processing (Stripe, PayPal, etc.)
    // For now, simulate order placement
    console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                     ORDER PLACED                                  ║
╠═══════════════════════════════════════════════════════════════════╣
║ Order #: ${orderNumber}                                         ║
║ Customer: ${userName} (${userEmail})                            ║
║ Items: ${cartCount}                                              ║
║ Total: $${cartTotal.toFixed(2)}                                  ║
║                                                                   ║
║ 📧 Order confirmation email would be sent via:                   ║
║    sendOrderConfirmation() from lib/email-service.ts            ║
║                                                                   ║
║ 💳 NEXT STEP: Integrate payment processor:                       ║
║    • Stripe (recommended): https://stripe.com                    ║
║    • PayPal                                                       ║
║    • Square                                                       ║
║                                                                   ║
║ The themed order confirmation email matches your design!         ║
╚═══════════════════════════════════════════════════════════════════╝
    `);
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
              House of M
            </h1>
            <p className={`${sans.className} text-xs text-[#6B6B6B] mt-1`}>
              Welcome, {userName}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h2 className={`${serif.className} text-4xl md:text-5xl text-[#1A1A1A] mb-4`}>
            Premium Spice Collection
          </h2>
          <p className={`${sans.className} text-lg text-[#6B6B6B] max-w-2xl`}>
            Curated rare spices sourced directly from master growers around the world
          </p>
        </motion.div>

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
              <div className="aspect-square bg-gradient-to-br from-[#C5A059]/20 to-[#E5E3DE] flex items-center justify-center overflow-hidden">
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
                className="bg-white max-w-lg w-full p-12 border border-[#E5E3DE]"
              >
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 15, delay: 0.1 }}
                    className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#C5A059]/10 flex items-center justify-center"
                  >
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12l5 5L19 7" stroke="#C5A059" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </motion.div>

                  <h3 className={`${serif.className} text-3xl text-[#1A1A1A] mb-4`}>
                    Order Placed
                  </h3>
                  
                  <p className={`${sans.className} text-[#6B6B6B] mb-3`}>
                    Thank you for your order!
                  </p>
                  
                  <p className={`${sans.className} text-sm text-[#999] mb-8`}>
                    You'll receive a confirmation email shortly with tracking details.
                  </p>

                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setShowCheckout(false);
                        setShowCart(false);
                        setCart([]);
                      }}
                      className={`${sans.className} w-full py-4 bg-[#1A1A1A] text-[#F0EFEA] text-sm tracking-wider uppercase hover:bg-[#C5A059] transition-colors`}
                    >
                      Continue Shopping
                    </button>
                    
                    <button
                      onClick={() => setShowCheckout(false)}
                      className={`${sans.className} w-full py-3 border border-[#E5E3DE] text-[#1A1A1A] text-sm tracking-wider uppercase hover:bg-[#F0EFEA] transition-colors`}
                    >
                      Close
                    </button>
                  </div>

                  <div className="mt-8 pt-6 border-t border-[#E5E3DE]">
                    <p className={`${sans.className} text-xs text-[#999]`}>
                      Payment processing will be integrated in production<br />
                      (Stripe, PayPal, or Square)
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
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
