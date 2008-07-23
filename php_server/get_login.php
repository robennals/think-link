<?php

require_once 'common.php';

$user = $HTTP_COOKIE_VARS["username"]; 
$password = $HTTP_COOKIE_VARS["password"];

echo "<p>hello $user";
echo "<p>your password is $password";

?>