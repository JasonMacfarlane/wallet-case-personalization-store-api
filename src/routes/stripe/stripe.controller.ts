import * as Stripe from '../../models/stripe.model';

export function charge(req, res, next) {
  Stripe.createStripeCharge(req.body).then((data) => {
    res.send(200);
    return next();
  }).catch((err) => {
    return next(err);
  });
}

export function paymentIntent(req, res, next) {
  Stripe.createStripePaymentIntent(req.body).then((data) => {
    res.send(200, { data: data });
    return next();
  }).catch((err) => {
    return next(err);
  });
}
