import * as config from '../config';
import * as errors from 'restify-errors';

const stripe = require('stripe')(config.info.stripeSecretKey);

export async function createStripeCharge(body: any) {
  const checkout = body.checkout;
  const card = body.card;
  const billing = body.billing;

  try {
    const charge = await createCharge(checkout, card, billing);
  } catch(err) {
    const code = err.code;

    switch(code) {
      case 'incorrect_cvc':
      case 'invalid_cvc':
        throw(new errors.BadRequestError({
          info: {
            code: code,
            message: 'Charge failed. Invalid security code.',
          },
        }));
    
      case 'card_declined':
        throw(new errors.BadRequestError({
          info: {
            code: code,
            message: 'Charge failed. We could not process the payment with this credit card.',
          },
        }));
      
      case 'expired_card':
        throw(new errors.BadRequestError({
          info: {
            code: code,
            message: 'Charge failed. This card has expired.',
          },
        }));
      
      case 'processing_error':
        throw(new errors.BadRequestError({
          info: {
            code: code,
            message: 'Charge failed. We could not process the payment with this credit card.',
          },
        }));
      
      case 'incorrect_number':
      case 'invalid_number':
        throw(new errors.BadRequestError({
          info: {
            code: code,
            message: 'Charge failed. Invalid credit card number.',
          },
        }));
      
      case 'invalid_expiry_month':
      case 'invalid_expiry_year':
        throw(new errors.BadRequestError({
          info: {
            code: code,
            message: 'Charge failed. Invalid expiry date.',
          },
        }));
      
      case 'parameter_missing':
        throw(new errors.BadRequestError({
          info: {
            code: code,
            message: 'Charge failed. Please check and ensure your credit card information is correct.',
          },
        }));
    }

    throw(new errors.BadRequestError({
      info: {
        code: code,
        message: 'Charge failed. Please check and ensure your credit card information is correct.',
      },
    }));
  }
}

export async function createStripePaymentIntent(body: any) {
  const checkout = body.checkout;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(checkout.paymentDueV2.amount * 100),
    currency: checkout.paymentDueV2.currencyCode.toLowerCase(),
    // Verify your integration in this guide by including this parameter
    metadata: { integration_check: 'accept_a_payment' },
  });

  return paymentIntent;
}

async function createCharge(checkout, card, billing) {
  // Create a card token.
  const token = await stripe.tokens.create({
    card: {
      object: 'card',
      number: card.number,
      exp_month: card.expMonth,
      exp_year: card.expYear,
      cvc: card.cvc,
      name: card.name,
      address_line1: billing.address1,
      address_line2: billing.address2,
      address_city: billing.city,
      address_state: billing.province,
      address_zip: billing.zip,
      address_country: billing.country,
    },
  });

  // Create a Stripe charge.
  const charge = await stripe.charges.create({
    amount: Math.floor(checkout.paymentDueV2.amount * 100),
    currency: checkout.paymentDueV2.currencyCode.toLowerCase(),
    source: token.id,
  });

  return charge;
}
