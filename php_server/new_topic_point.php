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

$topicid = postarg("topicid");
$pointid = postarg("pointid");

sql_query("INSERT INTO point_topics (point_id,topic_id,user_id) VALUES ('$pointid','$topicid',$user)");

echo "\n";

json_out($topicid);

?>