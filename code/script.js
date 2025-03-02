$( document ).ready(()=>{ //init function
    getItems("Themes", $("#theme"));
    getItems("Skids", $("#filter"));
    getItems("Stands", $("#aluSel"));
    getItems("Countries", $("#countrySelect"));
    getItems("Margins", $("#marginSelect"));
})


function formattedNum(num){ //turns an int into a formatted string (2300 -> 2,300)
    var finalString = "";
    num = num.toString();
    for(var i = num.length-1; i >= 0; i--){
	finalString = num[i] + finalString;
	if((i-num.length)%3 == 0 && i > 0) finalString = "," + finalString;
    }
    return finalString;
}


var returnModal  = new bootstrap.Modal(document.getElementById('returnModal'), {
  keyboard: false
});

$("#sendCalc").on("click", function(){   

    
    var dataToSend = {};
    
    var tanks = $("#addNewTank").children();


    var tankList = {}
    for(var i = 0; i < tanks.length - 1; i++){
	//console.log($(tanks[i]).children()[0].value);
	//tankList["tank"+i] = $(tanks[i]).children()[0].value;
	tankList["tank"+i] = $($(tanks[i]).children()[0]).attr("data-tank-data");
	//tankList["tank"+i] = $($(tanks[i]).children()[0])).attr("data-tank-data");
    }

    dataToSend["tanks"] = tankList;
    dataToSend["client"] = "test LtD.";
    
    
    dataToSend["countryID"] = $("#countrySelect :selected").val();
    dataToSend["marginID"] = $("#marginSelect :selected").val();
    dataToSend["pmDays"] = $("#pmDays").val();
    dataToSend["imDays"] = $("#imDays").val();
    dataToSend["plumberDays"] = $("#pDays").val();
    dataToSend["electricianDays"] = $("#eDays").val();
    dataToSend["manLabDays"] = $("#mlDays").val();
    
    
    console.log(dataToSend);
    
    var stringedData = JSON.stringify(dataToSend);
    
    $.post("/process/quotegen",
	   {
	       data: stringedData,
	       test: true //REMOVE IN PROD LOL
	   },
	   function(data, status){
	       if(data["error"]) $("#responseArea").text(data["error"]);
	       else if(data["success"]) getTotal(data["oid"])
	       console.log(data);
	   });
});

function getTotal(v = 0, oid = 59){
    $.post("/process/getNumber", {data:oid, verbose:v},
	   function(data, status){
	       console.log(data);
	       var n = formattedNum(data["price"]);
	       $("#modalMain").text(n);
	       returnModal.toggle();
	   });
}

function genPDF(){
    var win = window.open("/genPDF.php", '_blank');
}

function getItems(name, element){
    element.html("");
    $.post("/process/get-"+name,

	   function(data, status){
	       var repData = JSON.parse(data);
	       for(key in repData){
		   var choice = $("<option value="+repData[key].id+">"+repData[key].name+"</option>");
		   element.append(choice);
	       }
	   }
	   
	  );    
}



$("#addNewTank").on("mouseenter", ".tankRow input, .tankRow span", (e)=>{
    $(e.target).parent().children().last().css("display", "inline-block");
    //console.log($(e.target).next().css("display", "inline-block"));
}).on("mouseleave", ".tankRow input, .tankRow span", (e)=>{
    $(e.target).parent().children().last().css("display", "none");
    //console.log($(e.target).next().css("display", "none"));
});


function enable(id){
    $("#"+id).prop('disabled', !($("#"+id).prop('disabled')));
    $("#"+id).val("");
}

function addTank(){ //this function SUCKS and im sure itll break at some point

    var buffer = 0;
    var finalString = "$0x$1x$2x$3 | $4x$5x$6 $7 | $8 | $9";
    var dataString = "$0 $1 $2 $3|$4 $5 $6 $7|$8|$9";
    
    var tankData = $(".tankSize");
    for(var i = 0; i < 4; i++){
	finalString = finalString.replace("$"+(i+buffer), tankData[i].value);
	dataString = dataString.replace("$"+(i+buffer), tankData[i].value);
    }
    buffer+=4;

    var standData = $(".standSize");
    for(var i = 0; i < 3; i++){
	finalString = finalString.replace("$"+(i+buffer), standData[i].value);
	dataString = dataString.replace("$"+(i+buffer), standData[i].value);
    }
    
    finalString = finalString.replace("$7", standData[3][standData[3].value-1].innerText);
    dataString = dataString.replace("$7", standData[3][standData[3].value-1].value);
    
    finalString = finalString.replace("$8", $("#filter")[0][$("#filter").val()-1].innerText);
    dataString = dataString.replace("$8", $("#filter")[0][$("#filter").val()-1].value);
    
    finalString = finalString.replace("$9", $("#theme")[0][$("#theme").val()-1].innerText);    
    dataString = dataString.replace("$9", $("#theme")[0][$("#theme").val()-1].value);    
    
    

    

    var entity = $('<div class="tankRow mt-2"><input class="tankEntity ms-5" data-tank-data="'+dataString+'" style="width: 50%; text-align: center;" value = "'+finalString+'" disabled><span class="ps-1" style="cursor:pointer; display:none;"class="exit" onclick="removeTankItem(this)">&#x2715;</span></div></div>');

    $("#addNewTank").prepend(entity);
    
}


function removeTankItem(e){
    $(e).parent().remove();   
}
