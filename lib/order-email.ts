// Order confirmation email template
import { EmailTemplate } from './email-templates';

export function getOrderConfirmationEmailTemplate(
  name: string,
  email: string,
  orderNumber: string,
  items: Array<{ name: string; quantity: number; price: number }>,
  total: number,
  loyaltyPoints: number
): EmailTemplate {
  const itemsText = items.map(item => `- ${item.name} × ${item.quantity} — $${(item.price * item.quantity).toFixed(2)}`).join('\n');
  
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #E5E3DE;"><span style="font-size: 14px; color: #1A1A1A;">${item.name}</span> <span style="font-size: 13px; color: #6B6B6B;">× ${item.quantity}</span></td>
      <td style="padding: 8px 0; border-bottom: 1px solid #E5E3DE; text-align: right;"><span style="font-size: 14px; color: #1A1A1A;">$${(item.price * item.quantity).toFixed(2)}</span></td>
    </tr>
  `).join('');

  return {
    subject: `Order Confirmed #${orderNumber} — House of M`,
    text: `Dear ${name},

Thank you for your order!

Order Number: ${orderNumber}
Total: $${total.toFixed(2)}

Items Ordered:
${itemsText}

Loyalty Rewards:
You've earned ${loyaltyPoints} loyalty points with this purchase!
(10 points = $1 discount on your next order)

Your order is being prepared and will be shipped within 2-3 business days.

Thank you for choosing House of M!

Best regards,
House of M Team`,
    
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=Inter:wght@400;500&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', sans-serif; background-color: #F0EFEA;">
  <table width="100%" style="background-color: #F0EFEA; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 600px; background-color: #FFFFFF; border: 1px solid #E5E3DE;">
          <tr>
            <td style="padding: 32px 32px 20px; text-align: center; border-bottom: 1px solid #E5E3DE;">
              <h1 style="margin: 0; font-family: 'Playfair Display', serif; font-size: 26px; color: #1A1A1A;">House of M</h1>
              <p style="margin: 6px 0 0; font-size: 10px; color: #C5A059; text-transform: uppercase; letter-spacing: 2px;">Order Confirmed</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 12px; font-family: 'Playfair Display', serif; font-size: 22px; color: #1A1A1A;">Thank you, ${name}!</h2>
              <p style="margin: 0 0 20px; font-size: 14px; color: #6B6B6B;">Your order has been confirmed.</p>
              
              <div style="background-color: #F0EFEA; padding: 16px; margin-bottom: 20px;">
                <p style="margin: 0 0 4px; font-size: 10px; color: #999; text-transform: uppercase;">Order Number</p>
                <p style="margin: 0; font-family: monospace; font-size: 15px; color: #1A1A1A;">${orderNumber}</p>
              </div>

              <table style="width: 100%; margin-bottom: 20px;">
                <thead>
                  <tr>
                    <th style="padding: 10px 0; border-bottom: 2px solid #C5A059; text-align: left; font-size: 10px; color: #6B6B6B; text-transform: uppercase;">Item</th>
                    <th style="padding: 10px 0; border-bottom: 2px solid #C5A059; text-align: right; font-size: 10px; color: #6B6B6B; text-transform: uppercase;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                  <tr>
                    <td style="padding: 12px 0 0; text-align: right; font-size: 14px; font-weight: 600; color: #1A1A1A;">Total</td>
                    <td style="padding: 12px 0 0; text-align: right; font-family: 'Playfair Display', serif; font-size: 18px; color: #C5A059;">$${total.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              <div style="background-color: #C5A059; padding: 16px; margin-bottom: 20px; text-align: center; border: 1px solid #C5A059;">
                <p style="margin: 0 0 6px; font-size: 11px; color: #FFFFFF; text-transform: uppercase;">Loyalty Reward</p>
                <p style="margin: 0; font-size: 22px; font-weight: 600; color: #FFFFFF;">+${loyaltyPoints} Points Earned</p>
                <p style="margin: 6px 0 0; font-size: 10px; color: #F0EFEA;">10 points = $1 discount on your next order</p>
              </div>
              
              <p style="margin: 0; font-size: 13px; color: #6B6B6B;">Your order will be shipped within 2-3 business days.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 32px; background-color: #1A1A1A; text-align: center;">
              <p style="margin: 0 0 4px; font-family: 'Playfair Display', serif; font-size: 15px; color: #C5A059;">House of Muziris</p>
              <p style="margin: 0; font-size: 10px; color: #999;">Curating Heritage, One Spice at a Time</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim()
  };
}
