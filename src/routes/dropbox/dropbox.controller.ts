import * as Dropbox from '../../models/dropbox.model';

export function uploadImage(req, res, next) {
  Dropbox.uploadImage(req.body).then((data) => {
    res.send(200);
    return next();
  }).catch((err) => {
    return next(err);
  });
}
