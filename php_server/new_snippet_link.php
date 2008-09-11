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

$id = postarg("point"); // point id
$rel = postarg("rel");
$url = postarg("url");
$urlreal = postarg("urlreal");
$sniptext = postarg("sniptxt");
$id2 = postarg("snippet"); // snippet id
$pagetitle = postarg("title"); // HTML title of the page
//$title = postarg("doctitle"); // document title, like of a pdf
//$author = postarg("author"); // document author, like of a pdf

// check user and password
$user = getUser($email,$pass);

// check if document information exists for this url
// hack for pdf documents
$pdfurl = rtrim($url,substr($url,strrpos($url,"/")+1)); // trim stuff after last slash
$docquery = "SELECT title FROM documents WHERE url='$pdfurl'";
$docArray = sql_to_array($docquery);
if (sizeof($docArray)>0) { $title=$docArray[0]['title']; }

// $domain = getDomain($url);
$summary = getSummary($url,$pagetitle);
$source = $summary['sourceid'];
if (empty($title)) { $title = $summary['title']; }


if($url != null){
	if ($urlreal == null) { $urlreal = $url; }
	//sql_query("INSERT INTO snippets (url,txt,user_id,pagetitle,title,source_id,point_id) VALUES ('$url','$sniptext',$user,'$pagetitle','$title','$source','$id')");
	sql_query("INSERT INTO snippets (url,url_real,txt,user_id,pagetitle,title,source_id,point_id) VALUES ('$url','$urlreal','$sniptext',$user,'$pagetitle','$title','$source','$id')");
	$id2 = mysql_insert_id();
}

sql_query("INSERT INTO snippet_links (snippet_id,howlinked,user_id,point_id) VALUES ('$id2','$rel',$user,'$id');");
sql_query("INSERT IGNORE INTO bookmarks (user_id,snippet_id) VALUES ($user,$id2);");

echo "\n";
json_out(true);

?>

