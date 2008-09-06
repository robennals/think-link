<?php

require_once 'common.php';

$text = postarg("text");
$topictxt = postarg("topic");
$topicid = postarg("topicid");
$parentid = postarg("parentid");
$supportid = postarg("supportid");
$opposeid = postarg("opposeid");

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

if($opposeid){
	sql_query("INSERT INTO point_links (point_a_id, point_b_id, howlinked, user_id) VALUES ($pointid,$opposeid,'opposes',$user)");
}

if($supportid){
	sql_query("INSERT INTO point_links (point_a_id, point_b_id, howlinked, user_id) VALUES ($pointid,$supportid,'supports',$user)");
}

if($topicid){
	sql_query("INSERT INTO point_topics (point_id,topic_id,user_id) VALUES ('$pointid','$topicid','$user')");
}

sql_query("INSERT INTO bookmark_points (point_id,user_id) VALUES ('$pointid','$user');");

json_out($pointid);

?>
