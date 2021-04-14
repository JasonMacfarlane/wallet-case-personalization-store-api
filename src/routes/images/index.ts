import { generatePreviews, resize } from './images.controller';

module.exports = function(server) {
  server.post('/images', resize);
  server.post('/generate-previews', generatePreviews);
}