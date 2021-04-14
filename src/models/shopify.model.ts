import * as config from '../config';
import * as errors from 'restify-errors';

const axios = require('axios').default;

const instanceAdmin = axios.create({
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': config.info.shopifyApiPassword,
  },
  baseURL: config.info.shopifyStoreUrl,
});

const adminUrl = config.info.shopifyAdminApiUrl;

export async function createCustomer(body: any) {
  const acceptsMarketing = body.acceptsMarketing;
  const email = body.email;
  const firstName = body.firstName;
  const lastName = body.lastName;

  try {
    const res = await instanceAdmin.post(adminUrl, {
      query: `
        mutation customerCreate($input: CustomerInput!) {
          customerCreate(input: $input) {
            customer {
              id
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
      variables: {
        input: {
          acceptsMarketing: acceptsMarketing,
          email: email,
          firstName: firstName,
          lastName: lastName,
        }
      },
    });
  
    const customerCreate = res.data.data.customerCreate;

    return customerCreate;
  } catch (err) {
    console.error(err);
    throw(new errors.InternalServerError());
  }
}

export async function createOrder(body: any) {
  const checkout = body.checkout;
  const billing = body.billing;
  const paymentGateway = body.paymentGateway;

  const discountApplications = checkout.discountApplications.edges;
  const lineItemPrice = checkout.lineItems.edges[0].node.variant.priceV2.amount;
  const subTotal = checkout.subtotalPriceV2.amount;
  const discountAmount = lineItemPrice - subTotal;

  try {
    // Create a draft order.
    const draft = await instanceAdmin.post(adminUrl, {
      query: `
        mutation draftOrderCreate($input: DraftOrderInput!) {
          draftOrderCreate(input: $input) {
            draftOrder {
              id
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
      variables: {
        input: {
          ...(discountApplications.length ? {
            appliedDiscount: {
              amount: discountAmount,
              value: discountApplications[0].node.value.amount ? parseFloat(discountApplications[0].node.value.amount) : parseFloat(discountApplications[0].node.value.percentage),
              valueType: discountApplications[0].node.value.amount ? 'FIXED_AMOUNT' : 'PERCENTAGE',
            },
          } : {}),
          email: checkout.email,
          billingAddress: {
            firstName: billing.firstName,
            lastName: billing.lastName,
            address1: billing.address1,
            address2: billing.address2,
            city: billing.city,
            province: billing.province,
            zip: billing.zip,
            country: billing.country,
          },
          shippingAddress: {
            firstName: checkout.shippingAddress.firstName,
            lastName: checkout.shippingAddress.lastName,
            company: checkout.shippingAddress.company,
            address1: checkout.shippingAddress.address1,
            address2: checkout.shippingAddress.address2,
            city: checkout.shippingAddress.city,
            province: checkout.shippingAddress.province,
            zip: checkout.shippingAddress.zip,
            country: checkout.shippingAddress.country,
            phone: checkout.shippingAddress.phone,
          },
          shippingLine: {
            price: checkout.shippingLine.priceV2.amount,
            shippingRateHandle: checkout.shippingLine.handle,
            title: checkout.shippingLine.title,
          },
          lineItems: checkout.lineItems.edges.map(item => {
            const node = item.node;

            return {
              title: node.variant.title,
              variantId: node.variant.id,
              quantity: node.quantity,
              customAttributes: [
                { key: node.customAttributes[0].key, value: node.customAttributes[0].value },
                { key: 'Payment gateway', value: paymentGateway },
              ],
            };
          }),
        },
      },
    });

    // Complete the order.
    let completeOrder = (): Promise<any> => {
      return new Promise((resolve, reject) => {
        const tryComplete = async () => {
          try {
            let attempt = await instanceAdmin.post(adminUrl, {
              query: `
                mutation draftOrderComplete($id: ID!) {
                  draftOrderComplete(id: $id) {
                    draftOrder {
                      id
                      order {
                        id
                        displayFulfillmentStatus
                        fulfillable
                        fulfillmentOrders(first: 1) {
                          edges {
                            node {
                              id
                            }
                          }
                        }
                      }
                    }
                    userErrors {
                      field
                      message
                    }
                  }
                }
              `,
              variables: {
                id: draft.data.data.draftOrderCreate.draftOrder.id,
              },
            });

            const draftOrder = attempt.data.data.draftOrderComplete.draftOrder;

            if (draftOrder !== null) {
              const order = draftOrder.order;
              return resolve(order);
            }

            // If the order is still calculating, try to complete it again in 500ms.
            setTimeout(tryComplete, 500);
          } catch (err) {
            return reject(err);
          }
        };

        tryComplete();
      });
    };

    const order = await completeOrder();
    const fulfillmentOrder = order.fulfillmentOrders.edges[0].node;

    // Fulfill the order.
    const fulfillmentCreate = await instanceAdmin.post(adminUrl, {
      query: `
        mutation fulfillmentCreateV2($fulfillment: FulfillmentV2Input!) {
          fulfillmentCreateV2(fulfillment: $fulfillment) {
            fulfillment {
              id
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
      variables: {
        fulfillment: {
          lineItemsByFulfillmentOrder: [
            {
              fulfillmentOrderId: fulfillmentOrder.id,
            },
          ],
        },
      },
    });
  } catch (err) {
    console.error(err);
    throw(new errors.InternalServerError());
  }
}
