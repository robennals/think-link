<?php

require_once 'common.php';


$email = $HTTP_COOKIE_VARS["username"]; 
$pass = $HTTP_COOKIE_VARS["password"];

// check user and password
$user = getUser($email,$pass);

$text = getarg("text");
// $keywords = explode(" ",$text);

if($text && $text != ""){	
$suggestions = sql_to_array(<<<END
	SELECT id,txt FROM topics WHERE 
		MATCH (txt) 
		AGAINST ("$text")
	LIMIT 20
END
);
}else{
	$suggestions = sql_to_array(<<<END
		SELECT topics.id, topics.txt
			FROM topics, points, snippets, point_topics
				WHERE points.id = point_topics.point_id
				AND topics.id = point_topics.topic_id
				AND snippets.point_id = points.id
				AND snippets.user_id = '$user'
			GROUP BY topics.id
			ORDER BY snippets.id DESC
		LIMIT 0 , 30
END
);
}

json_out($suggestions);
?>