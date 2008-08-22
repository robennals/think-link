
var oldselection = null;

function getel(id){
	return document.getElementById(id);
}

function selectItem(div,itemid,divid,cls){
	if(oldselection){
		oldselection.className = "dragitem";		
	}
	div.className = "dragitem dragitem_selected";
	oldselection = div;
	
	var preview_panel = document.getElementById("preview_panel");
	var preview_title = document.getElementById("preview_title");

	if(cls=="Topic"){
		getel("actions_point").className = "hidden";
		getel("actions_folder").className = "actions";	
		getel("preview_container").className = "hidden";
		getel("topics_title").textContent = "More General Folders";
		ajaxReplace("/topics/"+itemid+"/parents","topics_panel");
	}else if(cls=="Point"){
		getel("actions_point").className = "actions";
		getel("actions_folder").className = "hidden";
		getel("preview_container").className = "snippets";
		preview_title.textContent = "Snippets for Selected Point";
		getel("topics_title").textContent = "Topics for Selected Point";
		ajaxReplace("/points/"+itemid+"/snippets","preview_panel");
		ajaxReplace("/points/"+itemid+"/topics","topics_panel");
	}
}

function clearSelect(idnum){
	getel("all-"+idnum).className = "browsetab";	
	getel("recent-"+idnum).className = "browsetab";	
	getel("scratch-"+idnum).className = "browsetab";	
	getel("hot-"+idnum).className = "browsetab";	
	getel("friends-"+idnum).className = "browsetab";	
	getel("search-"+idnum).className = "browsetab";	
	getel("searchbar-"+idnum).className = "hidden";
}

function searchMode(idnum){
	getel("title-"+idnum).textContent = "Search Points";
	getel("searchbar-"+idnum).className = "searchbar";
	clearSelect(idnum);
	getel("search-"+idnum).className = "browsetab browsetab_selected";
	getel("body-"+idnum).innerHTML = "<div class='msg'>Enter search terms above</div>";
}

function searchDo(idnum){
	var query = getel("searchbox-"+idnum).value;
	ajaxReplace("/points/searchajax?query="+query,"body-"+idnum);	
}

function recentMode(idnum){
	getel("title-"+idnum).textContent = "My Recent";
	clearSelect(idnum);
	getel("recent-"+idnum).className = "browsetab browsetab_selected";
	ajaxReplace("/topics/recent","body-"+idnum);

}

