/**
 *
 * PayPal Node JS SDK dependency
 */
import * as checkoutNodeJssdk from '@paypal/checkout-server-sdk';

/**
 *
 * Returns PayPal HTTP client instance with environment that has access
 * credentials context. Use this instance to invoke PayPal APIs, provided the
 * credentials have access.
 */
export function client() {
  return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

/**
 *
 * Set up and return PayPal JavaScript SDK environment with PayPal access credentials.
 * This sample uses SandboxEnvironment. In production, use LiveEnvironment.
 *
 */
function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  return new checkoutNodeJssdk.core.LiveEnvironment(
    clientId, clientSecret
  );
}
