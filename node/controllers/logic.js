var db = require("./db.js")
var SqlString = require('sqlstring');
const crypto = require("crypto");

var test = async (req, res)=>{
    res.send("elmao");
}

var getOptions = async (req, res)=>{        
    var auth = await db.authenticate(req.cookies.username, req.cookies.userauth, true);
        
    if(!auth){
 	res.send("authentication failure");
    }
    
    var q = SqlString.format("SELECT id, name FROM ??", [req.params.value]);

    var test = await db.query(q);
    res.send(JSON.stringify(test));
}

var getNumber = async (req, res)=>{

    var retObj = {};
    res.setHeader('content-type', 'application/json');
    
    //check cookie auth
    var auth = await db.authenticate(req.cookies.username, req.cookies.userauth, true);   
    if(!auth){
 	return res.send({"error": "authentication failure"});	
    }
    
    var q = "SELECT * FROM `Tanks` WHERE OID="+SqlString.escape(req.body.data)+";";
    var tanksData;
    retObj["price"] = 0;
    try{//get tanks 
 	var tQuery = await db.query(q);
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
 	    var dbquery = await db.query(q); //TODO add clause to check if specific SID was already queried in this order to avoid querying the same data twice
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
 	    var priceConstant = 10; //PRICE in USD per cm^3 of material TODO: this has to be set externally or something, db perchance
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
 	    var dbquery = JSON.parse(JSON.stringify(await db.query(q)));
 	    
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
 	var durationQuery = JSON.parse(JSON.stringify(await db.query(q))); //for labour days
 	
 	q = "SELECT pName, rate FROM RFStaff";
 	var rateQuery = JSON.parse(JSON.stringify(await db.query(q))); //for labour rate
	
 	rateQuery = rateQuery.reduce((acc, curr)=>{ //remove outer array shell
 	    acc[curr.pName] = curr.rate; //curr is the current element of rateQuery
 	    return acc; //acc is passed onto each iteration then finally passed back to tanksData
 	}, {}); //{} is initial value of acc 
	
 	//id is PK so durationQuery will only ever return 1 row
 	retObj["price"] += (durationQuery[0].pmDays * rateQuery["Project Manager"]) + (durationQuery[0].imDays * rateQuery["Installation Manager"]);	
	if(req.body.verbose == 1 && auth.lvl == 1){
	    retObj["PM"] = (durationQuery[0].pmDays * rateQuery["Project Manager"]);
	    retObj["IM"] = (durationQuery[0].imDays * rateQuery["Installation Manager"]);
	}
	//local labour
	//only make requests if they actually have days to calculate
	q = "SELECT plumber, electrician, manualLabour, expenditure FROM `Countries` WHERE id="+SqlString.escape(durationQuery[0].CID)+";";
	var localLabourQuery = JSON.parse(JSON.stringify(await db.query(q)));
	
	retObj["price"] += localLabourQuery[0].plumber * durationQuery[0].plumber +
	    localLabourQuery[0].electrician * durationQuery[0].electrician +
	    localLabourQuery[0].manualLabour * durationQuery[0].manLab +
	    durationQuery[0].pmDays * localLabourQuery[0].expenditure +
	    durationQuery[0].imDays * localLabourQuery[0].expenditure;
	

	if(req.body.verbose == 1 && auth.lvl == 1){
	    retObj["plumber"] = localLabourQuery[0].plumber * durationQuery[0].plumber;
	    retObj["electrician"] = localLabourQuery[0].electrician * durationQuery[0].electrician;
	    retObj["manual labour"] = localLabourQuery[0].manualLabour * durationQuery[0].manLab;
	    retObj["PM"] += durationQuery[0].pmDays * localLabourQuery[0].expenditure;
	    retObj["IM"] += durationQuery[0].imDays * localLabourQuery[0].expenditure;
	    
	}
	
	
	
    }catch(err){
 	console.error(err);
 	retObj["error"] = "unable to calculate labour data";
 	return res.send(retObj);
    }

    retObj["order"] = req.body.data;
    res.send(retObj);

}

