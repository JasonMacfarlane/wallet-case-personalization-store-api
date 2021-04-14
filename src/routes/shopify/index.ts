import { createCustomer, createOrder } from './shopify.controller';

module.exports = function(server) {
  server.post('/shopify/customers', createCustomer);
  server.post('/shopify/order', createOrder);
}
