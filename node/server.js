var mysql = require('mysql');
var express = require('express');
var cookieParser = require('cookie-parser');
var crypto = require("crypto");
var SqlString = require('sqlstring');


const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
const port = 81;
 
//create connection to db
var con = mysql.createConnection({
    host: "db",
    user: process.env.NODE_DB_USER,
    password: process.env.NODE_DB_PW,
    database: "RedFin"
});

con.connect(function(err){   
    if(err) throw err;
    console.log("Database connected");         
});




app.get("/", (req, res) => {
    
    res.send("elmao");
});

app.all("/get-:value", async (req, res) =>{
    
    
    var auth = await authenticate(req.cookies.username, req.cookies.userauth);
    
    console.log("AUTH: " + auth.auth);
    
    if(auth.auth == 0){
 	res.send("authentication failure");
 	res.end();
    }
    
    var query = "SELECT id, name FROM " + req.params.value;
    
    console.log(query);
    
    con.query(query, (err, result, fields)=>{	
 	if(err){
 	    res.send("Error in SQL request");
 	    console.error(err);
 	    res.end();
 	}else{
 	    result = JSON.stringify(result);
 	    res.send(result);
 	    res.end();
 	    
 	}
 	
    });
    
});

app.route("/quotegen")
    .get((req, res) => {
 	res.write("erm you can't be here");
 	res.end();
    })
    .post( async (req, res) => {
 	
 	res.setHeader('content-type', 'application/json');
	
 	var auth = await authenticate(req.cookies.username, req.cookies.userauth);
 	var retObj = {};
 	
 	if(auth.auth == 0){
 	    retObj["error"] = "authentication failure";
 	    return res.send(retObj);	    
 	}
	
 	
	
 	var b = JSON.parse(req.body.data); //TODO: handle JSON parsing error, atm it just crashes the server ijbol
 	var test = JSON.parse(req.body.test);
	
 	if(Object.keys(b.tanks).length < 1){
 	    retObj["error"] = "not enough tanks";	   
 	}
	
 	if(b.client == ""){
 	    retObj["error"] = "no client name provided";
 	}
	
 	if(b.countryID == ""){
 	    retObj["error"] = "no country provided";	    	    
 	}
 	
 	if(b.marginID == ""){
 	    retObj["error"] = "no margin provided";	    	    
 	}
	
 	if(retObj["error"]) return res.send(retObj);
	
 	//values to default to 0 if empty string
 	var defZero = ["pmDays", "imDays", "plumberDays", "electricianDays", "manLabDays"];
	
 	for(var i = 0; i < defZero.length; i++){
 	    if(b[defZero[i]] == "") b[defZero[i]] = 0;
 	}
 	
	
	
 	var insertID;
 	var genOrder = "INSERT INTO `Quotes` (`CID`, `wedge`, `margin`, `client`, `pmDays`, `imDays`, `manLab`, `electrician`, `plumber`, `author`) VALUES ("+SqlString.escape(b.countryID)+","+SqlString.escape(2)+","+SqlString.escape(b.marginID)+","+SqlString.escape(b.client)+","+SqlString.escape(b.pmDays)+","+SqlString.escape(b.imDays)+","+SqlString.escape(b.manLabDays)+","+SqlString.escape(b.electricianDays)+","+SqlString.escape(b.plumberDays)+",'Sam')";
 	
 	var success = "";
 	retObj["error"] = "";
 	try{ //INSERT QUOTE
 	    var t = await query(genOrder);
 	    success +=  "Quotes Success";
 	    insertID = JSON.parse(JSON.stringify(t)).insertId;
 	    retObj["oid"] = insertID;
 	}catch(err){
 	    console.error(err);
 	    retObj["error"] += "`Quotes` SQL error";
 	    res.end();
 	}
	
 	for(var keys in b.tanks){ //loop over tanks
 	    var d = b.tanks[keys];
 	    d = d.split("|");
 	    if(d.length != 4){
 		retObj["error"] += "a Tank does not have enough data";
 		return res.send(retObj);		
 	    }
 	    
 	    var tankDimension = d[0].split(" ");
	    
 	    
 	    for(var k = 0; k < tankDimension.length; k++){
 		if(tankDimension[k] == ""){ //check data sent is vali
 		    retObj["error"] += "a Tank does not have enough data";
 		    return res.send(retObj);
 		}
 	    }
 	    
	    
 	    var standDimension = d[1].split(" ");
 	    var skid = d[2];
 	    var themes = d[3];
 	    
 	    var tankOrder = "INSERT INTO `Tanks` (`OID`, `SID`, `LID`,`theme`, `length`, `depth`, `height`,`thickness`) VALUES ("+SqlString.escape(insertID)+", "+SqlString.escape(skid)+", "+SqlString.escape(standDimension[3])+","+SqlString.escape(themes)+", "+SqlString.escape(tankDimension[1])+", "+SqlString.escape(tankDimension[2])+", "+SqlString.escape(tankDimension[0])+", "+SqlString.escape(tankDimension[3])+")";
 	    
 	    console.log(tankOrder);
 	    console.log(standDimension);
 	    var tinsertID;
 	    
 	    try{ //INSERT TANK(S)
 		var tQuery = await query(tankOrder);
 		success +=", Tanks Success";
 		tinsertID = JSON.parse(JSON.stringify(tQuery)).insertId;		
 		
 	    }catch(err){
 		console.error(err);
 		retObj["error"] += "`Tanks` SQL ERROR";
 		return res.send(retObj);		
 		//TODO: DELETE entry into `Quotes` associated with these tanks if INSERT INTO `Tanks` fails
 	    }
	    
 	    try{ //INSERT STAND
 		var standQuery = "INSERT INTO `StandInstance` (`StID`, `TID`, `length`, `height`, `depth`) VALUES ("+SqlString.escape(standDimension[3])+", "+SqlString.escape(tinsertID)+", "+SqlString.escape(standDimension[1])+", "+SqlString.escape(standDimension[0])+", "+SqlString.escape(standDimension[2])+")";
 		await query(standQuery);
 		success += " Stand Success";
 	    }catch(err){
 		console.error(err);
 		retObj["error"] += "`StandInstance` SQL error";
 		return res.send(retObj);	
 	    }
 	    
 	}
 	if(success != "") retObj["success"] = success;
 	res.send(retObj);
 	//res.write("erm"); //write a response to the client	
    });


