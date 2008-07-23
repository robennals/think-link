<?php

require_once 'common.php';

chdir("/home/rob/www/rob/server/");

$url = getarg("url");
if(!$url){
	$url = "http://ebiquity.umbc.edu/_file_directory_/papers/376.pdf";
}

$dir = substr(md5($url),0,2);
	

echo "<p>checking if we already know this PDF URL</p>";

$row = sql_to_row("SELECT id, dir FROM pdf WHERE url = '$url';");

if(!$row){
	echo "<p>fetching PDF file: $url ...</p>";

	$output = array();
	
	echo exec("whoami");
	echo "<br/>";
	echo exec("pwd");
	echo "<br/>";
	
	echo $dir;
	echo "<br/>";
	
	sql_query("INSERT INTO pdf (dir,url) VALUES ('$dir','$url');");
	$id = mysql_insert_id();	
//	$id = 1;

	echo exec("mkdir pdfs/$dir",$output);
	echo exec("mkdir pdfs/$dir/$id",$output); 		
	echo exec("wget $url -O pdfs/$dir/$id/pdf.pdf",$output);
	
	echo "<p>Converting to HTML ...</p>";
	exec("bin/pdftohtml -c pdfs/$dir/$id/pdf.pdf",$output);
	
	echo "<p>here comes output:</p>";
	echo "<pre>";
	foreach($output as $line){
		echo "$line \n";
	}	
	echo "</pre>";
}else{
	$id = $row['id'];
}

echo "<a href='pdfs/$dir/$id/pdf.html'>go to the PDF</a>";


?>