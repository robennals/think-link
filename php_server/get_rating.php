<?php

require_once 'common.php';

$snipid = getarg("snippet_id");
$pointid = getarg("point_id");

$query = "SELECT SUM(temp.rating)/COUNT(temp.rating) as ratings FROM (SELECT rating FROM `ratings` WHERE snippet_id=$snipid AND point_id=$pointid) as temp";

json_out(sql_to_array($query));
?>