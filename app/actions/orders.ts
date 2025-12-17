"use server";

import { sendOrderConfirmationEmail } from "@/lib/resend-emails";

export async function sendOrderEmail(
  email: string,
  name: string,
  orderNumber: string,
  items: Array<{ name: string; quantity: number; price: number }>,
  total: number,
  loyaltyPoints: number
) {
  try {
    await sendOrderConfirmationEmail(email, name, orderNumber, items, total, loyaltyPoints);
    return { success: true };
  } catch (error) {
    console.error("Failed to send order email:", error);
    return { success: false, error: "Failed to send confirmation email" };
  }
}
