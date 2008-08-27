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

$pointid = postarg("pointid");
$topicid = postarg("topicid");
$opposeid = postarg("opposeid");
$supportid = postarg("supportid");
$pagetitle = postarg("title");
$sniptext = postarg("txt");
$pointname = postarg("pointname");
$url = postarg("url");
$urlreal = postarg("realurl");


if(!$pointid){
	sql_query("INSERT INTO points (txt,user_id) VALUES ('$pointname',$user)");
	$pointid = mysql_insert_id();
	
	if($topicid){
		sql_query("INSERT INTO point_topics (point_id, topic_id, user_id) VALUES ($pointid,$topicid,$user)");	
	}
	
	if($opposeid){
		sql_query("INSERT INTO point_links (point_a_id, point_b_id, howlinked, user_id) VALUES ($pointid,$opposeid,'opposes',$user)");
	}

	if($supportid){
		sql_query("INSERT INTO point_links (point_a_id, point_b_id, howlinked, user_id) VALUES ($pointid,$opposeid,'supports',$user)");
	}
}


$summary = getSummary($url,$pagetitle);
$source = $summary['sourceid'];
$title = $summary['title'];

sql_query("INSERT INTO snippets (url,url_real,txt,user_id,pagetitle,title,source_id,point_id) VALUES ('$url','$urlreal','$sniptext',$user,'$pagetitle','$title','$source','$pointid')");
$snippetid = mysql_insert_id();	

echo "\n";

json_out($snippetid);

?>