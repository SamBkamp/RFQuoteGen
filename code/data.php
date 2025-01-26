<?php
session_start(); 
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



//todo: scrubbing and dealing with exceptions/edge cases
$theme = (int)$_POST["theme"]; //1: ac, 2: live rock, 3: planted, 4: manual 
$subTheme = (int)$_POST["themeSub"];  //1 : 1side, 2: 2 side, 3: 1side + back, 4: 2side + back OR manual input depends on $theme
$filter = $_POST["filter"];
$tDim = $_POST["tDim"]; //H, W, D
$sDim = $_POST["sDim"]; //H, W, D


if($theme == "" || $tDim[0] == "" || $tDim[1] == "" || $tDim[2] == "" ||
   $sDim[0] == "" || $sDim[1] == "" || $sDim[2] == ""){
  echo("ERROR: not everything is filled");
  die();
}

//collect all items
$items = array();

$options = ["ac", "liverock", "planted"];

//add theme type TODO: combine this into 1 statement

array_push($items, $options[$theme-1]);
array_push($items, "alustand");
array_push($items, $filter);
//calculate themeing

$side = (int)$tDim[0] * (int)$tDim[2];
$back = (int)$tDim[1] * (int)$tDim[0];
$sum = 0;
if($subTheme % 2 ==  0){
  $sum += 2 * $side;
}else{
  $sum += $side;
}
if($subTheme > 2){
  $sum += $back;
}

$sum = $sum/100; //convert from cm^2 to m^2


$res = array(); //array containing all data to be sent back to client 

$sql = "SELECT name, mul, constant FROM products";
$result = $conn->query($sql);

//get decor, stand and skid cost
//$res["debug"] = "";
while($row = $result->fetch_assoc()){
  if(!in_array($row["name"], $items)){continue;} //unneeded row
  if($row["name"] == "ac"){
    $res["Decoration"] = ($sum*$row["mul"]) + $row["constant"] . "|1|Artificial Coral"; 
  }elseif($row["name"] == "alustand"){
    $res["Stand"] = round(((($sDim[0]*$sDim[1]*$sDim[2])/1000)*$row["mul"]) + $row["constant"], 2) . "|1|4040 Aluminium Stand";
  }elseif($row["name"] == $filter){
    $res["Filter"] = $row["mul"] . "|1|".$conn->real_escape_string($filter);
  }
  
}



$_SESSION["quoteData"] = json_encode($res);
  
echo(json_encode($res));

$conn->close();
 






?>