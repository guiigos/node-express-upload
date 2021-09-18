const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const handlers = require('./responses/handlers');

module.exports = (router, destination) => {
  let route = router();

  route.post('/', (req, res, next) => {
    let form = formidable.IncomingForm({
      uploadDir: destination,
      multiples: false,
    });

    form.once('error', console.error);
    form.once('end', () => {});

    form.on('file', (fieldname, file) => {
      const name = `formidable_${fieldname}_${Date.now()}_${file.name}`;
      fs.rename(file.path, path.join(form.uploadDir, name), () => form.emit('data', [name]));
    });

    form.on('data', (files) => {
      return handlers.success(req, res, files);
    });

    form.parse(req, (error, params, files) => {
      if (error) {
        return handlers.error(req, res, error.message);
      }
    });
  });

  return route;
};
