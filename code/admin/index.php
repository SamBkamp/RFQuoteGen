<?php

//this will validate the login cookies for ADMIN ONLY
//TODO change the name so its clear this is for ADMIN only
require "validate.php";

//validated



?>


<!DOCTYPE html>
<html>
<head>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
<link rel="stylesheet" href="style.css">
</head>
<body data-bs-theme="dark">
  
<!-- Modal -->
<div class="modal fade" id="userInvite" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="exampleModalLabel">Invite a user</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="input-group mb-3">
  <label class="input-group-text" for="inputGroupSelect01">Role</label>
  <select class="form-select form-floating" id="inputGroupSelect01">
    <option selected>Choose role</option>
  <option value="1">Admin</option>
    <option value="2">Moderator</option>
    <option value="3">User</option>
  </select>
</div>
  <div class="input-group mb-3">
  <input type="text" class="form-control" placeholder="invite link" aria-describedby="basic-addon1" id="linkField" value="" disabled>
  <button class="input-group-text btn btn-outline-secondary" id="basic-addon1" onclick="cpyLink()">copy</button>
</div>
  <button type="button" class="btn btn-primary" id="linkbtn" onclick="linkCreate()">Generate link</button>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
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
        <a class="nav-link active text-light" href="#" id="usersTab">Users</a>
      </li>
      <li class="nav-item">
        <a class="nav-link text-light" href="#" id="productTab">Products</a>
      </li>
  <li class="nav-item">
        <a class="nav-link text-light" href="../" >Back to app</a>
      </li>
    </ul>
  <span class="navbar-text">
  Howdy, <?php echo($name);?>
  </span>

  </div>
  </div>
</nav>
  <!-- HEADER ENDS --!>

  <div class="container mt-4" data-bs-theme="dark">
  <p id="userHeading" class="display-6 d-inline mb-3">Users</p>
  <button class="btn btn-primary float-sm-end d-inline mb-3" id="invbtn" data-bs-toggle="modal" data-bs-target="#userInvite">Invite user</button>
  <div id="responseTable" class="justify-content-center"></div>

  <div id="loadSymbol" class="spinner-border text-muted position-relative start-50"></div>
  </div>


<script type="text/javascript" src="https://code.jquery.com/jquery-3.7.1.js"></script>
  
<script src=" https://cdn.jsdelivr.net/npm/js-cookie@3.0.5/dist/js.cookie.min.js "></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
<script src="script.js"></script>                 
</body>
</html>
