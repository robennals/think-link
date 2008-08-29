<?php

require_once 'common.php';

$email = $HTTP_COOKIE_VARS["username"]; 
$pass = $HTTP_COOKIE_VARS["password"];
if(!$email){
	$email = postarg("username");
	$pass = postarg("password");
}
// check user and password
$user = getUser($email,$pass);

$parentid = postarg("parentid");
$txt = postarg("txt");

sql_query("INSERT INTO topics (txt,user_id) VALUES ('$txt',$user)");
$topicid = mysql_insert_id();

if($parentid){
	sql_query("INSERT INTO topic_links (parent_id, child_id, user_id) VALUES ($parentid,$topicid,$user)");
}

echo "\n";

json_out($topicid);

?>