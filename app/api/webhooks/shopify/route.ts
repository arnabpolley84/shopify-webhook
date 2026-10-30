// app/api/webhooks/shopify/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const topic = request.headers.get('x-shopify-topic');
    const shop = request.headers.get('x-shopify-shop-domain');
    const payload = await request.json();

    console.log(`Received webhook event: ${topic} from ${shop}`);
    console.log('Payload:', payload);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}