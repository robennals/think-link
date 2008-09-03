<?php

require_once 'common.php';

$text = postarg("text");
$topictxt = postarg("topic");
$topicid = postarg("topicid");
$parentid = postarg("parentid");

if(!$topicid){
	$topicid = $parentid;
}
if(!$text){
	$text = postarg("txt");
}
if(!$text){
	error("no text");
}

$email = $HTTP_COOKIE_VARS["username"]; 
$pass = $HTTP_COOKIE_VARS["password"];
if(!$email){
	$email = postarg("username");
	$pass = postarg("password");
}

// check user and password
$user = getUser($email,$pass);


sql_query("INSERT INTO points (txt,user_id) VALUES ('$text',$user);");
$pointid = mysql_insert_id();

if($topicid){
	sql_query("INSERT INTO point_topics (point_id,topic_id,user_id) VALUES ('$pointid','$topicid','$user')");
}

json_out($pointid);

?>
