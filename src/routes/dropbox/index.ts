import { uploadImage } from './dropbox.controller';

module.exports = function(server) {
  server.post('/dropbox/upload', uploadImage);
}
