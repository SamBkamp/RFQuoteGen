const mysql = require("mysql");
const SqlString = require("sqlstring");
let con;
var connectDB = (config)=>{
    con = mysql.createPool(config);
    con.query("SELECT 1+1", (error, results, fields)=>{
	if(error) throw error;
	console.log("connected to DB");
    });
    
}
var query = (q)=>{ //promise'd sql query
    return new Promise((resolve, reject) =>{
	con.query(q, (error, result, fields)=>{
	    if(error) return reject(error);
	    resolve(JSON.parse(JSON.stringify(result)));
	});
    });
}
exports.connectDB = connectDB;
exports.query = query;
