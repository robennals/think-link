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
$txt = postarg("txt");

if($cls == "Topic"){
	$oldrow = sql_to_row("SELECT txt FROM topics WHERE id = '$id';");
	$data = json_encode($oldrow);
	sql_query("INSERT INTO history (user_id,table_name,logaction,row_id,json_data) VALUES ($user,'topics','rename','$id','$data');");
	sql_query("UPDATE topics SET txt = '$txt' WHERE id = '$id' ;");
}else if($cls == "Point"){
	$oldrow = sql_to_row("SELECT txt FROM topics WHERE id = '$id';");
	$data = json_encode($oldrow);
	sql_query("INSERT INTO history (user_id,table_name,logaction,row_id,json_data) VALUES ($user,'points','rename','$id','$data');");
	sql_query("UPDATE points SET txt = '$txt' WHERE id = '$id' ;");
}

echo "\n";

json_out($id);

?>
