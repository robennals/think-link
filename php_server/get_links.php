<?php

require_once 'common.php';

$email = $HTTP_COOKIE_VARS["username"]; 
$pass = $HTTP_COOKIE_VARS["password"];

$id = getarg("id");
$rel = getarg("rel");
$limit = getarg("limit");
$snipid = getarg("snippet"); // if appolicable, id of snippet that opened point browser
$snipsize = getarg("snipsize");

// check user and password
$user = getUser($email,$pass);

// hack to move snippets with no ratings to the middle of the list
function findmidpoint($snippet_links) {
	$index =-1;
	while (list($i,$value) = each($snippet_links)) {
		if ($value['rating'] < 2.5) { $index=$i; break; }
	}
	return $index;
}
function findnull($snippet_links) {
	$index =-1;
	while (list($i,$value) = each($snippet_links)) {
		if (empty($value['rating'])) { $index=$i; break; }
	}
	return $index;
}
function moveNulls($snippet_links) {
	$nullIndex = findnull($snippet_links);
	$insertionIndex = findmidpoint($snippet_links);

	if ($nullIndex >0 && $insertionIndex >=0) {
		$nullEntries = array_splice($snippet_links,$nullIndex);
		$lowEntries = array_splice($snippet_links,$insertionIndex);
		
		return array_merge($snippet_links,$nullEntries,$lowEntries);
	}
	else return $snippet_links;
}

function moveSnippet($snippet_links,$snipid) {
	if (empty($snipid)) { return $snippet_links; }

	while (list($i,$value) = each($snippet_links)) {
		if ($value['snippet']==$snipid) { 
			$found = array_splice($snippet_links,$i,1); 
			return array_merge($found,$snippet_links); 
		}
	}
	return $snippet_links;
}



// get point information
//$query1 = "SELECT txt FROM point WHERE id=$id"; 
$query1 = "SELECT txt, agree
			FROM (
			SELECT txt, id
			FROM points
			WHERE id =$id
			) AS q1
			LEFT JOIN (
			SELECT agree, point_id
			FROM point_agreements
			WHERE point_id =$id AND user_id=$user 
			) AS q2 ON q1.id = q2.point_id";

// get point link information
$query2 = "SELECT txt, points.id, howlinked FROM points, point_links WHERE (point_links.point_a_id=$id AND points.id=point_links.point_b_id) OR (point_links.point_b_id=$id AND points.id=point_links.point_a_id)";

// get snippet link information
$query3 = 
	"SELECT rating, txt, url, q1.id AS snippet, howlinked, pagetitle, title, q1.name AS sourcename
	FROM (
	SELECT txt, url, snippets.id, howlinked, pagetitle, title, name
	FROM snippets,sources 
	WHERE point_id=$id AND source_id = sources.id
	) AS q1
	LEFT JOIN (
	SELECT AVG(rating) AS rating, ratings.snippet_id AS snippet_id
	FROM snippets,ratings WHERE ratings.snippet_id=snippets.id AND ratings.point_id=$id
	GROUP BY ratings.snippet_id ORDER BY rating DESC
	) AS q2
	ON q1.id=q2.snippet_id ORDER BY rating DESC";

/*
$query3 = "SELECT txt, url, snippet, howlinked, pagetitle FROM snippet,snippet_links WHERE snippet_links.point=$id AND snippets.id=snippet_links.snippet";

// get snippet rating information
$query4 = "SELECT AVG(rating) AS rating, ratings.snippet_id AS snippet FROM snippet,ratings WHERE ratings.snippet_id=snippet.id AND ratings.point_id=$id GROUP BY ratings.snippet_id ORDER BY rating DESC";
*/

if($rel != NULL){
	//$query .= " AND howlinked = '$rel'";
	$query2 .= " AND howlinked = '$rel'";
	$query3 .= " WHERE howlinked = '$rel'";
}

if($limit){
	//$query .= " LIMIT $limit";
	$query2 .= " LIMIT $limit";
	$query3 .= " LIMIT $limit";
}

// get all queries in arrays
$pointinfo = sql_to_array($query1);
$point_links = sql_to_array($query2);
$snippet_links = moveSnippet(moveNulls(sql_to_array($query3)),$snipid);


$finalArray = array('point_info'=>$pointinfo, 'point_links'=>$point_links,'snip_links'=>$snippet_links);
json_out($finalArray);

//json_out(sql_to_array($query));
?>