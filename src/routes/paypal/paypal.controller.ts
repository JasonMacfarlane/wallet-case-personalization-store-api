import * as PayPal from '../../models/paypal.model';

export function captureOrder(req, res, next) {
  PayPal.captureOrder(req.body).then((data) => {
    res.send(200,  { data: data });
    return next();
  }).catch((err) => {
    return next(err);
  });
}

export function createOrder(req, res, next) {
  PayPal.createOrder(req.body).then((data) => {
    res.send(200, { data: data });
    return next();
  }).catch((err) => {
    return next(err);
  });
}

export function patchOrder(req, res, next) {
  PayPal.patchOrder(req.body).then((data) => {
    res.send(200,  { data: data });
    return next();
  }).catch((err) => {
    return next(err);
  });
}
