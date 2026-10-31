export const metadata = {
  title: 'My Business Showcase V2',
  description: 'Shopify OAuth and Webhook Server',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}