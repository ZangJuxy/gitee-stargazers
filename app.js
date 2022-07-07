const express = require('express');
const path = require('path');

const router = require('./routers/index');


const app = express();

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('express-art-template'))
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', router);

module.exports = app;
