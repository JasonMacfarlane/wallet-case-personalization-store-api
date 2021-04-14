// App info configuration.
export const info = {
  name: 'Sunday Cases API',
  version: '1',
  port: process.env.PORT || 3001,

  // Dropbox
  dropboxAccessToken: process.env.DROPBOX_ACCESS_TOKEN,

  // PayPal
  payPalClientId: process.env.PAYPAL_CLIENT_ID,
  paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET,

  // Shopify
  shopifyStoreUrl: process.env.SHOPIFY_STORE_URL,
  shopifyAdminApiUrl: '/admin/api/2020-01/graphql.json',
  shopifyApiPassword: process.env.SHOPIFY_API_PASSWORD,
  shopifyStorefrontAccessToken: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  shopifyStorefrontApiUrl: '/api/2020-04/graphql.json',

  // Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
};
