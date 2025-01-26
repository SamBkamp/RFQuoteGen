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

//validate input actually got posted
if(!isset($_POST["email"]) || !isset($_POST["pw"])){
  echo("insuficient details");
  die();
}

$hashedPass; //used to set auth cookie

$sql = "SELECT * FROM `users`";
$result = $conn->query($sql);
$auth = false;

while($row = $result->fetch_assoc()){
  if($row["email"] == $_POST["email"] && $row["password"] == hash("sha256", $_POST["pw"] . $row["date"])){
    $auth = true;
    $hashedPass = hash("sha256", $_POST["pw"] . $row["date"]);
  }
}

if($auth){
  setcookie('userauth', hash("sha256", $hashedPass), time() + (86400 * 30), "/");
  setcookie('username', $_POST["email"], time() + (86400 * 30), "/");
  echo("verified");
}else{
  echo("nuh uh");
}





?>