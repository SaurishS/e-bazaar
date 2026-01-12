import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { email, orderId, cart, total } = await request.json();

    // Log for debugging/simulating
    console.log(`[Mock Email Service] Attempting to send receipt to: ${email}`);
    console.log(`Order ID: ${orderId}, Total: ${total}`);

    // Check for credentials
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
        console.warn("[Mock Email Service] Missing SMTP credentials. Email logged but not sent.");
        return NextResponse.json({ success: true, message: "Mock email logged (no credentials)" });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const itemsHtml = cart.map((item: any) => 
        `<li>${item.title} x ${item.quantity} - ${item.price * item.quantity}</li>`
    ).join('');

    await transporter.sendMail({
      from: '"ValueKart" <orders@valuekart.com>',
      to: email,
      subject: `Order Receipt - ${orderId}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
            <h1 style="color: #4CAF50;">Order Confirmed!</h1>
            <p>Thank you for shopping with ValueKart.</p>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <hr />
            <h3>Items:</h3>
            <ul>
                ${itemsHtml}
            </ul>
            <h3>Total: ${total}</h3>
            <hr />
            <p>Your order will be shipped shortly.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Email Error:", error);
    return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 });
  }
}
