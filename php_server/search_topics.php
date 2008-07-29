<?php

require_once 'common.php';


$email = $HTTP_COOKIE_VARS["username"]; 
$pass = $HTTP_COOKIE_VARS["password"];

// check user and password
$user = getUser($email,$pass);

$text = getarg("text");
// $keywords = explode(" ",$text);

$suggestions = sql_to_array(<<<END
	SELECT id,txt FROM topics WHERE 
		MATCH (txt) 
		AGAINST ("$text")
	LIMIT 20
END
);



json_out($suggestions);
?>