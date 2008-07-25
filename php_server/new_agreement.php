<?php

require_once 'common.php';


$email = $HTTP_COOKIE_VARS["username"]; 
$pass = $HTTP_COOKIE_VARS["password"];


$pointid = postarg("point_id");
$agree = postarg("agree"); 

// check user and password
$user = getUser($email,$pass);

sql_query("INSERT INTO point_agreements (point_id,user_id,agree) VALUES ($pointid,$user,$agree) ON DUPLICATE KEY UPDATE agree=$agree;");
json_out(true);
?>

