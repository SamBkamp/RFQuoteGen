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

$email = $_POST["email"];
$pw = $_POST["pw"];

if(!isset($_POST["email"]) || !isset($_POST["pw"])){
  echo("insuficient details");
 
}else{
  $pass = hash("sha256", $pw . date("Y-m-d"), false);

  $sql = "INSERT INTO `users` (`email`, `password`, `privilege`, `date`) VALUES ('".$email."', '".$pass."', '1', '".date("Y-m-d")."')";
  $res;
  
  if ($conn->query($sql) === TRUE) {
    $res = "New record created successfully";
  } else {
    $res = "Error: " . $sql . "<br>" . $conn->error;
  }
  
}


?>


<!DOCTYPE html>
<html>
<head>
</head>
<body>
<?php
echo(date("Y-M-D H-i-s"));
echo($res);
?>
<form method="POST" action="index.php">
<input type="text" placeholder="email" name="email"/>
<input type="text" placeholder="pw" name="pw"/>
<input type="submit" name="submit" value="yeag">
</form>
</body>
</html>