var quoteGen = async (req, res)=>{

     	res.setHeader('content-type', 'application/json');
	
    var auth = await db.authenticate(req.cookies.username, req.cookies.userauth, true);
 	var retObj = {};
 	
 	if(!auth){
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
 	    var t = await db.query(genOrder);
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
 		var tQuery = await db.query(tankOrder);
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
 		await db.query(standQuery);
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

}

var main = async (req, res) => {
    var auth = await db.authenticate(req.cookies.username, req.cookies.userauth, true);   
    if(!auth){
 	return res.redirect("/login");
    }
    res.render("index")
}

var loginPage = (req, res) => {
    return res.render("login/index");
}

var loginData = async (req, res) =>{ //for non admin dash
    var auth = await db.authenticate(req.body.email, req.body.pw, false);

    if(auth){
	res.cookie("username", req.body.email, { maxAge: 900000, httpOnly: true });
	res.cookie("userauth", db.hashText(db.hashText(req.body.pw)), { maxAge: 900000, httpOnly: true });
	res.send("verified");
    }
    else res.send(auth);
        
}

var admin = async (req, res)=>{
    var auth = await db.authenticate(req.cookies.username, req.cookies.userauth, true);   
    if(!auth || auth.lvl > 2){
 	return res.redirect("/admin/login");
    }

    res.render("admin/index", {name: req.cookies.username});
}

var adminLogin = (req, res)=>{
    res.render("admin/login");
}

var adminLoginData = async (req, res) => {
    var auth = await db.authenticate(req.body.email, req.body.pw, false);
    
    if(auth && auth.lvl < 2){
	res.cookie("username", req.body.email, { maxAge: 900000, httpOnly: true });
	res.cookie("userauth", db.hashText(db.hashText(req.body.pw)), { maxAge: 900000, httpOnly: true });
	res.send("verified");
    }
    else res.send(false);
}

var adminDashData = async (req, res) => {
    var auth = await db.authenticate(req.cookies.username, req.cookies.userauth, true);
    //    var q = SqlString.format("SELECT id, name FROM ??", [req.params.value]);
    
    if(auth && auth.lvl < 2){
	var q = SqlString.format("SELECT id, date, email, privilege FROM ??", [req.params.value]);
	try{
	    var d = await db.query(q);
	    console.log(d);
	    res.setHeader("content-type", "text/json");
	    return res.send(d);
	}catch (err){
	    console.error(err);
	    return res.send({error: "DB error"});
	}
    }

    return res.send({error: "invalid auth"});
};


var generateUserLink = async (req, res) => {
    var auth = await db.authenticate(req.cookies.username, req.cookies.userauth, true);

    if(auth && auth.lvl < 2){
	var d = new Date();
	var q = SqlString.format("INSERT INTO invitelinks (privilege, date) VALUES(?, ?)", [req.body.role, `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`]);
	try {
	    var query = await db.query(q);
	    return res.send(`${query.insertId.toString(16)}`)
	}catch (err){
	    console.error(err);
	    return res.send({"error":"DB error"});
	}
    }

    return res.send("auth invalid")
}

var newUser = async (req, res) => {

    try{
	var q = await db.query(SqlString.format("SELECT * FROM invitelinks WHERE id=?", [parseInt("0x"+req.query.uid)]));
	if(q.length < 1)
	    res.render("newuser", {"nonce": false})
	//there should be 1 and only 1 result if the nonce exists, no need to check the actual value, SQL query already does that
	else
	    res.render("newuser", {"nonce": req.query.uid});
    } catch (err){
	
    }
}

var newUserData = async (req, res) => {
    res.setHeader("content-type", "text/json");
    
    if(!req.body.nonce) return res.send({"error":{"type": "System Error", "msg":"Your link is invalid"}})

    //checks nonce
    try{
	var q = await db.query(SqlString.format("SELECT * FROM invitelinks WHERE id=?", [parseInt("0x"+req.body.nonce)]));
	if(q.length < 1) return res.send({"error":{"type": "System Error", "msg":"Your link is invalid"}}) //there should be 1 and only 1 result if the nonce exists, no need to check the actual value, SQL query already does that
	
	var expiry = new Date(new Date(q[0].date).valueOf());
	expiry.setDate(expiry.getDate() + 30);	  
	
	if(q[0].id != parseInt("0x"+req.body.nonce) || Date() > expiry)
	    return res.send({"error":{"type": "System Error", "msg":"Your has expired"}});
	
    } catch (err){
	return res.send({"error":{"type": "System Error", "msg":"DB error"}});
    }
	

    //username validation
    if(!req.body.user)
	return res.send({"error": {"type": "Username", "msg":"Please add username"}});
    
    //pw validation
    if(req.body.pass != req.body.passCheck || req.body.pass == "")
	return res.send({"error":{"type":"Password", "msg":req.body.pass ? "Passwords don't match" : "Invalid password"}});
    
    return res.send({"success":"success"});
					 
}

exports.quoteGen = quoteGen;
exports.getNumber = getNumber;
exports.getOptions = getOptions;
exports.test = test;
exports.main = main;
exports.loginPage = loginPage;
exports.loginData = loginData;
exports.admin = admin;
exports.adminLogin = adminLogin;
exports.adminLoginData = adminLoginData;
exports.adminDashData = adminDashData;
exports.generateUserLink = generateUserLink;
exports.newUser = newUser;
exports.newUserData = newUserData;
