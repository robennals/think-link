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
// check user and password
$user = getUser($email,$pass);

$parentid = postarg("parentid");
$txt = postarg("txt");

sql_query("INSERT INTO topics (txt,user_id) VALUES ('$txt',$user)");
$topicid = mysql_insert_id();

if($parentid){
	sql_query("INSERT INTO topic_links (parent_id, child_id, user_id) VALUES ($parentid,$topicid,$user)");
}

sql_query("INSERT INTO bookmark_topics (topic_id,user_id) VALUES ('$topicid','$user');");

echo "\n";

json_out($topicid);

?>