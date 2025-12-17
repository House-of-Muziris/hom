// Email templates matching the House of M museum theme
// Colors: Canvas #F0EFEA, Ink #1A1A1A, Gold #C5A059

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export function getApprovalEmailTemplate(name: string, email: string, signInLink: string): EmailTemplate {
  return {
    subject: "Welcome to House of M — Membership Approved",
    text: `Dear ${name},

Congratulations! Your membership to House of M has been approved.

We're delighted to welcome you to our exclusive community of spice connoisseurs. You now have access to our curated collection of rare and premium spices from master growers around the world.

To get started, please click the link below to sign in and create your password:
${signInLink}

This secure link will expire in 1 hour. After signing in, you'll be prompted to create a password for future logins.

Once you're in, you can:
• Browse our premium spice catalog
• Add items to your cart
• Place orders for direct delivery
• Access exclusive member benefits

If you have any questions, please don't hesitate to reach out to our team.

Welcome to the family,
House of M Team

---
House of Muziris
Curating Heritage, One Spice at a Time`,
    
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to House of M</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=Inter:wght@400;500&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #F0EFEA;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F0EFEA;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E5E3DE;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 48px 48px 32px; text-align: center; border-bottom: 1px solid #E5E3DE;">
              <h1 style="margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 32px; font-weight: 600; color: #1A1A1A; letter-spacing: -0.5px;">
                House of M
              </h1>
              <p style="margin: 8px 0 0; font-size: 11px; font-weight: 500; color: #C5A059; text-transform: uppercase; letter-spacing: 2px;">
                Curating Heritage
              </p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 48px;">
              <h2 style="margin: 0 0 24px; font-family: 'Playfair Display', Georgia, serif; font-size: 28px; font-weight: 400; color: #1A1A1A; line-height: 1.3;">
                Congratulations, ${name}
              </h2>
              
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.7; color: #1A1A1A;">
                Your membership to House of M has been <strong style="color: #C5A059;">approved</strong>.
              </p>
              
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.7; color: #6B6B6B;">
                We're delighted to welcome you to our exclusive community of spice connoisseurs. You now have access to our curated collection of rare and premium spices from master growers around the world.
              </p>
              
              <div style="margin: 40px 0; padding: 32px; background-color: #F0EFEA; border-left: 3px solid #C5A059;">
                <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #6B6B6B;">
                  To get started, click the button below to sign in and create your password:
                </p>
                <a href="${signInLink}" style="display: inline-block; padding: 16px 32px; background-color: #1A1A1A; color: #F0EFEA; text-decoration: none; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 1.5px; transition: background-color 0.3s;">
                  Sign In & Create Password
                </a>
                <p style="margin: 16px 0 0; font-size: 12px; line-height: 1.6; color: #999;">
                  This secure link will expire in 1 hour.
                </p>
              </div>
              
              <p style="margin: 0 0 16px; font-size: 15px; font-weight: 500; color: #1A1A1A;">
                What's Next:
              </p>
              
              <ul style="margin: 0 0 32px; padding-left: 20px; font-size: 15px; line-height: 1.8; color: #6B6B6B;">
                <li>Browse our premium spice catalog</li>
                <li>Add items to your personal cart</li>
                <li>Place orders for direct delivery</li>
                <li>Access exclusive member benefits</li>
              </ul>
              
              <div style="margin: 40px 0 0; padding-top: 32px; border-top: 1px solid #E5E3DE;">
                <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #6B6B6B;">
                  If you have any questions, please don't hesitate to reach out to our team.
                </p>
                <p style="margin: 24px 0 0; font-family: 'Playfair Display', Georgia, serif; font-size: 16px; color: #1A1A1A;">
                  Welcome to the family,<br>
                  <span style="color: #C5A059;">House of M Team</span>
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 48px; background-color: #1A1A1A; text-align: center;">
              <p style="margin: 0 0 8px; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; color: #C5A059;">
                House of Muziris
              </p>
              <p style="margin: 0; font-size: 12px; color: #999; letter-spacing: 0.5px;">
                Curating Heritage, One Spice at a Time
              </p>
              
              <div style="margin: 24px 0 0; padding-top: 24px; border-top: 1px solid #333;">
                <p style="margin: 0; font-size: 11px; color: #666; line-height: 1.6;">
                  This email was sent to ${email}<br>
                  © ${new Date().getFullYear()} House of Muziris. All rights reserved.
                </p>
              </div>
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

export function getRejectionEmailTemplate(name: string, email: string): EmailTemplate {
  return {
    subject: "House of M — Membership Application Update",
    text: `Dear ${name},

Thank you for your interest in House of M membership.

After careful review, we regret to inform you that we are unable to approve your membership application at this time. Our membership program is highly selective and designed for specific industry partners.

We appreciate your interest in our curated spice collection and wish you all the best in your culinary endeavors.

If you have any questions or would like to reapply in the future, please don't hesitate to reach out.

Best regards,
House of M Team

---
House of Muziris
Curating Heritage, One Spice at a Time`,
    
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>House of M — Application Update</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=Inter:wght@400;500&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #F0EFEA;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F0EFEA;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E5E3DE;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 48px 48px 32px; text-align: center; border-bottom: 1px solid #E5E3DE;">
              <h1 style="margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 32px; font-weight: 600; color: #1A1A1A; letter-spacing: -0.5px;">
                House of M
              </h1>
              <p style="margin: 8px 0 0; font-size: 11px; font-weight: 500; color: #C5A059; text-transform: uppercase; letter-spacing: 2px;">
                Curating Heritage
              </p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 48px;">
              <h2 style="margin: 0 0 24px; font-family: 'Playfair Display', Georgia, serif; font-size: 28px; font-weight: 400; color: #1A1A1A; line-height: 1.3;">
                Dear ${name}
              </h2>
              
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.7; color: #1A1A1A;">
                Thank you for your interest in House of M membership.
              </p>
              
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.7; color: #6B6B6B;">
                After careful review, we regret to inform you that we are unable to approve your membership application at this time. Our membership program is highly selective and designed for specific industry partners.
              </p>
              
              <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.7; color: #6B6B6B;">
                We appreciate your interest in our curated spice collection and wish you all the best in your culinary endeavors.
              </p>
              
              <div style="margin: 40px 0 0; padding-top: 32px; border-top: 1px solid #E5E3DE;">
                <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #6B6B6B;">
                  If you have any questions or would like to reapply in the future, please don't hesitate to reach out.
                </p>
                <p style="margin: 24px 0 0; font-family: 'Playfair Display', Georgia, serif; font-size: 16px; color: #1A1A1A;">
                  Best regards,<br>
                  <span style="color: #C5A059;">House of M Team</span>
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 48px; background-color: #1A1A1A; text-align: center;">
              <p style="margin: 0 0 8px; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; color: #C5A059;">
                House of Muziris
              </p>
              <p style="margin: 0; font-size: 12px; color: #999; letter-spacing: 0.5px;">
                Curating Heritage, One Spice at a Time
              </p>
              
              <div style="margin: 24px 0 0; padding-top: 24px; border-top: 1px solid #333;">
                <p style="margin: 0; font-size: 11px; color: #666; line-height: 1.6;">
                  This email was sent to ${email}<br>
                  © ${new Date().getFullYear()} House of Muziris. All rights reserved.
                </p>
              </div>
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

export function getOrderConfirmationTemplate(
  name: string, 
  email: string, 
  orderNumber: string,
  items: Array<{name: string; quantity: number; price: number}>,
  total: number
): EmailTemplate {
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #E5E3DE;">
        <p style="margin: 0; font-size: 15px; color: #1A1A1A;">${item.name}</p>
        <p style="margin: 4px 0 0; font-size: 13px; color: #999;">Quantity: ${item.quantity}</p>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #E5E3DE; text-align: right;">
        <p style="margin: 0; font-size: 15px; color: #1A1A1A;">$${(item.price * item.quantity).toFixed(2)}</p>
      </td>
    </tr>
  `).join('');

  const itemsText = items.map(item => 
    `${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`
  ).join('\n');

  return {
    subject: `Order Confirmation #${orderNumber} — House of M`,
    text: `Dear ${name},

Thank you for your order! We've received your purchase and are preparing it for shipment.

Order Number: ${orderNumber}

Order Details:
${itemsText}

Total: $${total.toFixed(2)}

Your premium spices will be carefully packaged and shipped within 2-3 business days. You'll receive a shipping confirmation email with tracking information once your order is on its way.

Thank you for being a valued member of House of M.

Best regards,
House of M Team

---
House of Muziris
Curating Heritage, One Spice at a Time`,
    
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation — House of M</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=Inter:wght@400;500&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #F0EFEA;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F0EFEA;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E5E3DE;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 48px 48px 32px; text-align: center; border-bottom: 1px solid #E5E3DE;">
              <h1 style="margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 32px; font-weight: 600; color: #1A1A1A; letter-spacing: -0.5px;">
                House of M
              </h1>
              <p style="margin: 8px 0 0; font-size: 11px; font-weight: 500; color: #C5A059; text-transform: uppercase; letter-spacing: 2px;">
                Order Confirmation
              </p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 48px;">
              <h2 style="margin: 0 0 24px; font-family: 'Playfair Display', Georgia, serif; font-size: 28px; font-weight: 400; color: #1A1A1A; line-height: 1.3;">
                Thank you, ${name}
              </h2>
              
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.7; color: #6B6B6B;">
                We've received your order and are preparing it for shipment.
              </p>
              
              <div style="margin: 32px 0; padding: 20px; background-color: #F0EFEA;">
                <p style="margin: 0; font-size: 13px; color: #999; text-transform: uppercase; letter-spacing: 1px;">Order Number</p>
                <p style="margin: 8px 0 0; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; color: #1A1A1A;">#${orderNumber}</p>
              </div>
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 32px 0;">
                <thead>
                  <tr>
                    <th style="padding: 12px 0; border-bottom: 2px solid #1A1A1A; text-align: left; font-size: 13px; font-weight: 500; color: #1A1A1A; text-transform: uppercase; letter-spacing: 1px;">Item</th>
                    <th style="padding: 12px 0; border-bottom: 2px solid #1A1A1A; text-align: right; font-size: 13px; font-weight: 500; color: #1A1A1A; text-transform: uppercase; letter-spacing: 1px;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                  <tr>
                    <td style="padding: 20px 0 0;">
                      <p style="margin: 0; font-size: 16px; font-weight: 500; color: #1A1A1A;">Total</p>
                    </td>
                    <td style="padding: 20px 0 0; text-align: right;">
                      <p style="margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; color: #C5A059;">$${total.toFixed(2)}</p>
                    </td>
                  </tr>
                </tbody>
              </table>
              
              <div style="margin: 40px 0; padding: 24px; background-color: #F0EFEA; border-left: 3px solid #C5A059;">
                <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #6B6B6B;">
                  Your premium spices will be carefully packaged and shipped within <strong>2-3 business days</strong>. You'll receive a shipping confirmation email with tracking information once your order is on its way.
                </p>
              </div>
              
              <div style="margin: 40px 0 0; padding-top: 32px; border-top: 1px solid #E5E3DE;">
                <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #6B6B6B;">
                  Thank you for being a valued member of House of M.
                </p>
                <p style="margin: 24px 0 0; font-family: 'Playfair Display', Georgia, serif; font-size: 16px; color: #1A1A1A;">
                  Best regards,<br>
                  <span style="color: #C5A059;">House of M Team</span>
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 48px; background-color: #1A1A1A; text-align: center;">
              <p style="margin: 0 0 8px; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; color: #C5A059;">
                House of Muziris
              </p>
              <p style="margin: 0; font-size: 12px; color: #999; letter-spacing: 0.5px;">
                Curating Heritage, One Spice at a Time
              </p>
              
              <div style="margin: 24px 0 0; padding-top: 24px; border-top: 1px solid #333;">
                <p style="margin: 0; font-size: 11px; color: #666; line-height: 1.6;">
                  This email was sent to ${email}<br>
                  © ${new Date().getFullYear()} House of Muziris. All rights reserved.
                </p>
              </div>
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
