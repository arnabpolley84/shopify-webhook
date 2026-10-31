import { redirect } from 'next/navigation';

async function getProducts() {
  const shop = process.env.SHOPIFY_SHOP_DOMAIN;
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

  if (!shop || !accessToken) {
    return [];
  }

  try {
    const response = await fetch(`https://${shop}/admin/api/2026-10/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({
        query: `{
          products(first: 10) {
            edges {
              node {
                id
                title
                handle
                status
                variants(first: 1) {
                  edges {
                    node {
                      price
                    }
                  }
                }
                images(first: 1) {
                  edges {
                    node {
                      url
                      altText
                    }
                  }
                }
              }
            }
          }
        }`,
      }),
      cache: 'no-store',
    });

    const json = await response.json();
    return json?.data?.products?.edges || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ shop?: string }>
}) {
  const params = await searchParams;
  const shopParam = params.shop;

  // 1. If Shopify redirects with a ?shop= parameter during installation/auth, start OAuth
  if (shopParam) {
    const clientId = process.env.SHOPIFY_CLIENT_ID;
    const host = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'https://shopify-webhook-sable.vercel.app';
    
    redirect(`https://${shopParam}/admin/oauth/authorize?client_id=${clientId}&scope=read_products,write_products&redirect_uri=${host}/api/auth/callback`);
  }

  // 2. Fetch products if credentials exist in environment variables
  const products = await getProducts();
  const isConfigured = process.env.SHOPIFY_SHOP_DOMAIN && process.env.SHOPIFY_ACCESS_TOKEN;

  return (
    <main style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px', borderBottom: '1px solid #eaeaea', paddingBottom: '20px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>My Business Showcase V2</h1>
        <p style={{ color: '#666' }}>
          {isConfigured 
            ? <>Connected store: <strong>{process.env.SHOPIFY_SHOP_DOMAIN}</strong></>
            : 'App backend is active. Install via your Shopify Partners custom distribution link.'}
        </p>
      </header>

      {!isConfigured ? (
        <div style={{ padding: '24px', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #eaeaea' }}>
          <h2>Not Configured</h2>
          <p style={{ marginTop: '8px', color: '#555' }}>
            Please use your Shopify Partners custom distribution link to install this app on your store.
          </p>
        </div>
      ) : products.length === 0 ? (
        <p>No products found in this store yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
          {products.map(({ node }: any) => {
            const image = node.images?.edges[0]?.node;
            const price = node.variants?.edges[0]?.node?.price;

            return (
              <div key={node.id} style={{ border: '1px solid #eaeaea', borderRadius: '8px', padding: '16px', background: '#fff' }}>
                {image ? (
                  <img src={image.url} alt={image.altText || node.title} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px', marginBottom: '12px' }} />
                ) : (
                  <div style={{ width: '100%', height: '200px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', marginBottom: '12px', color: '#999' }}>No Image</div>
                )}
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>{node.title}</h3>
                {price && <p style={{ fontSize: '15px', color: '#0070f3', fontWeight: 'bold' }}>₹{price}</p>}
                <span style={{ display: 'inline-block', marginTop: '10px', fontSize: '12px', padding: '2px 8px', background: node.status === 'ACTIVE' ? '#e6f4ea' : '#fef7e0', color: node.status === 'ACTIVE' ? '#137333' : '#b06000', borderRadius: '4px' }}>
                  {node.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}