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

var hashText = (t) => { //helper for clarity
    return crypto.createHash("sha256").update(t).digest("hex");
}

var authenticate = async (username, password, cookie) => {    
    if(!(username && password)) return false;
    
    var q = "SELECT * FROM users WHERE email = " + SqlString.escape(username) + ";";
    var res = await query(q);

    for(var key in res){
	//if this is cookie auth, db stored pw has to be hashed again, if its plaintext auth then the plaintext has to be hashed
	var dbPassword = cookie ? hashText(res[key].password) : res[key].password;
	var userPassword = cookie ? password : hashText(password);

	if(res[key].email = username && dbPassword == userPassword){
	    return {lvl: res[key].priviliege}
	}
	console.log(`expected ${dbPassword} got ${userPassword}`);
    }

    return false;
    
}

exports.connectDB = connectDB;
exports.query = query;
exports.authenticate = authenticate;

exports.hashText = hashText;
