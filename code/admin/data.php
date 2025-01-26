<?php
if(!isset($_POST["auth"])){
  echo "ERROR: AUTH NOT SUPPLIED";
  die();
}

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

$privLvl;
//check if cookie corresponds to valid account
$sql = "SELECT * FROM `users` WHERE `privilege` < 3";
$result = $conn->query($sql);
$auth = false;


while($row = $result->fetch_assoc()){
  $pass = hash("sha256", $row["password"]);
  if($_POST["auth"] == $pass){
    $privLvl = $row["privilege"];
    $auth = true;
    break;
  }
}

if(!$auth){
  echo "ERROR: AUTH ERROR";
  die();
}

$res = array();

if($_POST["data"] == "users"){
  $sql = "SELECT * FROM `users`";
  $result = $conn->query($sql);  
  
  
  while($row = $result->fetch_assoc()){
    $privilegeWord = "error";
    switch($row["privilege"]){
    case "1":
      $privilegeWord = "admin";
      break;
    case "2":
      $privilegeWord = "moderator";
      break;
    case "3":
      $privilegeWord = "user";
      break;
    }
    $res[$row["email"]] = $row["date"] . "," . $privilegeWord . "," . $row["id"];
  }

  echo(json_encode($res));
  
}
  
if($_POST["data"] == "products"){
  $sql = "SELECT * FROM `products`";
  $result = $conn->query($sql);
  $res = array();
  
  
  while($row = $result->fetch_assoc()){
    $res[$row["name"]] = $row["mul"] . "," . $row["constant"];
  }
  
  echo(json_encode($res));

}

if($_POST["data"] == "deluser"){
  $sql = "DELETE FROM `users` WHERE id=".$conn->real_escape_string($_POST["user"]).";";
  $result = $conn->query($sql);

  $sql = "SELECT * FROM `users`";
  $result = $conn->query($sql);  
  
  
  while($row = $result->fetch_assoc()){
    $privilegeWord = "error";
    switch($row["privilege"]){
    case "1":
      $privilegeWord = "admin";
      break;
    case "2":
      $privilegeWord = "moderator";
      break;
    case "3":
      $privilegeWord = "user";
      break;
    }
    $res[$row["email"]] = $row["date"] . "," . $privilegeWord . "," . $row["id"];
  }
  
  echo(json_encode($res));
  
}


if($_POST["data"] == "invUser"){
  if($privLvl != 1){
    echo "AUTH ERROR, YOU CANT DO THAT";
    die();
  }

  //this is really stupid but its the easiest way to do this I think
  //random id for invites, base16, 5 digits
  $letters = ["A","B","C","D","E","F"];
  $uuid = "";
  
  for($i = 0; $i < 5; $i++){
    $ranNum = rand(0, 15);
    if($ranNum > 9){
      $ranNum -= 10;
      $ranNum = $letters[$ranNum];
    }

    $uuid = $uuid . $ranNum;
  }

  $sql = "INSERT INTO `invitelinks` (`uid`) VALUES ('" . $uuid . "');";
  $result = $conn->query($sql);

  if($result){
    echo($uuid);
  }else{
    echo($result);
  }
    

  
}

?>