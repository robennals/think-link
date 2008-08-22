<?php

require_once 'common.php';

function mkSecret(){
	$passchars = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
	$passwd = "";
	for($i = 0; $i < 10; $i++){
		$rnd = rand(0,strlen($passchars)-1);
		$char = $passchars[$rnd];
		$passwd .= $char;
	}
	return $passwd;
}

$secret = mkSecret();
$name = postarg("name");
$email = postarg("email");
$password = postarg("password");
$pass2 = postarg("password2");

if($password != $pass2){
	error_page("Password does not match confirmed password","signup.html");
}

$already = sql_to_row("SELECT id FROM users WHERE name = '$name';");
if($already != NULL){
	error_page("User $name is alredy in use. Please chose another name.","signup.html");
}

sql_query("INSERT INTO users (name,email,password,secret,status) VALUES ('$name','$email','$password','$secret','pending');");

$from = 'Think Link <noreply@mashmaker.intel-research.net>';
$subject = 'Confirm your Think Link account';
$text = <<<EOF
Hi $name,

Someone (hopefully you) just created a Think Link account linked to this email address.
To confirm your account, please browse to the following URL:

http://mashmaker.intel-research.net/thinklink/confirm.php?secret=$secret
EOF;

#### don't edit below this line

if(!empty($name) && !empty($email) && filter_var($email, FILTER_VALIDATE_EMAIL)) {
	try{
		$to = $email;
		$fp = popen("/usr/sbin/sendmail -t -i -f noreply@mashmaker.intel-research.net", "w");
		fputs($fp,"To: $email\n");
		fputs($fp,"From: $from\n");
		fputs($fp, "Subject: $subject\n\n");
		fputs($fp, $text);
		pclose($fp);
		confirm_page ("We've emailed a confirmation link to $email. Click on this link to confirm your account","signup.html");
	}catch(Exception $ex){
		error_page("Error sending mail to to $email","signup.html");
	}
} else {
	error_page ("We couldn't send email to $email","signup.html");
}

?>
