<?

$debug = true;
$user = "thinklink";
$password = "thinklink";
$database = "thinklink";
mysql_connect('localhost',$user,$password);
@mysql_select_db($database) or die("Unable to open database");

function error($msg){
	json_out("{\"error\":\"$msg\"}");
	exit;
}

function error_page($msg,$return){
	echo <<<END
		<html>
			<title>Error:$msg</title>
			<body>
				$msg
				<p>
				<a href="$return">go back</a>
			</body>
		</html>
END;
	exit;
}

function confirm_page($msg,$return){
	echo <<<END
		<html>
			<title>$msg</title>
			<body>
				$msg
				<p>
			</body>
		</html>
END;
}

function sql_query($query){
	$result = mysql_query($query);
	if(!$result){
		error("bad query: $query");
	}
	return $result;
}

function sql_to_array($query,$max=10000){
	global $json;
	$result = sql_query($query);
	$res = array();
	$i = 0;
	while(($assoc = mysql_fetch_assoc($result)) && ($i++ < $max)){
		array_push($res,$assoc);
	}
	return $res;
}

function sql_to_row($query){
	$result=sql_query($query);
	return mysql_fetch_assoc($result);
}

function make_orexp($column,$arr){
	$orexp = null;
	if(count($arr) == 0){
		return "true";
	}
	foreach($arr as $item){
		if($orexp == null){
			$orexp = "";
		}else{
			$orexp .= " or ";
		}
		$orexp .= "($column = '$item')";
	}
	return "( $orexp )";
}

function maybe_quote($str){
	if(get_magic_quotes_gpc()){
		return $str;
	}else{
		return mysql_escape_string($str);
	}
}

function getarg($arg){
	return maybe_quote($_GET[$arg]);
}

function json_out($data){
	$json = json_encode($data);
	$cb = getarg("cb");
	if($cb != NULL){
		echo "$cb($json);";
	}else{
		echo $json;
	}
}


function postarg($arg){
	global $debug;
	if(array_key_exists($arg,$_POST)){
		return maybe_quote($_POST[$arg]);
	}else if($debug){
		return getarg($arg); // for easier debug, allow GET access
	}else{
		return null;
	}
}

function getUser($email,$pass) {
	$user = sql_to_array("SELECT id FROM users WHERE email='$email' AND password='$pass'");
	if (empty($user)) { 
		error("// bad login"); 
	}
	return $user[0]['id'];
}

function login(){
	global $HTTP_COOKIE_VARS;
	$email = $HTTP_COOKIE_VARS["username"]; 
	$pass = $HTTP_COOKIE_VARS["password"];
	if(!$email){
		$email = postarg("username");
		$pass = postarg("password");
	}
	$user = getUser($email,$pass);
	return $user;
}

function getDomain($url){
	if(preg_match("/(\w*)\.(com|org|net|info|(\w*\.\w*))(\/|$)/",$url,$matches)){
		return $matches[1] . "." . $matches[2];
	}else{
		echo "// no domain match";
		return null;
	}
}

function getHost($url){
	if(preg_match("/http:\/\/([^\/]*)\//",$url,$matches)){
		return $matches[1];
	}else{
		return null;
	}
}

function pointFromText($text){
	$point = sql_to_array("SELECT id FROM points WHERE txt='$text'");
	if (empty($point)) { 
		sql_query("INSERT INTO points (txt,user_id) VALUES ('$text',$user);"); // create new
		return mysql_insert_id();
	}else{
		return $point[0]['id'];
	}
}

function invertPointLink($rel){
	if($rel == 'supports'){
		return 'opposes';
	}else if($rel == 'opposes'){
		return 'supports';
	}
}

function resolvePoint($id,$rel){
	$link = sql_to_array("
		SELECT * FROM point_links 
		WHERE point_a_id = '$id' AND howlinked = 'opposite' OR howlinked = 'same'
		");
	if(!empty($link)){
		$id = $link[0].point_b_id;
		if($link[1].howlinked == 'opposite'){
			$rel = invertPointLink($rel);
		}
	}
	return array($id,$rel);
}

function getSource($url){
	$domain = getDomain($url);
	$host = getHost($url);
	$sources = sql_to_array("SELECT * FROM sources WHERE domain = '$domain';");
	if(empty($sources)){
		echo "// no source for domain: $domain";
		return null;
	}
	foreach($sources as $source){
		if($source['hostexp'] == "" || preg_match("/".$source['hostexp']."/",$host,$matches)){
			return $source;
		}
	}
	return null;	
}

function getSummary($url,$pagetitle){
	$summary = array('sourcename' => '', 'title' => '', 'source' => 0);
	$source = getSource($url);
	if(!$source){
		echo "// no source matches";
		return $summary;
	}
	$summary['sourcename'] = $source['name'];
	$summary['sourceid'] = $source['id'];
	if(preg_match("/".$source['subjectexp']."/",$pagetitle,$matches)){
		$summary['title'] = $matches[1];
	}else{
		echo "// title does not match";
	}
	return $summary;		
}


?>