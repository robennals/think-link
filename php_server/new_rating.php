<?php

require_once 'common.php';


$email = $HTTP_COOKIE_VARS["username"]; 
$pass = $HTTP_COOKIE_VARS["password"];


$snipid = postarg("snippet_id");
$pointid = postarg("point_id");
$rating = postarg("rating"); 

// check user and password
$user = getUser($email,$pass);

sql_query("INSERT INTO ratings (snippet_id,point_id,user_id,rating) VALUES ($snipid,$pointid,$user,$rating) ON DUPLICATE KEY UPDATE rating=$rating;");
json_out(true);
?>

