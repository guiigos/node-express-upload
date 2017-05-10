'user strict'

let express     = require('express');
let multer      = require('multer');
let busboy      = require('busboy');
let request     = require('request');
let fs          = require('fs');

let app = express();
let upload = multer({ dest: 'uploads/' });

app.get('/', function(req, res) {
    res.send('<h1>Exemplo de ulpload de arquivos.</h1><br><p>Utilize <strong>POST</strong> nas rotas <strong>/busboy</strong> ou <strong>/multer</strong>');
})

app.post('/multer', upload.single('avatar'), function(req, res) {
    console.log(req.file)
    console.log('Gravou o arquivo!')

    // deletar arquivo
    fs.unlink(`./upload/${req.file.filename}`, 
        (err) => {
            if (err) throw err
            else console.log('Deletou o arquivo!')
            res.json({ deleted: true })
        })
})

app.post('/busboy', (req, res) => {
    let uploaded = new busboy({ headers: req.headers })
    let files = []
    let counter = 0

    uploaded.on('file', (field, stream, name) => {
        counter++
        
        stream.pipe(request.put(`https://transfer.sh/${name}`, (err, response) => {
            if (err) throw err

            files.push(response.body.trim())
            counter--

            // Terminou o PUT se todos os arquivos já estiverem no transfer.sh
            if (counter === 0) {
                res.json(files)
            }
        }))
    })

    req.pipe(uploaded)
})

var port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`Server iniciado em http://localhost:${port}.`));