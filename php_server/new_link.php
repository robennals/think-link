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

$id = postarg("id"); // destination id
$rel = postarg("rel");
$url = postarg("url");
$sniptext = postarg("sniptxt");
$id2 = postarg("id2"); // source id, could be snippet or point

if($url != null){
	sql_query("INSERT INTO snippets (url,txt) VALUES ('$url','$sniptext')");
	$id2 = mysql_insert_id();
	$linktype = 'sp'; // just created a snippet
}else{
	$linktype = 'pp'; // linking two points
}

sql_query("INSERT INTO links (source_id,howlinked,creator,linktype,destid) VALUES ('$id2','$rel',0,'$linktype','$id');");
json_out(true);
?>

