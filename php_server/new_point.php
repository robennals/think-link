<?php

require_once 'common.php';

$text = postarg("text");
$topictxt = postarg("topic");
$topicid = postarg("topicid");

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

if(!$topicid && $topictxt){
	$row = sql_to_row("SELECT id FROM topics WHERE txt = '$topictxt';");
	if($row != NULL){
		$topicid = mysql_insert_id();
	}else{
		sql_query("INSERT INTO topics (txt,user_id) VALUES ('$topictxt','$user');");
		$topicid = mysql_insert_id();
	}
}

sql_query("INSERT INTO points (txt,user_id) VALUES ('$text',$user);");
$pointid = mysql_insert_id();

if($topicid){
	sql_query("INSERT INTO point_topics (point_id,topic_id) VALUES ('$pointid','$topicid')");
}

json_out($pointid);
?>
