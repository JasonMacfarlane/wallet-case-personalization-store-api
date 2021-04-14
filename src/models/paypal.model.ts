import * as errors from 'restify-errors';

import * as paypal from '@paypal/checkout-server-sdk';
import * as payPalClient from '../config/paypalClient';

export async function patchOrder(body: any) {
  const checkout = body.checkout;
  const orderId = body.orderId;

  const request = new paypal.orders.OrdersPatchRequest(orderId);

  request.requestBody([
    {
      op: 'replace',
      path: '/intent',
      value: 'CAPTURE',
    },
    {
      op: 'replace',
      path: '/purchase_units/@reference_id==\'default\'/amount',
      value: getPurchaseUnitAmount(checkout),
    },
  ]);

  let order: any;

  try {
    order = await payPalClient.client().execute(request);
  } catch (err) {
    console.error(err);
    throw(new errors.InternalServerError());
  }

  return order;
}

export async function createOrder(body: any) {
  const checkout = body.checkout;

  const request = new paypal.orders.OrdersCreateRequest();

  request.prefer('return=representation');
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: getPurchaseUnitAmount(checkout),
      items: getPurchaseUnitItems(checkout),
    }],
  });

  let order: any;

  try {
    order = await payPalClient.client().execute(request);
  } catch (err) {
    console.error(err);
    throw(new errors.InternalServerError());
  }

  return order.result;
}

export async function captureOrder(body: any) {
  const orderId = body.orderId;

  const request = new paypal.orders.OrdersCaptureRequest(orderId);

  request.prefer('return=representation');

  let orderPayPal: any;

  try {
    orderPayPal = await payPalClient.client().execute(request);
  } catch (err) {
    console.error(err);
    throw(new errors.InternalServerError());
  }
}

function getPurchaseUnitAmount(checkout: any) {
  return {
    currency_code: checkout.currencyCode,
    value: (parseFloat(checkout.subtotalPriceV2.amount) + parseFloat(checkout.totalTaxV2.amount)).toFixed(2),
    breakdown: {
      item_total: {
        currency_code: checkout.subtotalPriceV2.currencyCode,
        value: checkout.subtotalPriceV2.amount,
      },
      shipping: {
        currency_code: checkout.subtotalPriceV2.currencyCode,
        value: 0,
      },
      tax_total: {
        currency_code: checkout.totalTaxV2.currencyCode,
        value: checkout.totalTaxV2.amount,
      },
    },
  };
}

function getPurchaseUnitItems(checkout: any) {
  return checkout.lineItems.edges.map((x: any) => {
    let unitValue = x.node.variant.priceV2.amount;

    if (checkout.discountApplications.edges.length > 0) {
      const discount = checkout.discountApplications.edges[0].node.value;

      if (typeof discount.amount !== 'undefined') {
        unitValue -= parseFloat(discount.amount);
      } else {
        unitValue *= (100 - parseFloat(discount.percentage)) / 100;
      }

      unitValue = unitValue.toFixed(2);
    }

    return {
      name: x.node.title,
      description: x.node.variant.title,
      unit_amount: {
        currency_code: x.node.variant.priceV2.currencyCode,
        value: unitValue, 
      },
      quantity: x.node.quantity,
    };
  });
}
