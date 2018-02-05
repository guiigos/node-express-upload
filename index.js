'user strict'

const multer = require('multer');
const busboy = require('busboy');
const request = require('request');
const formidable = require('formidable');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const mime = require('mime');

const express = require('express');
var app = express();

var cors = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
}

app.use(cors);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'));

app.get('/', function (req, res) {
    res.send(`
        <h1>Exemplo de ulpload de arquivos</h1>
        <br>
        <ul>
            <li>
                <p>Upload utilizando o multer, utilize <strong>POST</strong> na rota <strong>/multer</strong></p>
            </li>
            <li>
                <p>Upload utilizando o busboy, utilize <strong>POST</strong> na rota <strong>/busboy</strong></p>
            </li>
            <li>
                <p>Upload utilizando o formidable, utilize <strong>POST</strong> na rota <strong>/formidable</strong></p>
            </li>
            <li>
                <p>Download utilize <strong>GET</strong> na rota <strong>/get</strong></p>
            </li>
        </ul>
    `);
});

app.post('/multer', function (req, res) {
    let upload = multer({ dest: 'uploads/' }).single('avatar');

    upload(req, res,
        (err) => {
            // erro de upload
            if (err) {
                res.json({ message: 'Ocorreu um erro!', error: err });
                return;
            }

            // deletar arquivo
            fs.unlink(`./upload/${req.file.filename}`,
                (err) => {
                    if (err) res.json({ message: 'Ocorreu um erro ao eliminar arquivo!', error: err });
                    else res.json({ message: `Upload do arquivo ${req.file.filename} realizado com sucesso, e eliminado com sucesso!` });
                });
        });
});

app.post('/busboy', (req, res) => {
    let uploaded = new busboy({ headers: req.headers });
    let files = [];
    let counter = 0;

    // upload utilizando o busboy
    uploaded.on('file', (field, stream, name) => {
        counter++;

        // upload temp transfer.sh
        stream.pipe(request.put(`https://transfer.sh/${name}`, (err, response) => {
            // erro de upload
            if (err) {
                res.json({ message: 'Ocorreu um erro!', error: err });
                return;
            }

            files.push(response.body.trim())
            counter--;

            // Terminou se todos os arquivos já estiverem no transfer.sh
            if (counter === 0) {
                res.json(files);
            };
        }));
    });

    req.pipe(uploaded);
});

app.post('/formidable', function (req, res) {
    // criar diretório para salvar caso não exista
    let dirToSavel = path.join(__dirname + '/uploads/');
    if (!fs.existsSync(dirToSavel)) {
        fs.mkdirSync(dirToSavel);
    }

    let form = formidable.IncomingForm();
    form.uploadDir = dirToSavel;
    form.parse(req, (err, params, files) => {
        // erro de upload
        if (err) {
            res.json({ message: 'Ocorreu um erro!', error: err });
            return;
        }

        // se não existir arquivos retorna
        let filesKeys = Object.keys(files);
        if (filesKeys.length == 0) {
            res.json({ message: 'Sem arquivos!', error: err });
            return;
        }

        let arquivos = [];
        filesKeys.forEach(function (element) {
            arquivos.push({ arquivo: element, caminho: files[element].path });
        });

        res.json(arquivos);
    });
});

app.get('/get', function (req, res) {
    let file = req.query.file || undefined;

    // verifica o parâmetro
    if (!file) {
        res.json({ message: 'Nenhum arquivo informada!' });
        return;
    }

    // verifica se o arquivo existe
    var filePath = path.join(__dirname + '/uploads/' + file);
    if (!fs.existsSync(filePath)) {
        res.json({ message: 'Arquivo não existe!' });
        return;
    }

    // download do arquivo
    var image = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': mime.getType(filePath) });
    res.end(image, 'binary');
});

var port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`Server iniciado em http://localhost:${port}.`));