const httpStatus = require('http-status');

module.exports = {
  success: function (req, res, files, status = httpStatus.OK) {
    return res.status(status).send({
      files,
      status: true,
      timestamp: new Date().getTime(),
    });
  },
  error: function (req, res, error, status = httpStatus.INTERNAL_SERVER_ERROR) {
    return res.status(status).send({
      error,
      status: false,
      timestamp: new Date().getTime(),
    });
  },
};
