<?php
  session_start();
  require "validate.php"

  ?>
<!DOCTYPE html>
<html>

  <head>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <link rel="stylesheet" href="style.css">
  </head>

  <body data-bs-theme="dark">

   
    <!-- Modal -->
    <div class="modal fade" id="returnModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">

      <div class="modal-dialog">
	<div class="modal-content">
	  <div class="modal-header">
            <h1 class="modal-title fs-5" id="exampleModalLabel">Quote</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
	  </div>
	  <div class="modal-body" id="modalMain">
            ...
	  </div>
	  <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" onclick="genPDF()">Generate PDF</button>
	  </div>
	</div>
      </div>

    </div>

    
    <div class="modal fade" id="tankModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
	<div class="modal-content">
	  <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">Add Tank</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
            </button>
	  </div>
	  <div class="modal-body">


	    
	    <div class="modal" tabindex="-1">
	      <div class="modal-dialog">
		<div class="modal-content">
		  <div class="modal-header">
		    <h5 class="modal-title">Modal title</h5>
		    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
		  </div>
		  <div class="modal-body">
		    <p>Modal body text goes here.</p>
		  </div>
		  <div class="modal-footer">
		    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
		    <button type="button" class="btn btn-primary">Save changes</button>
		  </div>
		</div>
	      </div>
	    </div>


	    <!-- TANK SIZE-->
	    <h5>Tank Size</h5>
            <div class="row row-cols-2">
	      <div class="col input-group ts">
		<input type="text" class="form-control tankSize" placeholder="Height" aria-label="Height" aria-describedby="basic-addon2">
		<span class="input-group-text" id="basic-addon2">cm</span>
	      </div>
	      <div class="col input-group ts">
		<input type="text" class="form-control tankSize" placeholder="Width" aria-label="Width" aria-describedby="basic-addon2">
		<span class="input-group-text" id="basic-addon2">cm</span>
	      </div>
	      <div class="col input-group ts">
		<input type="text" class="form-control tankSize" placeholder="Depth" aria-label="Depth" aria-describedby="basic-addon2">
		<span class="input-group-text" id="basic-addon2">cm</span>
	      </div>
	      <div class="col input-group ts">
		<input type="text" class="form-control tankSize" placeholder="Thickness" aria-label="Thickness" aria-describedby="basic-addon2">
		<span class="input-group-text " id="basic-addon2">mm</span>
	      </div>


	      <!--Stand Size-->
	      <div class="row mt-3" style="width: 100%">
		<h5>Stand Size</h5>
	      </div>
              <div class="row row-cols-2" style="width: 100%">
		<div class="col input-group ts">
		  <input type="text" class="form-control standSize" placeholder="Height" aria-label="Height" aria-describedby="basic-addon2">
		  <span class="input-group-text" id="basic-addon2">cm</span>
		</div>
		<div class="col input-group ts">
		  <input type="text" class="form-control standSize" placeholder="Width" aria-label="Width" aria-describedby="basic-addon2">
		  <span class="input-group-text" id="basic-addon2">cm</span>
		</div>
		<div class="col input-group ts">
		  <input type="text" class="form-control standSize" placeholder="Depth" aria-label="Depth" aria-describedby="basic-addon2">
		  <span class="input-group-text" id="basic-addon2">cm</span>
		</div>
		<div class="col input-group ts">
		  <select class="form-select standSize" id="aluSel"></select>
		</div>
	      </div>

	      <!-- Filtration-->
	      <div class="row mt-3" style="width: 100%">
		<h5>Filtration</h5>
	      </div>
              <div class="row row-cols-2" style="width: 100%">
		<div class="col input-group">
		  <select class="form-select" id="filter"></select>  
		</div>
	      </div>
	      <!-- Theming-->
	      <div class="row mt-3" style="width: 100%">
		<h5>Theming</h5>
	      </div>
              <div class="row row-cols-2" style="width: 100%">
		<div class="col input-group">
		  <select class="form-select" id="theme"></select>  
		</div>

		
	      </div>
	      
	      
	    </div>
	  </div>
	  <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" data-bs-dismiss="modal" onclick="addTank()" class="btn btn-primary">Add</button>
	  </div>
	</div>
      </div>
    </div>
    
    <!--HEADER STARTS --!>
	
	<nav data-bs-theme="dark" class="navbar navbar-expand-lg bg-body-tertiary">
	  <div class="container-fluid">
	    <a class="navbar-brand text-light" href="#">RedFin Automation</a>

	    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
	      <li class="nav-item">
		<a class="nav-link text-light" href="/admin" id="productTab">Admin Portal</a>
	      </li>
	    </ul>
	    <span class="navbar-text">
	      Howdy, <?php echo($name);?>
	    </span>

	  </div>
