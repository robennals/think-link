//  Copyright 2008 Intel Corporation
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//
//  You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.

<?php

require_once 'common.php';

$email = $HTTP_COOKIE_VARS["username"]; 
$pass = $HTTP_COOKIE_VARS["password"];
if(!$email){
	$email = postarg("username");
	$pass = postarg("password");
}

$points = postarg("point"); // point ids
$ptext = postarg("ptext"); // point text, optional
$text = postarg("text"); // topic text
$returnPoint = postarg("returnPoint"); // whether want topic id or point id returned

// check user and password
$user = getUser($email,$pass);



// get topic text id
$source = sql_to_array("SELECT id FROM topics WHERE txt='$text'");
if (empty($source)) { 
	$returnPoint = true; // had to make a new topic, so therefore point should exist
	sql_query("INSERT INTO topics (txt,user_id) VALUES ('$text',$user);"); // create new
	$sourceid = mysql_insert_id();
}
else $sourceid=$source[0]['id']; // use existing

// get point  id if only text was given
if (empty($points)) {
	$psource = sql_to_array("SELECT id FROM points WHERE txt='$ptext'");
	if (empty($psource)) { 
		sql_query("INSERT INTO points (txt,user_id) VALUES ('$ptext',$user);"); // create new
		$points = mysql_insert_id();
	}
	else $points=$psource[0]['id']; // use existing
}

$pointArray = explode(",", $points);

foreach ($pointArray as $point) {
	$query = "INSERT IGNORE INTO point_topics (topic_id,point_id,user_id) VALUES ($sourceid,$point,$user);";
	$result = sql_query($query);
	if (mysql_affected_rows() < 1) {json_out(false); return; }
}
if ($returnPoint==1)  { json_out($pointArray[0]); }// return id of point just linked to
else { json_out($sourceid); }// return id of topic just linked to
?>

