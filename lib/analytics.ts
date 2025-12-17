import { logEvent } from "firebase/analytics";
import { getAnalyticsInstance } from "./firebase";

export function trackPageView(pageName: string) {
  const analytics = getAnalyticsInstance();
  if (analytics) {
    logEvent(analytics, "page_view", {
      page_title: pageName,
      page_location: typeof window !== "undefined" ? window.location.href : "",
    });
  }
}

export function trackEvent(eventName: string, params?: Record<string, any>) {
  const analytics = getAnalyticsInstance();
  if (analytics) {
    logEvent(analytics, eventName, params);
  }
}

export function trackMembershipRequest(email: string, company: string) {
  trackEvent("membership_request", { email, company });
}

export function trackMembershipApproval(email: string) {
  trackEvent("membership_approval", { email });
}

export function trackMembershipRejection(email: string) {
  trackEvent("membership_rejection", { email });
}

export function trackLogin(method: "password" | "passwordless") {
  trackEvent("login", { method });
}

export function trackAddToCart(spiceId: string, spiceName: string, price: number) {
  trackEvent("add_to_cart", {
    item_id: spiceId,
    item_name: spiceName,
    price: price,
  });
}

export function trackRemoveFromCart(spiceId: string, spiceName: string) {
  trackEvent("remove_from_cart", {
    item_id: spiceId,
    item_name: spiceName,
  });
}

export function trackCheckout(totalAmount: number, itemCount: number) {
  trackEvent("begin_checkout", {
    value: totalAmount,
    items: itemCount,
  });
}

export function trackPurchase(totalAmount: number, items: any[]) {
  trackEvent("purchase", {
    value: totalAmount,
    currency: "USD",
    items: items,
  });
}
