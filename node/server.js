var mysql = require('mysql');
var express = require('express');
var cookieParser = require('cookie-parser');
var db = require("./controllers/db.js");
var routing = require("./router.js");

const app = express();
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use("/", routing);

const port = 81;
 
//create connection to db

var connData = {
    host: "db",
    user: process.env.NODE_DB_USER,
    password: process.env.NODE_DB_PW,
    database: "RedFin"
}

db.connectDB(connData);


app.listen(port, () => {
    console.log('Server is running on port '+port);
});