app.post("/getNumber", async (req, res)=>{
    
    var retObj = {};
    res.setHeader('content-type', 'application/json');
    
    //check cookie auth
    var auth = await authenticate(req.cookies.username, req.cookies.userauth);   
    if(auth.auth == 0){
 	return res.send({"error": "authentication failure"});	
    }
    
    var q = "SELECT * FROM `Tanks` WHERE OID="+SqlString.escape(req.body.data)+";";
    var tanksData;
    retObj["price"] = 0;
    try{//get tanks 
 	var tQuery = await query(q);
 	tanksData = JSON.parse(JSON.stringify(tQuery));
 	
 	
 	
    }catch(err){
 	console.error(err);
 	retObj["error"] = "can't get Tank";
 	return res.send(retObj);		
    }
    
    for(key in tanksData){ //calculate cost per tank (stand, acrylic, skids etc)
 	//console.log(tanksData[key]);	
 	var q = "SELECT name, price FROM `Skids` WHERE id="+SqlString.escape(tanksData[key].SID)+";";
 	
 	try{ //get price for tank skid
 	    var dbquery = await query(q); //TODO add clause to check if specific SID was already queried in this order to avoid querying the same data twice
 	    dbquery = JSON.parse(JSON.stringify(dbquery));
 	    for(jey in dbquery){
		retObj["price"] += dbquery[jey].price;
		if(req.body.verbose == 1 && auth.lvl == 1) retObj[dbquery[jey].name] = dbquery[jey].price;
	    }
 	}
 	catch(err){
 	    console.error(err);
 	    retObj["error"] = "can't get skids";
 	    return res.send(retObj);
 	}
	
 	
 	try{// get price for tank material volume
 	    var priceConstant = 100; //PRICE in USD per cm^3 of material TODO: this has to be set externally or something, db perchance
 	    var longPanel = tanksData[key].length * tanksData[key].height * (tanksData[key].thickness/10);
 	    var shortPanel = tanksData[key].height * tanksData[key].depth * (tanksData[key].thickness/10);
 	    var bottomPanel = tanksData[key].length * tanksData[key].depth * (tanksData[key].thickness/10);
 	    var totalVolume = (longPanel*2) + (shortPanel*2) + bottomPanel;
 	    retObj["price"] += (totalVolume * priceConstant);
	    if(req.body.verbose == 1 && auth.lvl == 1) retObj["tank"+key] = (totalVolume * priceConstant);
 	}catch(err){
 	    console.error(err);
 	    retObj["error"] = "unable to calculate tank material volume";
 	    return res.send(retObj);
 	}
	
 	try{//calculate price for stand material *length*
 	    var q = "SELECT * FROM `StandInstance` INNER JOIN `Stands` ON StandInstance.StID = Stands.id WHERE StandInstance.TID="+SqlString.escape(tanksData[key].id)+";";
 	    var dbquery = JSON.parse(JSON.stringify(await query(q)));
 	    
 	    //extruded alu stand is calculated as a wireframe box of the volume given
 	    //also assuming theres 0 > x <= 1 stands per tank (1 stand max, 1 stand min)
 	    var box = (dbquery[0].length*4) + (dbquery[0].height*4) + (dbquery[0].depth*4)
 	    retObj["price"] += (box*dbquery[0].price);
	    if(req.body.verbose == 1 && auth.lvl == 1) retObj["stand"+key] = (box*dbquery[0].price);
 	    
 	}catch(err){
 	    console.error(err);
 	    retObj["error"] = "unable to calculate stand costs";
 	    return res.send(retObj);
 	}
	
 	
    }
    
    try{ //get labour costs
 	var q = "SELECT pmDays, imDays, manLab, electrician, plumber, CID FROM `Quotes` WHERE id="+SqlString.escape(req.body.data)+";";
 	var durationQuery = JSON.parse(JSON.stringify(await query(q))); //for labour days
 	
 	q = "SELECT pName, rate FROM RFStaff";
 	var rateQuery = JSON.parse(JSON.stringify(await query(q))); //for labour rate
	
 	rateQuery = rateQuery.reduce((acc, curr)=>{ //remove outer array shell
 	    acc[curr.pName] = curr.rate; //curr is the current element of rateQuery
 	    return acc; //acc is passed onto each iteration then finally passed back to tanksData
 	}, {}); //{} is initial value of acc 
	
 	//id is PK so durationQuery will only ever return 1 row
 	retObj["price"] += (durationQuery[0].pmDays * rateQuery["Project Manager"]);	
 	retObj["price"] += (durationQuery[0].imDays * rateQuery["Installation Manager"]);
	if(req.body.verbose == 1 && auth.lvl == 1){
	    retObj["PM"] = (durationQuery[0].pmDays * rateQuery["Project Manager"]);
	    retObj["IM"] = (durationQuery[0].imDays * rateQuery["Installation Manager"]);
	}
	//local labour
	if(!(durationQuery[0].manLab == 0 && durationQuery[0].electrician == 0 && durationQuery[0].plumber == 0)){ //only make requests if they actually have days to calculate
	    q = "SELECT plumber, electrician, manualLabour FROM `Countries` WHERE id="+SqlString.escape(durationQuery[0].CID)+";";
	    var localLabourQuery = JSON.parse(JSON.stringify(await query(q)));
	    console.log();
	    retObj["price"] += localLabourQuery[0].plumber * durationQuery[0].plumber;
	    retObj["price"] += localLabourQuery[0].electrician * durationQuery[0].electrician;
	    retObj["price"] += localLabourQuery[0].manualLabour * durationQuery[0].manLab;

	    if(req.body.verbose == 1 && auth.lvl == 1){
		retObj["plumber"] = localLabourQuery[0].plumber * durationQuery[0].plumber;
		retObj["electrician"] = localLabourQuery[0].electrician * durationQuery[0].electrician;
		retObj["manual labour"] = localLabourQuery[0].manualLabour * durationQuery[0].manLab;
	    }
	    
	    
	}
    }catch(err){
 	console.error(err);
 	retObj["error"] = "unable to calculate labour data";
 	return res.send(retObj);
    }

    retObj["order"] = req.body.data;
    res.send(retObj);
});

