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

$cls = postarg("cls");
$id = postarg("id");
$parcls = postarg("parcls");
$parentid = postarg("parentid");

if($cls == "Topic" && $parcls == "Topic"){
	$oldrow = sql_to_row("SELECT * FROM topic_links WHERE parent_id = '$parentid' && child_id = '$id';");
	sql_query("DELETE FROM topic_links WHERE parent_id = '$parentid' && child_id = '$id';");
	$oldtable = "topic_links";
}

if($cls == "Point" && $parcls == "Topic"){
	$oldrow = sql_to_row("SELECT * FROM point_topics WHERE topic_id = '$parentid' && point_id = '$id';");
	sql_query("DELETE FROM topic_links WHERE topic_id = '$parentid' && point_id = '$id';");
	$oldtable = "point_topics";
}

if($cls == "Point" && $parcls == "Point"){
	$oldrow = sql_to_row("SELECT * FROM point_links WHERE point_a_id = '$parentid' && point_b_id = '$id';");
	sql_query("DELETE FROM topic_links WHERE topic_id = '$parentid' && point_id = '$id';");
	$oldtable = "point_links";
}

$oldid = $oldrow['id'];
$data = json_encode($oldrow);

sql_query("INSERT INTO history (user_id,table_name,logaction,row_id,json_data) VALUES ($user,'$oldtable','remove','$oldid','$data');");


echo "\n";

json_out($id);

?>
