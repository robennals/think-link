<?php

// the facebook client library
include_once 'facebook.php';

// some basic library functions
include_once 'lib.php';

// this defines some of your basic setup
include_once 'config.php';

echo "<h2>Hello <fb:name firstnameonly=\"true\" uid=\"$user\" useyou=\"false\"/>!</h2><br/>";
echo "you have uid = $user";


$userinfo = $fb->users_getInfo($user,'name');
echo "you are called ".$userinfo[0]['name'];

$friends = $fb->friends_get();
echo "your friends are:";
foreach($friends as $friend){
	echo "<p>".$friend." - <fb:name uid='$friend'/></p>";	
}


?>
