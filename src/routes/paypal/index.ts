import { captureOrder, createOrder, patchOrder } from './paypal.controller';

module.exports = function(server) {
  server.post('/paypal/create-order', createOrder);
  server.post('/paypal/patch-order', patchOrder);
  server.post('/paypal/capture-order', captureOrder);
}
