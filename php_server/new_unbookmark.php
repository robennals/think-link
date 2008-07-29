<?php

require_once 'common.php';

$email = $HTTP_COOKIE_VARS["username"]; 
$pass = $HTTP_COOKIE_VARS["password"];
if(!$email){
	$email = postarg("username");
	$pass = postarg("password");
}

$snipid = postarg("snippet");

// check user and password
$user = getUser($email,$pass);


sql_query("DELETE FROM bookmarks WHERE user_id=$user AND snippet_id=$snipid;");

json_out(true);

?>

