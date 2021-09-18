const fs = require('fs');
const path = require('path');
const busboy = require('busboy');
const handlers = require('./responses/handlers');

module.exports = (router, destination) => {
  let route = router();

  route.post('/', (req, res, next) => {
    let uploaded = new busboy({ headers } = req);
    let files = [];

    uploaded.on('file', (fieldname, file, filename, encoding, mimetype) => {
      file.on('data', (data) => {});
      file.on('end', () => {});

      filename = `busboy_${path.basename(fieldname)}_${Date.now()}_${filename}`;
      file.pipe(fs.createWriteStream(path.join(destination, filename)));
      files.push(filename);
    });

    uploaded.on('finish', () => handlers.success(req, res, files));

    req.pipe(uploaded);
  });

  return route;
};
