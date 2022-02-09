const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const router = require('./routes');

const app = express();

// habilitar handlebars como view
app.engine(
    'handlebars',
    exphbs.engine({
        layoutsDir: './views/layouts/',
        defaultLayout: 'layout',
        extname: 'handlebars',
        runtimeOptions: {
            allowProtoPropertiesByDefault: true,
            allowProtoMethodsByDefault: true,
        },
    })
);

app.set('view engine', 'handlebars');

// static files
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', router());

app.listen(5000); // Puerto