import { redirect } from 'next/navigation';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ shop?: string }>
}) {
  const params = await searchParams;
  const shop = params.shop;

  if (shop) {
    // Redirect to your OAuth start route or handle authorization
    redirect(`https://${shop}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_CLIENT_ID}&scope=read_products,write_products&redirect_uri=https://shopify-webhook-sable.vercel.app/api/auth/callback`);
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h2>Shopify Backend Service Active</h2>
      <p>Please install this app via your Shopify Partners custom distribution link.</p>
    </div>
  );
}