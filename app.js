
import http from 'http'
import  express from "express"

import createError from 'http-errors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import bodyParser from 'body-parser'

import session  from 'express-session'


//import multer  from 'multer'

import indexRouter from './routes/indexRouter.js';
import apiRouter from './routes/apiRouter.js';


import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const config= require('./config.json');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pgSession = require('connect-pg-simple')(session);

const knex = require('knex')({
    client: 'pg',
    version: '7.2',
    connection: config.pgConnection,
    pool: {min: 0, max: 40}
});


const app=express();

const server=http.createServer(app)
server.listen(config.port)
server.on('error', error=>{
    switch (error.code) {
        case 'EACCES':
            console.error(config.port + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(config.port + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
});
server.on("listening",()=>{
    console.log('Listening on ' + config.port);
})
app.set('views', './views');
app.set('view engine', 'pug');
app.use(express.json({limit:"10mb"}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    session({
        secret: 'edvefewdvegdvfv',
        saveUninitialized: true,
        cookie: {
            maxAge: 10 * 24 * 60 * 60 * 1000,
        }, // 10 days
        store: new pgSession({conObject: config.pgConnection})
    })
)
app.use('/',(req, res,next)=>{
    req.knex=knex;
    next();
});
app.use('/', indexRouter);
app.use('/api', apiRouter);

app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