</div>
</nav>
<!-- HEADER ENDS --!>
     
     
     <div class="container mt-3">
       <div class="row">
	 <h3>Tanks</h3>
       </div>
       <div class="row" id="addNewTank">

	 <button type="button"  class="btn btn-primary mt-2 ms-5" data-bs-toggle="modal" data-bs-target="#tankModal" style="width: 3%;">&plus;</button>
       </div>
       <div class="row mt-4">
	 <h3>Country</h3>
	 <select name="countries" id="countrySelect" class="ms-5" style="width: 30%";>  
	 </select>
       </div>
       <div class="row mt-4">
	 <h3>Labour</h3>
	 <h5 class="ms-3">RedFin Labour</h5>
	 <div class="row">
	   <div class=" input-group ms-5" style="width: 25%">
	     <span class="input-group-text">Project Manager</span>
	     <div class="input-group-text">
	       <input class="form-check-input mt-0" type="checkbox" value="" onclick="enable('pmDays')" aria-label="Checkbox for following text input">
	     </div>
	     <input type="number" class="form-control" placeholder="days" id="pmDays" disabled  aria-label="Text input with checkbox">
	   </div>
	 </div>
	 <div class="row mt-2">
	   <div class=" input-group ms-5" style="width: 25%">
	     <span class="input-group-text">Installation Manager</span>
	     <div class="input-group-text">
	       <input class="form-check-input mt-0" id="imCheck" type="checkbox" value="" onclick="enable('imDays')" aria-label="Checkbox for following text input">
	     </div>
	     <input type="number" class="form-control" placeholder="days" id="imDays" disabled  aria-label="Text input with checkbox">
	   </div>
	   
	 </div>
	 <h5 class="ms-3 mt-3">Local Labour</h5>
	 <div class="row">
	   <div class="row mt-2">
	     <div class=" input-group ms-5" style="width: 25%">
	       <span class="input-group-text">Plumber</span>
	       <div class="input-group-text">
		 <input class="form-check-input mt-0" id="imCheck" type="checkbox" value="" onclick="enable('pDays')" aria-label="Checkbox for following text input">
	       </div>
	       <input type="number" class="form-control" placeholder="days" id="pDays" disabled  aria-label="Text input with checkbox">
	     </div>
	   </div>

	   <div class="row mt-2">
	     <div class=" input-group ms-5" style="width: 25%">
	       <span class="input-group-text">Electrician</span>
	       <div class="input-group-text">
		 <input class="form-check-input mt-0" id="imCheck" type="checkbox" value="" onclick="enable('eDays')" aria-label="Checkbox for following text input">
	       </div>
	       <input type="number" class="form-control" placeholder="days" id="eDays" disabled  aria-label="Text input with checkbox">
	     </div>


	     <div class="row mt-2">
	       <div class=" input-group ms-5" style="width: 25%">
		 <span class="input-group-text">Manual Labour</span>
		 <div class="input-group-text">
		   <input class="form-check-input mt-0" id="imCheck" type="checkbox" value="" onclick="enable('mlDays')" aria-label="Checkbox for following text input">
		 </div>
		 <input type="number" class="form-control" placeholder="days" id="mlDays" disabled  aria-label="Text input with checkbox">
	       </div>
	     </div>
	   </div>
	 </div>
       </div>
       

       <div class="row mt-4">
	 <h3>Margin</h3>
	 <div class="row">
	   <select name="Margins" id="marginSelect" class="ms-5" style="width: 30%;">  </select>
	 </div>
       </div>
       

       <div class="row" id="btnRow">
	 <button id="sendCalc" class="btn btn-success mt-5" style="width: 7%;">submit</button>
       </div>
       <div class="row mt-3">
	 <p class="text-danger" id="responseArea"></p>
       </div>
       <!--LINK JQUERY-->
       <script type="text/javascript" src="https://code.jquery.com/jquery-3.7.1.js"></script>

       <!-- Bootstrap -->
       
       <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>

       
       <!--PERSONAL SCRIPT JavaScript-->
       <script type="text/javascript" src="script.js"></script>

       
</body>
</html>
