<?php

require_once 'common.php';

$email = $HTTP_COOKIE_VARS["username"]; 
$pass = $HTTP_COOKIE_VARS["password"];

//$url = getarg("url");
$limit = getarg("limit");
$id = getarg("id");

// check user and password
$user = getUser($email,$pass);

// get all URLs
$urls = array();
$count = 1;
$url = getarg("url".$count);
while (!empty($url)) {
	$urls[] = "'".$url."'";
	$count++;
	$url = getarg("url".$count);
}
$urlList = implode(",",$urls);

$query = "SELECT * FROM 
	(SELECT * FROM 
	(SELECT snippets.id as id, snippets.txt as snipText, points.txt as pointText, points.id as pointID, snippets.created_at as date, snippets.user_id AS creator, howlinked 
	FROM snippets, points 
	WHERE (url IN ($urlList) OR url_real IN ($urlList)) AND points.id= snippets.point_id 
	AND snippets.id NOT IN (
		SELECT snippet_id AS id 
		FROM deletions
		GROUP BY snippet_id
		HAVING COUNT(user_id) > 2) 
	AND snippets.id NOT IN (
		SELECT snippet_id AS id 
		FROM deletions 
		WHERE user_id=$user)
	) AS q1
	LEFT JOIN 
	(
		(SELECT snippet_id AS bookmark FROM bookmarks WHERE user_id=$user) AS q2
	)
	ON (q1.id = q2.bookmark)) AS part1
	LEFT JOIN
	(
     	(SELECT COUNT(*) AS opposed, point_b_id FROM point_links WHERE howlinked='opposes' GROUP BY point_b_id) AS part2
	)
	ON (part1.pointID=part2.point_b_id)";
	//echo $query;
/*
$query = "SELECT * FROM
	(SELECT snippets.id as id, snippets.txt as snipText, points.txt as pointText, points.id as pointID, snippets.created_at as date, snippets.user_id AS creator, howlinked 
	FROM snippets, points 
	WHERE (url IN ($urlList) OR url_real IN ($urlList)) AND points.id= snippets.point_id 
	AND snippets.id NOT IN (
		SELECT snippet_id AS id 
		FROM deletions
		GROUP BY snippet_id
		HAVING COUNT(user_id) > 2) 
	AND snippets.id NOT IN (
		SELECT snippet_id AS id 
		FROM deletions 
		WHERE user_id=$user)
	) AS q1
	LEFT JOIN 
	(SELECT snippet_id AS bookmark FROM bookmarks WHERE user_id=$user) AS q2
	ON q1.id = q2.bookmark,
	(SELECT COUNT(*) AS opposed, point_b_id AS pointID FROM `point_links` WHERE howlinked='opposes' AND point_b_id=points.id GROUP BY point_b_id)"; 
*/
if($id) {
	$query .= " AND snippets.id=$id";
}

if($limit){
        $query .= " LIMIT $limit";
}


json_out(sql_to_array($query));
?>