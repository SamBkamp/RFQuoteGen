$( document ).ready(function(){

    $.post("/admin/get-users",
	   {	       
	       data: "users"
	   },
	   function(data, status){
	       displayUsers(data, status);
	   }
	  );
    
});


$("#productTab").click(function(){
    $("#userHeading").text("Products");
    $("#invbtn").text("add Product");
    $("#responseTable").empty();
    $("#loadSymbol").show();
    $.post("data.php",
	   {
	       auth: Cookies.get("userauth"),
	       data: "products"
	   },
	   function(data, status){
	       displayProd(data, status);
	   }
	  );
});


$("#usersTab").click(function(){
    $("#userHeading").text("Users");
    $("#invbtn").text("Invite User");
    $("#responseTable").empty();
    $("#loadSymbol").show();
    $.post("data.php",
	   {
	       auth: Cookies.get("userauth"),
	       data: "users"
	   },
	   function(data, status){
	       displayUsers(data, status);
	   }
	  );
});



//TODO: merge these two next functions into 1

function displayUsers(data, status){
    var info = "<table class='table table-striped table-dark table-responsive text-center'><tr><th>Email</th><th>date joined</th><th>privilege status</th><th></th></tr>";
    
    for (const key in data) {
	var user = data[key];
	var date = new Date(user.date);
	info = info + "<tr><td>" + user.email + "</td>";   
	info = info + "<td>" + `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}` + "</td><td>"+ user.privilege +"</td><td><button type=\"button\" onclick=\"delUser("+ user.id +")\"class=\"btn btn-outline-danger\">Delete User</button></td></tr>";
    }
    info = info + "</table>";
    $("#responseTable").html(info);
    $("#loadSymbol").hide();
}

function displayProd(data, status){
    var info = "<table class='table table-striped table-dark table-responsive text-center'><tr><th>name</th><th>multiplier</th><th>constant</th><th></th></tr>";
    
    for (const key in data) {
	userData = data[key].split(",");
	info = info + "<tr><td>" + key + "</td>";   
	info = info + "<td>" + userData[0] + "</td><td>"+userData[1]+"</td><td><button type=\"button\" class=\"btn btn-outline-danger\">Delete product</button></td></tr>";
    }
    info = info + "</table>";
    console.log(info);
    $("#responseTable").html(info);
    $("#loadSymbol").hide();
    
    
}

function delUser(id){
    $.post("data.php",
	   {
	       auth: Cookies.get("userauth"),
	       data: "deluser",
	       user: id
	   },
	   function(data, status){
	       displayUsers(data, status);
	   }
	  );
}

function linkCreate(){
    //very basic rate limiting thing
    if($("#linkField").val() != ""){
	return;
    }
    
    var role = $("#inputGroupSelect01").val();
    if(role == "1" || role == "2" || role == "3"){
	$.post("/admin/generate-user-link",
	   {	       
	       role: role
	   },
	       function(data, status){
		   $("#linkField").val(window.location.hostname + "/newuser?uid="+ data);
		   $("#linkbtn").text("✓");
		   $("#linkbtn").removeClass("btn-primary");
		   $("#linkbtn").addClass("btn-success");
		   $("#inputGroupSelect01").removeClass("is-invalid");
		   $("#basic-addon1").addClass("btn-primary");
		   $("#basic-addon1").removeClass("btn-outline-secondary");		   
		   
	   }
	  );
    }else{
	$("#inputGroupSelect01").addClass("is-invalid");
    }
}


function cpyLink(){
    navigator.clipboard.writeText($("#linkField").val()).then(function () {
    }, function () {
	
    });
}


//reset the modal dialog to default values when the role selected is changed, this is to allow the user to generate a new link for a different user or even the same one under a new role
$('#inputGroupSelect01').on('change', function() {
    $("#linkField").val("");
    $("#linkbtn").text("Generate link");
    $("#linkbtn").removeClass("btn-success");
    $("#linkbtn").addClass("btn-primary");
    $("#basic-addon1").addClass("btn-outline-secondary");
    $("#basic-addon1").removeClass("btn-primary");		   
    
});
