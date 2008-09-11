//  Copyright 2008 Intel Corporation
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//
//  You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.

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