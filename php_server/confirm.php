<?php

require_once 'common.php';

$secret = getarg("secret");

sql_query("UPDATE users SET status = 'active' WHERE secret = '$secret' and status = 'pending'");

confirm_page ("Your account is now confirmed. You can now post snippets and edit the web of ideas","signup.html");

?>
