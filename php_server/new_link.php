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

