<?php

require_once 'common.php';

$email = $HTTP_COOKIE_VARS["username"]; 
$pass = $HTTP_COOKIE_VARS["password"];
if(!$email){
	$email = postarg("username");
	$pass = postarg("password");
}

$destid = postarg("destid"); // destination point id
$rel = postarg("rel");
$text = postarg("text"); // source point text

// check user and password
$user = getUser($email,$pass);

// get source text id
$source = sql_to_array("SELECT id FROM points WHERE txt='$text'");
if (empty($source)) { 
	sql_query("INSERT INTO points (txt) VALUES ('$text');"); // create new
	$sourceid = mysql_insert_id();
}
else $sourceid=$source[0]['id']; // use existing

$query = "INSERT INTO point_links (point_a_id,point_b_id,howlinked,user_id) VALUES ('$sourceid','$destid','$rel',$user);";
sql_query($query);

json_out(true);
?>

