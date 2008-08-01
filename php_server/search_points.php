<?php

require_once 'common.php';


$email = $HTTP_COOKIE_VARS["username"]; 
$pass = $HTTP_COOKIE_VARS["password"];

// check user and password
$user = getUser($email,$pass);

$text = getarg("text");

function getPointlist ($user) {
	$pointlist = array();

	// recent point links created
	$p_plinks = sql_query("(SELECT DISTINCT point_b_id AS p FROM point_links WHERE user_id=$user ORDER BY id DESC LIMIT 10)
							UNION
							(SELECT DISTINCT point_a_id AS p FROM point_links WHERE user_id=$user ORDER BY id DESC LIMIT 10)");
	while ($row = mysql_fetch_row($p_plinks)) {
		$pointlist[] = $row[0];
	}

	// recent points from snippets
	$p_snippet = sql_query("SELECT DISTINCT point_id AS p
							FROM snippets
							WHERE snippets.user_id =$user
							ORDER BY snippets.created_at DESC LIMIT 20");
	while ($row = mysql_fetch_row($p_snippet)) {
		$pointlist[] = $row[0];
	}


	// recent points linked to topics
	$p_ptopics = sql_query("SELECT DISTINCT point_id AS p
							FROM point_topics
							WHERE user_id =$user
							ORDER BY id DESC LIMIT 20");
	while ($row = mysql_fetch_row($p_ptopics)) {
		$pointlist[] = $row[0];
	}


	$pointlist = array_unique($pointlist);
	$points = implode(",",$pointlist);

	// other points from topics recently linked to the above points
	$p_tpoints = sql_query("SELECT DISTINCT point_id as p
							FROM ( SELECT DISTINCT topic_id FROM  point_topics WHERE point_id IN ($points)
								) as sub, point_topics
							WHERE sub.topic_id = point_topics.topic_id LIMIT 20");
	while ($row = mysql_fetch_row($p_tpoints)) {
		$pointlist[] = $row[0];
	}

	return array_unique($pointlist);
}

function compare($a,$b) {
	if ($a['id']===$b['id']) return 0;
	else if ($a['id'] > $b['id']) return 1;
	else return -1;
}


$pointlist = getPointlist($user);
$points = implode(",",$pointlist);

// get full text of points on list
$pointSuggestions = sql_to_array("SELECT id,txt FROM points WHERE id IN ($points)");

// get suggestions from textual search
$textSuggestions = array();
$textpoints = array();
$textSuggestionsResult = sql_query("SELECT id, txt FROM points WHERE MATCH(txt) AGAINST ('$text') LIMIT 20");
while ($row = mysql_fetch_assoc($textSuggestionsResult)) {
	$textSuggestions[] = $row;
	$textpoints[] = $row['id'];
}

// compare text's point list to generated point list
$same = array_uintersect($pointSuggestions,$textSuggestions,"compare");
$reducedTextSugs = array_udiff($textSuggestions,$same,"compare");
$reducedPointSugs = array_udiff($pointSuggestions,$same,"compare");
$weightedSuggestions = array_merge($same,$reducedPointSugs,$reducedTextSugs);


json_out($weightedSuggestions);
?>