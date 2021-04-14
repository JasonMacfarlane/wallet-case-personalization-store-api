import { charge, paymentIntent } from './stripe.controller';

module.exports = function(server) {
  server.post('/stripe/charge', charge);
  server.post('/stripe/payment-intent', paymentIntent);
}
