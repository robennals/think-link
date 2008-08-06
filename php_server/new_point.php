<?php

require_once 'common.php';

$text = postarg("text");
// $keywords = explode(" ",$text);


$email = $HTTP_COOKIE_VARS["username"]; 
$pass = $HTTP_COOKIE_VARS["password"];
if(!$email){
	$email = postarg("username");
	$pass = postarg("password");
}

// check user and password
$user = getUser($email,$pass);

$row = sql_to_row("SELECT id FROM points WHERE txt = '$text';");
if($row != NULL){
	json_out($row["id"]);
	exit;
}

sql_query("INSERT INTO points (txt,user_id) VALUES ('$text',$user);");

json_out(mysql_insert_id());
?>
