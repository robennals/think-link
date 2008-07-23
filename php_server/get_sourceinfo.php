<?php

require_once 'common.php';

$id = getarg("point_id");

$query = "SELECT id,txt,created_at AS date FROM points WHERE id=$id";

json_out(sql_to_array($query));
?>