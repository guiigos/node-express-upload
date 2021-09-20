const fs = require('fs');
const path = require('path');
const request = require('request');
const handlers = require('../../helper/handlers');

module.exports = (router, destination) => {
  let route = router();

  route.get('/:file', (req, res, next) => {
    let filePath = path.join(destination, req.params.file);
    if (!fs.existsSync(filePath)) {
      return handlers.error(req, res, 'File not found');
    }

    fs.createReadStream(path.join(destination, req.params.file))
      .pipe(request.put(`https://transfer.sh/${req.params.file}`, (error, response) => {
        if (error) {
          return handlers.error(req, res, error.message);
        }

        return handlers.success(req, res, [response.body.trim()]);
      }));
  });

  return route;
};
