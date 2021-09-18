const multer = require('multer');
const handlers = require('./responses/handlers');

module.exports = (router, destination) => {
  let route = router();

  route.post('/', (req, res, next) => {
    const upload = multer({
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, destination);
        },
        filename: (req, file, cb) => {
          cb(null, `multer_${file.fieldname}_${Date.now()}_${file.originalname}`);
        },
      }),
    });

    const request = upload.single('avatar');

    request(req, res, (error) => {
      if (error) {
        return handlers.error(req, res, error.message);
      }

      return handlers.success(req, res, req.file ? [req.file.filename] : []);
    });
  });

  return route;
};
