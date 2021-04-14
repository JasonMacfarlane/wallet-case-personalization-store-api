import * as config from '../config';
import * as errors from 'restify-errors';

const axios = require('axios').default;

const dropboxAccessToken = config.info.dropboxAccessToken;

export async function uploadImage(body: any) {
  const filename = body.filename;
  const arrayBuffer = body.arrayBuffer;

  const instance = axios.create({
    headers: {
      'Authorization': `Bearer ${dropboxAccessToken}`,
      'Content-Type': 'application/octet-stream',
      'Dropbox-API-Arg': JSON.stringify({
        'path': `/${filename}.jpg`,
        'mode': 'add',
        'autorename': true,
        'mute': false,
      }),
    },
  });

  try {
    const res = await instance.post('https://content.dropboxapi.com/2/files/upload', arrayBuffer);
    return res;
  } catch (err) {
    console.error(err);
    throw(new errors.InternalError());
  }
}
