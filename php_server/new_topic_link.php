<?php

require_once 'common.php';
$email = $HTTP_COOKIE_VARS["username"]; 
$pass = $HTTP_COOKIE_VARS["password"];
if(!$email){
	$email = postarg("username");
	$pass = postarg("password");
}
$user = getUser($email,$pass);

$parentid = postarg("parentid");
$childid = postarg("childid");

sql_query("INSERT INTO topic_links (parent_id,child_id,user_id) VALUES ('$parentid','$childid',$user);");

json_out(true);