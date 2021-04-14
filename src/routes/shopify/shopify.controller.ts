import * as Shopify from '../../models/shopify.model';

export function createCustomer(req, res, next) {
  Shopify.createCustomer(req.body).then((data) => {
    res.send(200);
    return next();
  }).catch((err) => {
    return next(err);
  });
}

export function createOrder(req, res, next) {
  Shopify.createOrder(req.body).then((data) => {
    res.send(200);
    return next();
  }).catch((err) => {
    return next(err);
  });
}
