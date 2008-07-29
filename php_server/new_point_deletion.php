<?php

require_once 'common.php';

$email = $HTTP_COOKIE_VARS["username"]; 
$pass = $HTTP_COOKIE_VARS["password"];
if(!$email){
	$email = postarg("username");
	$pass = postarg("password");
}

$pointid = postarg("point");

// check user and password
$user = getUser($email,$pass);


sql_query("INSERT IGNORE INTO point_deletions (user_id,point_id) VALUES ($user,$pointid);");

json_out(true);

?>

