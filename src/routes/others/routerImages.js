const fs = require('fs');
const path = require('path');
const mime = require('mime');
const httpStatus = require('http-status');
const handlers = require('../../helper/handlers');

module.exports = (router, destination) => {
  let route = router();

  route.get('/', (req, res, next) => {
    const images = fs.readdirSync(destination);
    return handlers.success(req, res, images);
  });

  route.get('/:file', (req, res, next) => {
    const filePath = path.join(destination, req.params.file);

    if (!fs.existsSync(filePath)) {
      return handlers.error(req, res, 'File not found');
    }

    const image = fs.readFileSync(filePath);
    res.writeHead(httpStatus.OK, { 'Content-Type': mime.getType(filePath) });
    res.end(image, 'binary');
  });

  return route;
};
