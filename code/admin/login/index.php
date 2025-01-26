<?php



$servername = "db";
$username = "php";
$password = "Jellyfish9@";
$dbname = "RedFin";


// Create connection
$conn = mysqli_connect($servername, $username, $password, $dbname);

// Check connection
if (!$conn) {
  die("Connection failed: " . mysqli_connect_error());
}

if(isset($_COOKIE["userauth"])){
  //check if cookie corresponds to valid account
  $sql = "SELECT * FROM `users` WHERE `privilege` < 3";
  $result = $conn->query($sql);
  $auth = false;


  while($row = $result->fetch_assoc()){
    $pass = hash("sha256", $row["password"]);
    if($_COOKIE["userauth"] == $pass){
      $auth = true;
      break;
    }
  }

  if($auth){
    header("Location: ../");
    die();
  }
}


?>

<!DOCTYPE html>
<html>
<head>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
<link rel="stylesheet" href="style.css">

</head>
<body data-bs-theme="dark">

<div class="card bg-primary" id="loginCard">
  <div class="card-header">
    RedFin Admin Panel - login
  </div>
  <div class="card-body">
<input type="text" placeholder="email" class="form-control" id="emailField">
<input type="password" placeholder="password" class="form-control mt-2" id="pwField">
<button onclick="login()" class="btn btn-outline-light mt-3" id="btn">
  <span class="spinner-border spinner-border-sm" id="loginSpinner" aria-hidden="true"></span>
  <span role="status">Submit</span>

  </button>


<p id="responseArea" class="mt-3 text-danger"></p>
</div>
  </div>
   
<script type="text/javascript" src="https://code.jquery.com/jquery-3.7.1.js"></script>
<script src="script.js"></script>                 
</body>
</html>