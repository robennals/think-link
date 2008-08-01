<?php

require_once 'common.php';

$email = $HTTP_COOKIE_VARS["username"]; 
$pass = $HTTP_COOKIE_VARS["password"];
if(!$email){
	$email = postarg("username");
	$pass = postarg("password");
}

$point = postarg("point"); // point id
$text = postarg("text"); // topic text

// check user and password
$user = getUser($email,$pass);

// get topic text id
$source = sql_to_array("SELECT id FROM topics WHERE txt='$text'");
if (empty($source)) { 
	sql_query("INSERT INTO topics (txt,user_id) VALUES ('$text',$user);"); // create new
	$sourceid = mysql_insert_id();
}
else $sourceid=$source[0]['id']; // use existing

$query = "INSERT INTO point_topics (topic_id,point_id,user_id) VALUES ($sourceid,$point,$user);";
sql_query($query);

json_out(true);
?>

