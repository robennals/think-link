<?php

// Get these from http://developers.facebook.com
$api_key = '9a300c9b0d241b501002440468ad4c40';
$secret  = '8e284e057069aa0986f5595f7beac84c';
/* While you're there, you'll also want to set up your callback url to the url
 * of the directory that contains Footprints' index.php, and you can set the
 * framed page URL to whatever you want.  You should also swap the references
 * in the code from http://apps.facebook.com/footprints/ to your framed page URL. */

$facebook = new Facebook($api_key, $secret);
$facebook->require_frame();
$user = $facebook->require_login();

$appcallbackurl = "http://mashmaker.intel-research.net/thinklink/fb/";

//catch the exception that gets thrown if the cookie has an invalid session_key in it
try {
  if (!$facebook->api_client->users_isAppAdded()) {
    $facebook->redirect($facebook->get_add_url());
  }
} catch (Exception $ex) {
  //this will clear cookies for your application and redirect them to a login prompt
  $facebook->set_user(null, null);
  $facebook->redirect($appcallbackurl);
}

$fb = $facebook->api_client;