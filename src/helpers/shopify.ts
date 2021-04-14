import * as config from '../config';

const axios = require('axios').default;

const instanceStorefront = axios.create({
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Storefront-Access-Token': config.info.shopifyStorefrontAccessToken,
  },
  baseURL: config.info.shopifyStoreUrl,
});

const storefrontUrl = config.info.shopifyStorefrontApiUrl;

export module Shopify {
  export async function getCheckout(id: string) {
    const res = await instanceStorefront.post(storefrontUrl, {
      query: `
        {
          node(id: "${id}") {
            id
            ...on Checkout {
              id
              currencyCode
              webUrl
              paymentDueV2 {
                amount
                currencyCode
              }
              subtotalPriceV2 {
                amount
                currencyCode
              }
              taxExempt
              taxesIncluded
              totalTaxV2 {
                amount
                currencyCode
              }
              customAttributes {
                key
                value
              }
              lineItems(first: 1) {
                edges {
                  node {
                    title
                    variant {
                      id
                      title
                      priceV2 {
                        amount
                        currencyCode
                      }
                    }
                    quantity
                    customAttributes {
                      key
                      value
                    }
                  }
                }
              }
              email
              discountApplications(first: 1) {
                edges {
                  node {
                    allocationMethod
                    targetSelection
                    targetType
                    value {
                      ... on MoneyV2 {
                        amount
                        currencyCode
                      }
                      ... on PricingPercentageValue {
                        percentage
                      }
                    }
                  }
                }
              }
              shippingAddress {
                firstName
                lastName
                company
                address1
                address2
                city
                province
                zip
                country
                phone
              }
              shippingLine {
                handle
                priceV2 {
                  amount
                  currencyCode
                }
                title
              }
            }
          }
        }
      `,
    });
  
    const checkout = res.data.data.node;
  
    return checkout;
  }
}