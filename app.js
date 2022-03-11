const express = require('express');
const path = require('path');
const fileUpload = require('express-fileupload');
const { web3Object } = require('./utils/web3');
require('dotenv').config();

/* ROUTES and how to import routes */

const layout = require('./routes/layout');
const api = require('./routes/api');

/* end of ROUTES and how to import routes */

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use(fileUpload());

app.set('view engine', 'ejs');
app.set('views', 'views');

/* Routes used by the project */

app.use('/', layout);
app.use('/api', api);

/* End of routes used by the project */

// In case of an endpoint does not exist must return 404.html
// app.use((req, res, next) => { res.status(404).render('404.ejs', { pageTitle: '404' }) })

module.exports = app;