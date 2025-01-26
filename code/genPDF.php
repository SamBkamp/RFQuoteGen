<?php
session_start(); 


?>


<!DOCTYPE html>

<html>
<head>
<link rel="stylesheet" href="genPDFStyle.css">
</head>
<body>
<div id="page">
  <h1 id="title">Quote - Client Name</h1>
  <h3 id="subtitle">Date</h3>
<table>
<thead>
  <tr>
    <th>Group</th>
    <th>Item</th>
    <th>Quantity</th>
    <th>Sub Total</th>
  </tr>
</thead>
<tbody>
<?php
$data = json_decode($_SESSION["quoteData"]);
foreach($data as $key => $val){
  $d = explode("|", $val); //delimit results
  echo("<tr>");
  echo("<td>".$key."</td>");
  echo("<td>".$d[2]."</td>");
  echo("<td>".$d[1]."</td>");
  echo("<td>".$d[0]."</td>");
  echo("</tr>");
}
?>

</tbody>
</table>
</div>
</body>
</html>