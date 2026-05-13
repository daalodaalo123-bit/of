// app/api/sms/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Bypass local Mac SSL/TLS EPROTO bugs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export async function POST(request: NextRequest) {
  try {
    const { phone, message } = await request.json();

    if (!phone || !message) {
      return NextResponse.json({ error: 'Phone and message are required' }, { status: 400 });
    }

    const credentials = {
      apiKey: process.env.AT_API_KEY || 'atsk_a64e33156f9acab7470deee3b6b1e7eb8d06e83311628b462708596ffa1970198cd374f4',
      username: process.env.AT_USERNAME || 'sandbox',
    };
    
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const AfricasTalking = require('africastalking');
    const africastalking = AfricasTalking(credentials);

    // Format phone number to E.164 format (+252 for Somalia)
    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.startsWith('252')) {
        formattedPhone = '+' + formattedPhone;
      } else if (formattedPhone.startsWith('0')) {
        formattedPhone = '+252' + formattedPhone.substring(1);
      } else {
        formattedPhone = '+252' + formattedPhone;
      }
    }

    const options = {
      to: [formattedPhone],
      message: message,
    };

    const sms = africastalking.SMS;
    const response = await sms.send(options);

    console.log("Africa's Talking SMS response:", response);

    return NextResponse.json({ success: true, response });
  } catch (error: any) {
    console.error('SMS Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send SMS' }, { status: 500 });
  }
}
