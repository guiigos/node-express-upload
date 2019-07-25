const busboy = require('busboy');
const path = require('path');
const fs = require('fs');
const handlers = require('./responses/handlers');

module.exports = function (router, destination) {
  let route = router();

  route.post('/', (req, res, next) => {
    let uploaded = new busboy({ headers: req.headers });
    let arrFiles = [];

    uploaded.on('file', (fieldname, file, filename, encoding, mimetype) => {
      file.on('data', (data) => {
        console.log(`File [${fieldname}] got ${data.length} bytes`);
      });

      file.on('end', () => {
        console.log(`File [${fieldname}] finished`);
      });

      filename = `busboy_${path.basename(fieldname)}_${filename}`;
      file.pipe(fs.createWriteStream(path.join(destination, filename)));
      arrFiles.push(filename);
    });

    uploaded.on('finish', () => {
      return handlers.success(req, res, arrFiles);
    });

    req.pipe(uploaded);
  });

  return route;
};
