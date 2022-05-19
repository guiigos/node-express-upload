const bodyParser = require('body-parser');
const httpStatus = require('http-status');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const fs = require('fs');

const routerMulter = require('./src/routes/routerMulter');
const routerBusBoy = require('./src/routes/routerBusBoy');
const routerFormidable = require('./src/routes/routerFormidable');
const routerImages = require('./src/routes/others/routerImages');
const routerTransfer = require('./src/routes/others/routerTransfer');

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

app.use('/images', routerImages(express.Router, dest));
app.use('/transfer', routerTransfer(express.Router, dest));

app.use((req, res, next) => {
  res
    .status(httpStatus.NOT_FOUND)
    .send('Page not found!');

  next();
});

app.use((err, req, res, next) => {
  res
    .status(httpStatus.INTERNAL_SERVER_ERROR)
    .send(`Unidentified Error - ${err.message}`);

  next();
});

app.listen(Number(process.env.PORT || 3030));
