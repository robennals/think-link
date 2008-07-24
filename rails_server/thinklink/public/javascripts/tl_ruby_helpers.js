function bookmark(snippet_id){
	doAJAX("tl_bookmark","new_bookmark.php?snippet="+snippet_id,function(result){
		tl_log("bookmarked: "+snippet_id+","+result);
	});
}
function trash(snippet_id) {
	doAJAX("tl_delete","new_deletion.php?snippet="+snippet_id,function(result){
		tl_log("deleted: "+snippet_id+","+result);
		var parent = document.getElementById("snippet"+snippet_id).parentNode;
		parent.removeChild(document.getElementById("snippet"+snippet_id));
	});
}