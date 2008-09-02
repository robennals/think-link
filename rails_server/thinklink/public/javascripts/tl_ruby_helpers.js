function getChecks(field){
	if(field.checkpoint){
		return field.checkpoint;
	}else{
		var checks = [];
		for(var i = 0; i < field.length; i++){
			if(field[i].checkpoint && field[i].checkpoint.length){
				for(var j = 0; j < field[i].checkpoint.length; j++){
					checks.push(field[i].checkpoint[j]);
				}
			}else if(field[i].checkpoint){
				checks.push(field[i].checkpoint)
			}
		}
		return checks;
	}
}

function checkAll(field)
{
	for (i = 0; i < field.length; i++)
			field[i].checked = true ;
}

function uncheckAll(field)
{
for (i = 0; i < field.length; i++)
	field[i].checked = false ;
}

function getChecked(field)
{
	var result = [];
	for (i = 0; i < field.length; i++) {
		if (field[i].checked) { result.push(field[i].value); }
	}
	return result;
}


function toggleBookmark(snippet_id) {
	var imgElem = document.getElementById("bookstar"+snippet_id);
	
	if (imgElem.src.indexOf("/images/star_empty.png")>=0) { // bookmark and change element properties
		imgElem.src = "/images/star.png";
		doAJAX("tl_bookmark","new_bookmark.php?snippet="+snippet_id,function(result){
			tl_log("bookmarked: "+snippet_id+","+result);
		});
	}
	else { // unbookmark and change element properties
		imgElem.src = "/images/star_empty.png";
		doAJAX("tl_bookmark","new_unbookmark.php?snippet="+snippet_id,function(result){
			tl_log("unbookmarked: "+snippet_id+","+result);
		});
	}
}

function trash(snippet_id) {
	doAJAX("tl_delete","new_deletion.php?snippet="+snippet_id,function(result){
		tl_log("deleted: "+snippet_id+","+result);
		var parent = document.getElementById("snippet"+snippet_id).parentNode;
		parent.removeChild(document.getElementById("snippet"+snippet_id));
	});
}

function trashPoint(point_id) {
	doAJAX("tl_delete","new_point_deletion.php?point="+point_id,function(result){
		tl_log("deleted: "+point_id+","+result);
		var parent = document.getElementById("point"+point_id).parentNode;
		parent.removeChild(document.getElementById("point"+point_id));
	});
}

function toggleDiv(viewid,viewclass,hideids) {
	var elem = document.getElementById(viewid);
	if (elem.className=="hidden") { 
		elem.className = viewclass + " tabMain";
		for (var i=0; i<hideids.length; i++) {
			var elemHide = document.getElementById(hideids[i]);
			elemHide.className = "hidden";
		}
	}
	else {return; }
}

function showTab(view,hides) {
	var viewElem = document.getElementById(view);
	viewElem.className = "tab activeTab";
	for (var i=0; i<hides.length; i++) {
		var hideElem = document.getElementById(hides[i]);
		hideElem.className = "tab";
	}
	
}

function ajaxPost(url, handler) {
    var req = false;
    if (window.XMLHttpRequest) {
        req = new XMLHttpRequest();
    }else if (window.ActiveXObject) {     // IE
        req = new ActiveXObject("Microsoft.XMLHTTP");
    }
    req.open("POST", url, true);
    req.onreadystatechange = function() {
      if (req.readyState == 4 && req.status == 200) {
           handler(req.responseText);
      }
    };
    req.send("");
}

function ajaxReplace(url, id,callback){
		ajaxPost(url,function(response){
			var node = document.getElementById(id);
			node.innerHTML = response;
			if(callback){
				callback();
			}
		});
}
