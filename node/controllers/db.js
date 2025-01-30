const mysql = require("mysql");
const SqlString = require("sqlstring");
const crypto = require("crypto");

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

var authenticate = async (username, password)=>{
    
    if(!(username && password)) return {auth:0, lvl:0};

    var q = "SELECT * FROM users WHERE email = " + SqlString.escape(username) + ";";
    var res = await query(q);

    
    for(var key in res){
 	var hash = crypto.createHash("sha256");
 	var hString = hash.update(res[key].password).digest("hex");
 	
 	
 	if(res[key].email == username && hString == password){
 	    return {auth: 1, lvl:res[key].privilege};
 	}
    }
    
    
    return {auth:0, lvl:0};

}

exports.connectDB = connectDB;
exports.query = query;
exports.authenticate = authenticate;
