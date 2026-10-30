// app/api/webhooks/shopify/route.ts
import crypto from 'node:crypto';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 1. Read the raw body as text (Required for accurate HMAC verification)
    const rawBody = await request.text();
    
    // 2. Extract Shopify's HMAC signature header
    const hmacHeader = request.headers.get('x-shopify-hmac-sha256');
    const topic = request.headers.get('x-shopify-topic');
    const shop = request.headers.get('x-shopify-shop-domain');

    if (!hmacHeader) {
      return NextResponse.json({ error: 'Missing HMAC header' }, { status: 401 });
    }

    // 3. Compute your own HMAC using your Shopify App Client Secret
    const apiSecret = process.env.SHOPIFY_CLIENT_SECRET || '';
    const generatedHmac = crypto
      .createHmac('sha256', apiSecret)
      .update(rawBody, 'utf8')
      .digest('base64');

    // 4. Securely compare the signatures using timingSafeEqual
    const isValid = crypto.timingSafeEqual(
      Buffer.from(generatedHmac),
      Buffer.from(hmacHeader)
    );

    if (!isValid) {
      console.warn('Webhook signature verification failed.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 5. Parse payload and process your webhook event safely
    const payload = JSON.parse(rawBody);
    console.log(`Received verified webhook event: ${topic} from ${shop}`);

    // Handle your events (e.g., orders/create, products/update)
    switch (topic) {
      case 'orders/create':
        // Do something with payload (e.g., fulfillment logic, database insert)
        break;
      default:
        console.log(`Unhandled webhook topic: ${topic}`);
    }

    // Always respond with a 200 OK quickly so Shopify knows it was received
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}