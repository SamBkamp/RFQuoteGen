$(document).ready(function(){
    $("#loginSpinner").hide();
});
    
$(document).on("keydown", function(event){
    if(event.which == 13){
	loginSend();
    }
});


function loginSend(){
    $("#loginSpinner").show();
    $.post("/admin/login-data",
	   {
	       email: $("#emailField").val(),
	       pw: $("#pwField").val()
	   },
	   function(data, status){
	       $("#loginSpinner").hide();	     
	       if(data == "verified"){		   
		   window.location.replace("/admin");
	       }else{
		   $("#responseArea").text("Incorrect username/password combination");
		   $("#pwField").addClass("is-invalid");
		   $("#emailField").addClass("is-invalid");
	       }
	   }
	  );

}
