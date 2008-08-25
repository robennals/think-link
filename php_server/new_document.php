<?php

require_once 'common.php';

$url = postarg("url");
$title = postarg("title");
$author = postarg("author");
$urlExpr = $url . "%";

if (!empty($title) && !empty($author)) {
	sql_query("INSERT INTO documents (url,title,author) VALUES ('$url','$title','$author') ON DUPLICATE KEY UPDATE title='$title',author='$author';");
	sql_query("UPDATE snippets SET title='$title' WHERE url LIKE '$urlExpr';"); // update snippet table
}
else if(!empty($title)) {
	sql_query("INSERT INTO documents (url,title) VALUES ('$url','$title') ON DUPLICATE KEY UPDATE title='$title';");
	sql_query("UPDATE snippets SET title='$title' WHERE url LIKE '$urlExpr';"); // update snippet table
}
else if(!empty($author)) {
	sql_query("INSERT INTO documents (url,author) VALUES ('$url','$author') ON DUPLICATE KEY UPDATE author='$author';");
}

json_out(true);
?>