app.listen(port, () => {
    console.log('Server is running on port '+port);
});


function query(q){
    return new Promise((resolve, reject)=>{
 	con.query(q, (err, result, fields)=>{
 	    if(err) return reject(new Error(err))
 	    resolve(result);
 	});
    });
    
}

//function to authenticate cookies with requests
//returns obj {auth, privilege} where auth >= 1 authenticated, 0 = not authenticated and privilege refers to their privilege lvl in the db
//lower number == higher privilege
function authenticate(username, password){
    
    if(!(username && password)) return {auth:0, lvl:0};
    
    return new Promise((resolve, reject) => {
 	con.query("SELECT * FROM users WHERE email = '" + username + "'",   (err, result, fields) => {	
 	    
 	    if(err) return reject(err);
 	    if(result.length < 1)  resolve({auth:0, lvl:0});
 	    
 	    result = JSON.parse(JSON.stringify(result)); //turns annoying sql object into json
 	    
 	    for(var key in result){
 		var hash = crypto.createHash("sha256");
 		var hString = hash.update(result[key].password).digest("hex");
 		
 		
 		if(result[key].email == username && hString == password){
 		    console.log("AUTHENTICATED AS "+ result[key].email);
 		    resolve({auth: 1, lvl:result[key].privilege});
 		}
 	    }
 	    
 	    
 	    resolve({auth:0, lvl:0});
 	    
 	});
 	
	
	
    });
    
}

/*
//create a server object:
http.createServer(function (req, res) {
var con = mysql.createConnection({
host: "db",
user: "php",
password: "Jellyfish9@",
database: "RedFin"
});

con.connect(function(err){
if(err) throw err;
console.log("Database connected");
});

if(req.url == "/quotegen"){
var obj = {"sucess":"400|amt|item"};
console.log(req.trailers)
res.write(JSON.stringify(obj)); //write a response to the client	
res.end(); //end the response
}else if(req.url =="/auth"){
var authres = auth(req.headers.cookie);
res.write();
res.end();
}else{
res.end();
}


}).listen(81); //the server object listens on port 81

function auth(cookies){

}*/
