<?php

require_once 'common.php';


$email = $HTTP_COOKIE_VARS["username"]; 
$pass = $HTTP_COOKIE_VARS["password"];

// check user and password
$user = getUser($email,$pass);

$text = getarg("text");
// $keywords = explode(" ",$text);

$suggestions = sql_to_array(<<<END
	SELECT id,txt FROM points WHERE 
		MATCH (txt) 
		AGAINST ("$text")
	LIMIT 20
END
);

// get recent points created by user
$recent = getRecentPoints($user);
// get points one hop away from those recent points
$oneHops = array();
foreach ($recent as $point) {
	$oneHopArray = oneHop($point['id']);
	foreach ($oneHopArray as $one) { $oneHops[] = $one['id']; }
}
$oneHops = array_unique($oneHops);
// get points two hops awawy from recent points
$twoHops = twoHop($oneHops);
// combine one hops and two hop, removing duplicates
$both = array_merge($oneHops,array_diff($twoHops,$oneHops));
$recentSuggestions = output($both,$recent);
// get intersection of recent points and textual suggestions
// move intersecting points to beginning of suggetion list
$intersection = array();
foreach ($recentSuggestions as $point) {
	$index = findid($suggestions,$point['id']);
	if ($index>=0) { 
		$intersection[] = $suggestions[$index];
		array_splice($suggestions,$index,1);
	}
}
$weightedSuggestions = array_merge($intersection,$suggestions);
/*
echo "<pre>";
print_r($suggestions);
echo "</pre>";
*/
function getRecentPoints($user) {
	$query = "SELECT DISTINCT point_id AS id,points.txt FROM snippets,points WHERE snippets.user_id=$user AND points.id=point_id ORDER BY snippets.created_at DESC LIMIT 20";
	return sql_to_array($query);
}

function oneHop($pointid) {
	$query = "(
	SELECT point_a_id AS id 
	FROM  point_links 
	WHERE point_b_id =$pointid
	)
	UNION (
	SELECT point_b_id AS id 
	FROM  point_links 
	WHERE point_a_id =$pointid
	) LIMIT 20";
	
	return sql_to_array($query);
}

function twoHop($pointids) {
	$twohops = array();
	foreach ($pointids as $pointid) {
		$result = oneHop($pointid);
		foreach ($result as $one) { $twohops[] = $one['id']; }
	}
	return array_unique($twohops);
}

function output($pointids,$recent) {
	$final = array();
	foreach ($pointids as $pointid) {
		$text = findText($pointid,$recent);
		$temp = array('id'=>$pointid, 'txt'=>$text);
		$final[] = $temp;
	}
	return $final;
}

function findText($pointid,$recent) {
	foreach($recent as $text) {
		if ($text['id']==$pointid) { return $text['txt']; }
	}
	return "";
}

function findid($points,$id) {
	foreach ($points as $index=>$point) {
		if ($point['id']==$id) { return $index; }
	}
	return -1;
}


json_out($weightedSuggestions);
?>