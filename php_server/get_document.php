<?php

require_once 'common.php';

$url = postarg("url");

$query = "SELECT title,author FROM documents WHERE url='$url'";
json_out(sql_to_array($query));
?>
