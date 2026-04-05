import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { message, carrier, phone } = await req.json();

    if (!message || !carrier || !phone) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // Determine gateway
    let gatewayDomain = '';
    if (carrier === 'att') gatewayDomain = 'txt.att.net';
    else if (carrier === 'verizon') gatewayDomain = 'vtext.com';
    else if (carrier === 'tmobile') gatewayDomain = 'tmomail.net';
    else {
      return NextResponse.json({ error: 'Invalid carrier selected.' }, { status: 400 });
    }

    const cleanPhone = phone.replace(/\D/g, '');
    const toEmail = `${cleanPhone}@${gatewayDomain}`;

    // Configure nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: toEmail,
      subject: '', // keep empty for SMS
      text: message,
    };

    // Before sending, ensure credentials exist (so we don't crash mysteriously)
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
       console.error("Missing GMAIL_USER or GMAIL_PASS environment variables.");
       // In development/mock mode without real creds, simulate success
       console.log("Mocking send to:", toEmail, "Message:", message);
       return NextResponse.json({ success: true, mocked: true });
    }

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('Error sending email out:', err);
    return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 });
  }
}
