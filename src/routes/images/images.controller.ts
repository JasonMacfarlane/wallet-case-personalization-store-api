import * as Image from '../../models/image.model';

/**
 * POST request
 */
export async function resize(req: any, res: any, next: any) {
  try {
    const data = await Image.resize(req.body);
    res.send({ data });
    return next();
  } catch (err) {
    return next(err);
  }
}

/**
 * POST request
 */
export async function generatePreviews(req: any, res: any, next: any) {
  try {
    const data = await Image.generatePreviews(req.body);
    res.send({ data });
    return next();
  } catch (err) {
    return next(err);
  }
}
