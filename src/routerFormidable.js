const formidable = require('formidable');
const path = require('path');
const fs = require('fs');
const handlers = require('./responses/handlers');

module.exports = function (router, destination) {
  let route = router();

  route.post('/', (req, res, next) => {
    let form = formidable.IncomingForm();
    form.uploadDir = destination;

    let arrFiles = [];

    form.on('file', (field, file) => {
      let fileName = `formidable_${field}_${file.name}`;
      fs.rename(file.path, path.join(form.uploadDir, fileName));
      arrFiles.push(fileName);
    });

    form.parse(req, (error, params, files) => {
      if (error) {
        return handlers.error(req, res, error.message);
      }

      let filesKeys = Object.keys(files);
      if (filesKeys.length == 0) {
        return handlers.success(req, res, []);
      }

      return handlers.success(req, res, arrFiles);
    });
  });

  return route;
};
