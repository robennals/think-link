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
	ON q1.id = q2.bookmark"; 

if($id) {
	$query .= " AND snippets.id=$id";
}

if($limit){
        $query .= " LIMIT $limit";
}


json_out(sql_to_array($query));
?>