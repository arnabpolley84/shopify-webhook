// app/api/auth/callback/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const shop = searchParams.get('shop');

  if (!code || !shop) {
    return NextResponse.json({ error: 'Missing code or shop parameter' }, { status: 400 });
  }

  try {
    // Exchange the code for a permanent access token
    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_CLIENT_ID,
        client_secret: process.env.SHOPIFY_CLIENT_SECRET,
        code,
      }),
    });

    const data = await tokenResponse.json();

    if (data.access_token) {
      // You can store this token in a database or output it for testing
      console.log('Successfully acquired access token:', data.access_token);
      return NextResponse.json({ success: true, message: 'App installed successfully!', token: data.access_token });
    }

    return NextResponse.json({ error: 'Failed to retrieve access token', details: data }, { status: 400 });
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}