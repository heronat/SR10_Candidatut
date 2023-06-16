var mysql = require("mysql");

// console.log([process.env.HOST, process.env.USER, process.env.PWD, process.env.DATABASE].join(","));
var pool = mysql.createPool({
    host: process.env.HOST, //ou localhost
    user: process.env.USER,
    password: process.env.PWD,
    database: process.env.DATABASE
});

module.exports = pool;