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
	sql_query("INSERT INTO snippets (url,txt,user_id,pagetitle,title,source_id,point_id) VALUES ('$url','$sniptext',$user,'$pagetitle','$title','$source','$id')");
	$id2 = mysql_insert_id();
}

sql_query("INSERT INTO snippet_links (snippet_id,howlinked,user_id,point_id) VALUES ('$id2','$rel',$user,'$id');");
echo "\n";
json_out(true);

?>

