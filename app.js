var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const axios = require("axios");
const router = express.Router();
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

let pools = []

app.post('/connectToPool',(req,res)=>{
    let id = -1
    if (pools.length > 0){
        for (let i = 0; i < pools.length;i++){
            if (pools[i] != req.body.peerID){
                id = pools[i]
                pools.splice(i,1)
            }
        }
        
    }
    else {
        pools.push(req.body.peerID)
        console.log(pools)
    }
    res.json({otherID:id})
    console.log(pools)

})

module.exports = app;
