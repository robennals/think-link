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
