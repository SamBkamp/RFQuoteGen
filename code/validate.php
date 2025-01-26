<?php
if(!isset($_COOKIE["userauth"])){
  header("Location: login");
  die();
}


$servername = "db";
$username = "php";
$password = "Jellyfish9@";
$dbname = "RedFin";


$name;
// Create connection
$conn = mysqli_connect($servername, $username, $password, $dbname);

// Check connection
if (!$conn) {
  die("Connection failed: " . mysqli_connect_error());
}


//check if cookie corresponds to valid account
$sql = "SELECT * FROM `users`";
$result = $conn->query($sql);
$auth = false;


while($row = $result->fetch_assoc()){
  $pass = hash("sha256", $row["password"]);
  if($_COOKIE["userauth"] == $pass){
    $auth = true;
    $name = $row["email"];
    break;
  }
}

if(!$auth){
  header("Location: login");
  die();
}

?>