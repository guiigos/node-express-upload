'user strict'

const bodyParser = require('body-parser');
const httpStatus = require('http-status');
const express = require('express');
const request = require('request');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const mime = require('mime');
const fs = require('fs');

const handlers = require('./src/responses/handlers');
const routerMulter = require('./src/routeMulter');
const routerBusBoy = require('./src/routerBusBoy');
const routerFormidable = require('./src/routerFormidable');

var app = express();

const dest = 'assets';
if (!fs.existsSync(dest)) {
  fs.mkdirSync(dest);
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cors());

app.use('/multer', routerMulter(express.Router, dest));
app.use('/busboy', routerBusBoy(express.Router, dest));
app.use('/formidable', routerFormidable(express.Router, dest));

app.use(express.static(__dirname));

app.get('/get/:file', (req, res, next) => {
  if (!req.params.file) {
    return handlers.error(req, res, 'Parameter not informed');
  }

  let filePath = path.join(__dirname, dest, req.params.file);
  if (!fs.existsSync(filePath)) {
    return handlers.error(req, res, 'File not found');
  }

  var image = fs.readFileSync(filePath);
  res.writeHead(httpStatus.OK, { 'Content-Type': mime.getType(filePath) });
  res.end(image, 'binary');
});

app.get('/transfer/:file', (req, res, next) => {
  if (!req.params.file) {
    return handlers.error(req, res, 'Parameter not informed');
  }

  let filePath = path.join(__dirname, dest, req.params.file);
  if (!fs.existsSync(filePath)) {
    return handlers.error(req, res, 'File not found');
  }

  fs.createReadStream(path.join(dest, req.params.file))
    .pipe(request.put(`https://transfer.sh/${req.params.file.split('.').slice(0, -1).join('.')}`, (error, response) => {
      if (error) {
        return handlers.error(req, res, error.message);
      }

      return handlers.success(req, res, [response.body.trim()]);
    }));
});

app.use((req, res, next) => {
  res.status(httpStatus.NOT_FOUND).send('Page not found!');
  next();
});

app.use((err, req, res, next) => {
  const status = err.status || httpStatus.INTERNAL_SERVER_ERROR;
  res.status(status).send(`Unidentified Error - ${err.message}`);
  next();
});

// Server listen
var port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`Server listen on port ${port}.`));
