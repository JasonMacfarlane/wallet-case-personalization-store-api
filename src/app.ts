require('dotenv').config();

import * as restify from 'restify';
import * as config from './config';

// Initialize server.
const server = restify.createServer({
  name: config.info.name,
  version: config.info.version,
  formatters: {
    // Formatter for error responses.
    'application/json': (req, res, body) => {
      if (body instanceof Error) {
        res.statusCode = (<any>body).statusCode || 500;

        if ((<any>body).body) {
          body = {
            code: res.statusCode,
            data: (<any>body).jse_info,
          };
        } else {
          body = {
            httpCode: res.statusCode,
          };
        }
      } else if (Buffer.isBuffer(body)) {
        body = body.toString('base64');
      }

      const data = JSON.stringify(body);

      res.setHeader('Content-Length', Buffer.byteLength(data));

      return data;
    }
  }
});

server.pre((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.header('origin'));
  res.header('Access-Control-Allow-Headers', req.header('Access-Control-Request-Headers'));
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE, PUT, PATCH');

  if (req.method === 'OPTIONS') {
    return res.send(204);
  }

  next();
});

server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());
server.use(restify.plugins.gzipResponse());
server.use(restify.plugins.requestLogger());

server.listen(config.info.port, function() {
  console.log('%s listening at %s', server.name, server.url);

  require('./routes/dropbox')(server);
  require('./routes/images')(server);
  require('./routes/paypal')(server);
  require('./routes/shopify')(server);
  require('./routes/stripe')(server);
});
