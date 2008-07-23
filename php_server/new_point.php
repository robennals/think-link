<?php

require_once 'common.php';

$text = postarg("text");
// $keywords = explode(" ",$text);

$row = sql_to_row("SELECT id FROM points WHERE txt = '$text';");
if($row != NULL){
	json_out($row["id"]);
	exit;
}

sql_query("INSERT INTO points (txt) VALUES ('$text');");

json_out(mysql_insert_id());
?>
