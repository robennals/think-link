<?php

require_once 'common.php';
$email = $HTTP_COOKIE_VARS["username"]; 
$pass = $HTTP_COOKIE_VARS["password"];
if(!$email){
	$email = postarg("username");
	$pass = postarg("password");
}
$user = getUser($email,$pass);

$destid = postarg("destid"); // destination point id (the one dropped onto)
$sourceid = postarg("sourceid"); // source point id (the one dragged)
$rel = postarg("rel");
$text = postarg("text"); // source point text

// check user and password
$user = getUser($email,$pass);

// get source text id
if(!$sourceid){
	$source = sql_to_array("SELECT id FROM points WHERE txt='$text'");
	if (empty($source)) { 
		sql_query("INSERT INTO points (txt,user_id) VALUES ('$text',$user);"); // create new
		$sourceid = mysql_insert_id();
	}
	else $sourceid=$source[0]['id']; // use existing
}

$outid = $sourceid;

// make sure aren't linking to self
if ($destid==$sourceid) { json_out(false); return; }

if($rel == "supportedby"){
	$rel = "supports";
	$temp = $destid;
	$destid = $sourceid;
	$sourceid = $temp;
}

if($rel == "opposedby"){
	$rel = "opposes";
	$temp = $destid;
	$destid = $sourceid;
	$sourceid = $temp;
}

function getRelPoints($id,$rel) {
	$list = array();
	$query = "SELECT points.id FROM points, point_links WHERE ((point_links.point_a_id=$id AND points.id=point_links.point_b_id) OR (point_links.point_b_id=$id AND points.id=point_links.point_a_id)) AND howlinked='$rel'";
	$result= sql_query($query);
	while($row = mysql_fetch_row($result)) {
		array_push($list,$row[0]);
	}
	return $list;
}

function makeLinks($src,$destArray,$r,$u) {
	foreach ($destArray as $p) {
		if ($p == $src) continue;
		if ($p > $src) {
			$query = "INSERT IGNORE INTO point_links (point_a_id,point_b_id,howlinked,user_id) VALUES ('$src','$p','$r',$u);";		
		}
		else {
			$query = "INSERT IGNORE INTO point_links (point_a_id,point_b_id,howlinked,user_id) VALUES ('$p','$src','$r',$u);";		
		}
		sql_query($query);
	}
} 

$query = "INSERT INTO point_links (point_b_id,point_a_id,howlinked,user_id) VALUES ('$sourceid','$destid','$rel',$user);";
sql_query($query);


if ($rel == "same") {
	$samePoints = getRelPoints($sourceid,"same"); // link me to same-links as source id
	$oppPoints = getRelPoints($sourceid,"opposite"); // link me to opp-links as source id
	$samePoints2 = getRelPoints($destid,"same"); // give source id my same-links
	$oppPoints2 = getRelPoints($destid,"opposite");  // give source id my opp-links

	makeLinks($destid,$samePoints,"same",$user);
	makeLinks($destid,$oppPoints,"opposite",$user);
	makeLinks($sourceid,$samePoints2,"same",$user);
	makeLinks($sourceid,$oppPoints2,"opposite",$user);
}

if ($rel == "opposite") {
	$samePoints = getRelPoints($sourceid,"same"); // link me to same-links as source id
	$oppPoints = getRelPoints($sourceid,"opposite"); // link me to opp-links as source id
	$samePoints2 = getRelPoints($destid,"same"); // give source id my same-links
	$oppPoints2 = getRelPoints($destid,"opposite");  // give source id my opp-links

	makeLinks($destid,$samePoints,"opposite",$user);
	makeLinks($destid,$oppPoints,"same",$user);
	makeLinks($sourceid,$samePoints2,"opposite",$user);
	makeLinks($sourceid,$oppPoints2,"same",$user);
}

json_out($outid); // return id of point just linked to
?>

