function submit(){
    $.post("/newuser-data",
	   {
	       nonce:$("#exampleInputEmail1").attr("data-uid"),
	       user:$("#exampleInputEmail1").val(),
	       pass:$("#exampleInputPassword1").val(),
	       passCheck: $("#exampleInputPassword2").val()
	   })
	.done(function(data){
	    console.log(data);
	    if(data.error){
		if(data.error.type == "Password"){ //username gets validated first. Invalid password implies valid username
		    $("#exampleInputEmail1").removeClass("is-invalid");
		    $("#exampleInputEmail1").addClass("is-valid");
		    $("#passwordFeedback").html(data.error.msg);
		    $("#exampleInputPassword2").addClass("is-invalid");
		    $("#exampleInputPassword1").addClass("is-invalid");
		}else if(data.error.type == "Username"){
		    $("#exampleInputEmail1").addClass("is-invalid");
		    $("#emailFeedback").html(data.error.msg);
		}
		else{
		    $("#generalFeedback").css("display", "block");
		    $("#generalFeedback").html(data.error.msg);
		}
	    }
	});
}
