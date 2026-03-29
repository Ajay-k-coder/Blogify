require('dotenv').config();
const mongoose = require("mongoose");
const mysql = require('mysql2/promise');



const connectMongoDB = async()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("mongoDB connection established");
    }catch(err){console.log(err)}
}

const mysqlPool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: process.env.MYSQL_PASSWORD,  
    database: 'blogify_advanced',
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = {connectMongoDB, mysqlPool}